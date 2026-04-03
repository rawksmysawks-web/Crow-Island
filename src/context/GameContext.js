/**
 * GameContext.js — Global game state using React Context + useReducer.
 */

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { LEVELS } from '../data/levels';
import { PANIC_CARD } from '../data/cards';
import { getEventsForLevel, getNextEvent } from '../data/events';
import { initializeGameDeck, drawCards, discardCard } from '../game/DeckEngine';
import { rollRandomEvent } from '../data/randomEvents';
import {
  applyFear,
  decayFear,
  checkFearState,
  applyCrowPressure,
  applyNightPenalty,
  FEAR_MAX,
} from '../game/FearSystem';
import { resolveCard, isAtShelterNode } from '../game/CardEffects';
import { getNextLevel } from '../data/levels';
import { playBackgroundMusic, stopBackgroundMusic, setMuted, resetOneTimeEvents, playSFX } from '../game/AudioManager';
import { formatInGameTime } from '../game/TimeSystem';
import { MOVEMENT_CARDS, getCardById } from '../data/cards';

// ─── Constants ──────────────────────────────────────────────────────────────

const PANIC_FEAR_RESET = 40; // Fear value after a successful panic event

// ─── Initial state ──────────────────────────────────────────────────────────

const makeInitialState = () => ({
  screen: 'title',
  currentLevel: null,
  phase: 'day',
  turnCount: 0,
  fear: 0,
  hasUsedPanic: false,
  isPanic: false,
  crowPressure: 0,
  progress: 0,
  shield: 0,
  bonusHandSize: 0,
  nextDarkReduced: false,
  isReducedVis: false,
  isHallucinating: false,
  deck: [],
  hand: [],
  discardPile: [],
  seenEvents: [],
  activeEvent: null,
  journal: [],
  cardMessage: null,
  hoverMessage: null,
  loseReason: null,
  ending: null,
  isMuted: false,
  jackThought: "Daylight's fading.",
  clues: [],
  lastViewedClueCount: 0,
  journeyLog: [],
  difficulty: 'medium', // 'easy' | 'medium' | 'hard'
});

// ─── Helpers ────────────────────────────────────────────────────────────────

const computeEnding = (fear, clueCount = 0) => {
  if (clueCount >= 7) return 'true'; // Found almost everything
  if (fear <= 30) return 'good';
  if (fear <= 65) return 'escape';
  return 'dark';
};

const DIFFICULTY_SCALING = {
  easy:   { goal: 0.5,  fear: 0.6,  deck: 45 },
  medium: { goal: 0.8,  fear: 0.85, deck: 35 },
  hard:   { goal: 1.0,  fear: 1.0,  deck: 30 },
};

// ─── Reducer ────────────────────────────────────────────────────────────────

const gameReducer = (state, action) => {
  switch (action.type) {

    // ── START_GAME ────────────────────────────────────────────────────────────
    case 'START_GAME': {
      resetOneTimeEvents();
      const firstLevel = LEVELS[0];
      const scaling = DIFFICULTY_SCALING[state.difficulty || 'medium'];
      const { deck, hand, discardPile } = initializeGameDeck(firstLevel, scaling.deck);
      const initialEntry = {
        id: 'arrival_notes',
        title: 'Arrival Notes',
        body: firstLevel.intro,
        timestamp: '6:00 PM',
      };
      return { 
        ...state, 
        screen: 'story',
        currentLevel: firstLevel,
        deck,
        hand,
        discardPile,
        journal: [initialEntry],
        clues: ['clue_dispatch_letter'],
        journeyLog: [{ type: 'level_start', title: firstLevel.name, levelId: firstLevel.id }],
      };
    }

    // ── BEGIN_LEVEL ───────────────────────────────────────────────────────────
    case 'BEGIN_LEVEL': {
      const level = action.level ?? state.currentLevel ?? LEVELS[0];
      // NO NEW DECK. We use the global deck initialized in START_GAME.
      return {
        ...state,
        screen: 'game',
        currentLevel: level,
        phase: level.phase === 'night' ? 'night' : 'day',
        turnCount: 0,
        fear: state.fear,
        hasUsedPanic: state.hasUsedPanic,
        isPanic: false,
        crowPressure: 0,
        progress: 0,
        shield: state.shield, // preserve shield across levels
        bonusHandSize: state.bonusHandSize,
        nextDarkReduced: false,
        isReducedVis: false,
        isHallucinating: false,
        // Preserve deck/hand/discard
        seenEvents: [],
        activeEvent: null,
        cardMessage: null,
        hoverMessage: null,
        loseReason: null,
        jackThought: "Looking for answers...",
        journeyLog: [...state.journeyLog, { type: 'level_start', title: level.name, levelId: level.id }],
      };
    }

    // ── NEXT_LEVEL ────────────────────────────────────────────────────────────
    case 'NEXT_LEVEL': {
      const { currentLevel } = state;
      if (!currentLevel) return state;

      // NO NEW DECK. Preseve existing state.
      return {
        ...state,
        screen: 'game',
        phase: currentLevel.phase,
        progress: 0,
        turnCount: 0,
        bonusHandSize: state.bonusHandSize,
        fear: Math.max(0, state.fear - 15), // Slight relief reaching a new area
        crowPressure: 0,
        seenEvents: [],
        activeEvent: null,
        // hand, deck, discardPile are kept same as they were
        jackThought: currentLevel.number > 0 ? "Looking for an exit." : "Looking for answers...",
        journeyLog: [...state.journeyLog, { type: 'level_start', title: currentLevel.name, levelId: currentLevel.id }],
      };
    }

    // ── PLAY_CARD ─────────────────────────────────────────────────────────────
    case 'PLAY_CARD': {
      const { card } = action;
      const { currentLevel: level, hand, deck, discardPile, seenEvents, fear: startFear, crowPressure: startPressure } = state;

      if (!level) return state;

      // Resolve the card
      const delta = resolveCard(card, state, level);

      // Jack's thought update based on card play
      let newJackThought = state.jackThought;
      if (card.type === 'light') newJackThought = "The light... it helps.";
      if (card.type === 'movement') newJackThought = "Just keep walking.";
      if (card.type === 'dark') newJackThought = "Something's not right...";

      // Compute effective phase
      const effectivePhase = level.phase;

      // Apply fear
      const scaling = DIFFICULTY_SCALING[state.difficulty || 'medium'];
      let baseFear = applyFear(state.fear, delta.fearDelta * scaling.fear, effectivePhase, level);
      let peakFearReached = baseFear >= FEAR_MAX;
      
      let newFear = decayFear(baseFear, level, effectivePhase);
      newFear = applyNightPenalty(newFear, level, effectivePhase);
      if (newFear >= FEAR_MAX) peakFearReached = true;

      // Crow pressure
      let { pressure: newCrowPressure, captured } = applyCrowPressure(
        state.crowPressure,
        delta.crowPressureDelta * scaling.fear, // scale pressure growth too
        effectivePhase,
        level,
      );

      // Shield
      let newShield = Math.max(0, state.shield + (delta.shieldDelta ?? 0));

      const progressMultiplier = 1 / scaling.goal; // easy = 2.0x faster bar fill (0.5 goal)
      const progressMove = ((delta.progressDelta ?? 0) / level.progressGoal) * 100 * progressMultiplier;
      const rawProgress = state.progress + progressMove;
      let newProgress = Math.min(100, Math.max(0, rawProgress));
      
      let newBonusHandSize = state.bonusHandSize;

      // Turn count and phase update
      const newTurnCount = state.turnCount + 1;
      const newPhase = level.phase;

      // Discard and Draw
      const instanceId = card.instanceId || card.id;
      const afterDiscard = discardCard(hand, discardPile, instanceId);
      
      const targetHandSize = (level.handSize || 4) + newBonusHandSize;
      const cardsToDraw = targetHandSize - afterDiscard.hand.length;
      
      const shouldPanic = newFear > 85 && Math.random() > 0.5 && card.id !== 'panic';
      let afterDraw;
      
      if (shouldPanic && cardsToDraw > 0) {
        afterDraw = {
          deck: afterDiscard.deck ?? deck,
          hand: [...afterDiscard.hand, { ...PANIC_CARD, instanceId: `panic_${Date.now()}` }],
          discardPile: afterDiscard.discardPile,
        };
        if (cardsToDraw > 1) {
          afterDraw = drawCards(afterDraw.deck, afterDraw.hand, afterDraw.discardPile, cardsToDraw - 1, false);
        }
      } else if (cardsToDraw > 0) {
        afterDraw = drawCards(afterDiscard.deck ?? deck, afterDiscard.hand, afterDiscard.discardPile, cardsToDraw, false);
      } else {
        afterDraw = {
          deck: afterDiscard.deck ?? deck,
          hand: afterDiscard.hand,
          discardPile: afterDiscard.discardPile,
        };
      }
      
      // ── Victory First Check ──────────────────────────────────────────────────
      if (newProgress >= 100) {
        const nextLevel = getNextLevel(level.id);

        if (!nextLevel) {
          return {
            ...state,
            screen: 'win',
            progress: 100,
            fear: newFear,
            ending: computeEnding(newFear, state.clues.length),
          };
        }
        return {
          ...state,
          progress: 100,
          fear: newFear,
          screen: 'level_intro',
          currentLevel: nextLevel,
        };
      }

      // ── Check for Isolation (Resource Depletion) ───────────────────────────
      if (afterDraw.hand.length === 0 && afterDraw.deck.length === 0 && newProgress < 100) {
        return {
          ...state,
          fear: newFear,
          progress: newProgress,
          crowPressure: newCrowPressure,
          screen: 'game_over',
          loseReason: 'abandoned',
          deck: [],
          hand: [],
        };
      }

      // Handle special effects
      let isHallucinating = state.isHallucinating;
      let isReducedVis = state.isReducedVis;
      let nextDarkReduced = state.nextDarkReduced;

      if (delta.special === 'hallucinate') isHallucinating = true;
      if (delta.special === 'reduce_visibility') isReducedVis = true;
      if (delta.special === 'reduce_next_dark') nextDarkReduced = true;

      if (state.isHallucinating && card.type !== 'dark') isHallucinating = false;
      if (state.isReducedVis && card.type !== 'dark') isReducedVis = false;

      // ── Random Events ───────────────────────────────────────────────────────
      let randomEvent = null;
      let eventMessage = null;
      if (card.type === 'movement') {
         randomEvent = rollRandomEvent(newPhase);
         if (randomEvent) {
            const scaling = DIFFICULTY_SCALING[state.difficulty || 'medium'];
            newFear = applyFear(newFear, randomEvent.effect.fearDelta * scaling.fear, effectivePhase, level);
            if (newFear >= FEAR_MAX) peakFearReached = true;
            const progressMultiplier = 1 / scaling.goal;
            const eventMove = (randomEvent.effect.progressDelta / level.progressGoal) * 100 * progressMultiplier;
            newProgress = Math.min(100, Math.max(0, newProgress + eventMove));
           const ce = applyCrowPressure(newCrowPressure, randomEvent.effect.crowPressure, effectivePhase, level);
           newCrowPressure = ce.pressure;
           eventMessage = randomEvent.message;
           
           if (randomEvent.effect.cardRewardDelta) {
             const rewardAmt = randomEvent.effect.cardRewardDelta;
             newBonusHandSize += rewardAmt;
             for (let i = 0; i < rewardAmt; i++) {
               const randomMove = MOVEMENT_CARDS[Math.floor(Math.random() * MOVEMENT_CARDS.length)];
               const bonusCard = { ...randomMove, instanceId: `bonus_${Date.now()}_${i}` };
               // Insert randomly into deck
               afterDraw.deck.splice(Math.floor(Math.random() * (afterDraw.deck.length + 1)), 0, bonusCard);
             }
             // Discovery IS allowed for exploration/event rewards
             afterDraw = drawCards(afterDraw.deck, afterDraw.hand, afterDraw.discardPile, rewardAmt, true);
           }
         }
      }

      // Win check was moved up to prioritize victory over failure
      

      if (captured) {
        // Survival Safety Net
        if (startFear < 60 && startPressure < 60) {
          newCrowPressure = 88; // Just below the new 90 threshold
          delta.message = "The wings passed inches from your head... a narrow escape!";
        } else {
          return { ...state, screen: 'game_over', loseReason: 'crow_capture', crowPressure: newCrowPressure };
        }
      }

      if (peakFearReached) {
        if (newShield > 0) {
           newShield -= 1;
           newFear = 75; 
           delta.message = delta.message || "A shield shattered! You narrowly avoided panic.";
        } else if (startFear < 60 && startPressure < 60) {
           // Survival Safety Net
           newFear = 95;
           delta.message = "Your heart nearly stopped... but you forced yourself to stay silent.";
        } else {
           return { ...state, screen: 'game_over', loseReason: 'fear_overload', fear: FEAR_MAX };
        }
      }

      const levelEvents = getEventsForLevel(level.id);
      const nextEvent = getNextEvent(levelEvents, newProgress, seenEvents);
      let newSeenEvents = [...seenEvents];
      let activeEvent = state.activeEvent;
      let newJournal = [...state.journal];

      let newClues = [...state.clues];
      if (nextEvent) {
        newSeenEvents = [...seenEvents, nextEvent.id];
        activeEvent = {
          ...nextEvent,
          timestamp: formatInGameTime(newPhase, newProgress),
        };
        if (nextEvent.isJournal) newJournal = [...newJournal, nextEvent];
        if (nextEvent.clueId && !newClues.includes(nextEvent.clueId)) {
          newClues.push(nextEvent.clueId);
          if (newClues.length === 10) {
            newJournal = [...newJournal, {
              id: 'all_clues_found',
              title: 'The Truth',
              body: "That's it. That's the whole truth. There is nothing left for me here. I need to get back to the boat.",
              timestamp: formatInGameTime(newPhase, newProgress),
            }];
            newJackThought = "I have everything. Time to go.";
          }
        }
        if (nextEvent.id === 'arrival_shore') {
           newJackThought = "Looking for an exit.";
        }
      } else if (randomEvent) {
        activeEvent = {
           id: randomEvent.id,
           title: randomEvent.name,
           text: randomEvent.message,
           asset: randomEvent.asset || (randomEvent.type === 'good' ? 'campfire' : 'scratched_floor'),
           timestamp: formatInGameTime(newPhase, newProgress),
           buttons: [{ text: 'Continue', action: 'DISMISS_EVENT' }]
        };
      }

      let newJourneyLog = [...state.journeyLog];
      newJourneyLog.push({ type: 'card', name: card.name || card.title, turn: newTurnCount, level: level.name });
      if (nextEvent) {
          newJourneyLog.push({ type: 'event', title: nextEvent.title || nextEvent.id });
          if (newClues.length === 10 && state.clues.length === 9) {
             newJourneyLog.push({ type: 'milestone', title: 'All Evidence Gathered' });
          }
      } else if (randomEvent) {
          newJourneyLog.push({ type: 'event', title: randomEvent.name });
      }

      return {
        ...state,
        fear: newFear,
        crowPressure: newCrowPressure,
        progress: newProgress,
        shield: newShield,
        bonusHandSize: newBonusHandSize,
        turnCount: newTurnCount,
        phase: newPhase,
        deck: afterDraw.deck,
        hand: afterDraw.hand,
        discardPile: afterDraw.discardPile,
        seenEvents: newSeenEvents,
        activeEvent,
        journal: newJournal,
        clues: newClues,
        journeyLog: newJourneyLog,
        cardMessage: delta.message || eventMessage,
        jackThought: newJackThought,
      };
    }

    // ── DRAW_CARDS ────────────────────────────────────────────────────────────
    case 'DRAW_CARDS': {
      const result = drawCards(state.deck, state.hand, state.discardPile, action.n ?? 1, false);
      return { ...state, ...result };
    }

    // ── SWAP_CARD ─────────────────────────────────────────────────────────────
    case 'SWAP_CARD': {
      const { cardId } = action;
      const { currentLevel: level, hand, deck, discardPile, fear, shield } = state;
      if (!level) return state;

      let newFear = Math.min(FEAR_MAX, fear + 2); // Always +2 fear as requested
      let newShield = shield;
      let msg = `Swapping cards... the tension in the air is thick.`;
      
      if (newFear >= FEAR_MAX) {
        if (newShield > 0) {
          newShield -= 1;
          newFear = 75;
          msg = "Panic nearly took you... but a shield broke the fall.";
        } else {
          return { ...state, screen: 'game_over', loseReason: 'fear_overload', fear: FEAR_MAX };
        }
      }

      const newTurnCount = state.turnCount + 1;
      const afterDiscard = discardCard(hand, discardPile, cardId);
      const afterDraw = drawCards(afterDiscard.deck ?? deck, afterDiscard.hand, afterDiscard.discardPile, 1, false);

      return {
        ...state,
        fear: newFear,
        shield: newShield,
        turnCount: newTurnCount,
        deck: afterDraw.deck,
        hand: afterDraw.hand,
        discardPile: afterDraw.discardPile,
        cardMessage: msg,
        jackThought: "Gotta find better tools.",
      };
    }

    // ── THINK ─────────────────────────────────────────────────────────────────
    case 'THINK': {
      const { currentLevel: level, phase, fear, crowPressure, progress, hand, deck, discardPile } = state;
      if (!level) return state;

      const effects = [
        { msg: "A moment of clarity.", fear: -8, progress: 2, pressure: 0, thought: "I can do this." },
        { msg: "You spot a trail marker.", fear: 0, progress: 5, pressure: 0, thought: "There! A sign." },
        { msg: "Did something move?", fear: 10, progress: 0, pressure: 5, thought: "What was that noise?" },
        { msg: "The isolation sinks in.", fear: 5, progress: 0, pressure: 0, thought: "I'm so alone out here." },
        { msg: "A deep breath.", fear: -10, progress: 0, pressure: 0, thought: "Gotta get a grip." },
      ];
      
      const effect = effects[Math.floor(Math.random() * effects.length)];
      const scaling = DIFFICULTY_SCALING[state.difficulty || 'medium'];
      let newFear = Math.min(FEAR_MAX, Math.max(0, fear + (effect.fear * scaling.fear) + (phase === 'night' ? 5 : 0)));
      const progressMultiplier = 1 / scaling.goal;
      const thinkMove = (effect.progress / level.progressGoal) * 100 * progressMultiplier;
      let newProgress = Math.min(100, progress + thinkMove);
      let newPressure = Math.min(level.crowMaxPressure, crowPressure + effect.pressure);
      let newShield = state.shield;
      let msg = effect.msg;

      if (newFear >= FEAR_MAX) {
        if (newShield > 0) {
           newShield -= 1;
           newFear = 75;
           msg = "Panic nearly took you... but a shield broke the fall.";
        } else {
           return { ...state, screen: 'game_over', loseReason: 'fear_overload', fear: FEAR_MAX };
        }
      }
      
      const afterDraw = drawCards(deck, hand, discardPile, 1, false);
      const newTurnCount = state.turnCount + 1;

      return {
        ...state,
        ...afterDraw,
        fear: newFear,
        progress: newProgress,
        crowPressure: newPressure,
        shield: newShield,
        turnCount: newTurnCount,
        cardMessage: msg,
        jackThought: effect.thought,
      };
    }

    case 'MAKE_CHOICE': {
      const { choice } = action;
      const { effect } = choice;
      const { currentLevel: level } = state;

      let newFear = applyFear(state.fear, effect.fearDelta || 0, state.phase, level);
      let newShield = state.shield;

      if (newFear >= FEAR_MAX) {
        if (newShield > 0) {
          newShield -= 1;
          newFear = 75;
        } else {
          return { ...state, screen: 'game_over', loseReason: 'fear_overload', fear: FEAR_MAX };
        }
      }

      const { pressure: newCrowPressure } = applyCrowPressure(
        state.crowPressure,
        effect.crowPressureDelta || 0,
        state.phase,
        level,
      );

      const scaling = DIFFICULTY_SCALING[state.difficulty || 'medium'];
      const progressMultiplier = 1 / scaling.goal;
      const choiceMove = ((effect.progressDelta || 0) / level.progressGoal) * 100 * progressMultiplier;
      const newProgress = Math.min(100, Math.max(0, state.progress + choiceMove));
      
      let newJournal = [...state.journal];
      if (effect.journal) {
        newJournal.push({
          id: `choice_${Date.now()}`,
          title: 'Investigation Note',
          body: effect.journal,
          timestamp: formatInGameTime(state.phase, newProgress),
        });
      }

      let newClues = [...state.clues];
      let newJourneyLog = [...state.journeyLog];
      newJourneyLog.push({ type: 'choice', title: choice.text });

      if (effect.clueId && !newClues.includes(effect.clueId)) {
        newClues.push(effect.clueId);
        if (newClues.length === 10) {
           newJournal.push({
              id: 'all_clues_found',
              title: 'The Truth',
              body: "That's it. That's the whole truth. There is nothing left for me here. I need to get back to the boat.",
              timestamp: formatInGameTime(state.phase, newProgress),
           });
           newJourneyLog.push({ type: 'milestone', title: 'All Evidence Gathered' });
        }
      }

      // Story-based Card Discovery Scaling
      let afterDraw = { deck: state.deck, hand: state.hand, discardPile: state.discardPile };
      if (effect.cardRewardDelta) {
         const rewardAmt = effect.cardRewardDelta;
         let newBonusHandSize = state.bonusHandSize + rewardAmt;
         // logic to draw card...
      }

      return {
        ...state,
        fear: newFear,
        crowPressure: newCrowPressure,
        progress: newProgress,
        shield: newShield,
        journal: newJournal,
        clues: newClues,
        journeyLog: newJourneyLog,
        activeEvent: null,
        jackThought: newClues.length === 10 ? "I have everything. Time to go." : (effect.journal ? "Better write this down." : state.jackThought),
      };
    }
    
    case 'SET_SCREEN': return { ...state, screen: action.screen };
    case 'SET_DIFFICULTY': return { ...state, difficulty: action.difficulty };

    case 'DISMISS_EVENT': return { ...state, activeEvent: null };

    case 'TOGGLE_MUTE': {
      const newMuted = !state.isMuted;
      setMuted(newMuted);
      return { ...state, isMuted: newMuted };
    }

    case 'TOGGLE_PAUSE': return { ...state, screen: state.screen === 'pause' ? 'game' : 'pause' };
    case 'TOGGLE_JOURNAL': return { 
      ...state, 
      screen: state.screen === 'journal' ? 'game' : 'journal' 
    };
    case 'ACK_CLUES': return { ...state, lastViewedClueCount: state.clues.length };
    case 'RESTART': 
      resetOneTimeEvents();
      return makeInitialState();

    case 'HOVER_CARD':
      return { ...state, hoverMessage: action.card.flavorText };
    case 'UNHOVER_CARD':
      return { ...state, hoverMessage: null };

    default: return state;
  }
};

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, makeInitialState());

  const startGame = useCallback(() => {
    playBackgroundMusic();
    dispatch({ type: 'START_GAME' });
  }, []);

  const beginLevel = useCallback((level) => dispatch({ type: 'BEGIN_LEVEL', level }), []);
  const playCard = useCallback((card) => dispatch({ type: 'PLAY_CARD', card }), []);
  const drawMoreCards = useCallback((n = 1) => dispatch({ type: 'DRAW_CARDS', n }), []);
  const makeChoice = useCallback((choice) => dispatch({ type: 'MAKE_CHOICE', choice }), []);
  const dismissEvent = useCallback(() => dispatch({ type: 'DISMISS_EVENT' }), []);
  const nextLevel = useCallback(() => dispatch({ type: 'NEXT_LEVEL' }), []);
  const panicSuccess = useCallback(() => dispatch({ type: 'PANIC_SUCCESS' }), []);
  const panicFail = useCallback(() => dispatch({ type: 'PANIC_FAIL' }), []);
  const togglePause = useCallback(() => {
    playSFX('click');
    dispatch({ type: 'TOGGLE_PAUSE' });
  }, []);
  const toggleJournal = useCallback(() => {
    playSFX('scribble');
    dispatch({ type: 'TOGGLE_JOURNAL' });
  }, []);
  const restart = useCallback(() => dispatch({ type: 'RESTART' }), []);
  const swapCard = useCallback((cardId) => dispatch({ type: 'SWAP_CARD', cardId }), []);
  const setScreen = useCallback((screen) => dispatch({ type: 'SET_SCREEN', screen }), []);
  const setDifficulty = useCallback((difficulty) => dispatch({ type: 'SET_DIFFICULTY', difficulty }), []);
  const think = useCallback(() => dispatch({ type: 'THINK' }), []);
  const toggleMute = useCallback(() => dispatch({ type: 'TOGGLE_MUTE' }), []);
  const hoverCard = useCallback((card) => dispatch({ type: 'HOVER_CARD', card }), []);
  const unhoverCard = useCallback(() => dispatch({ type: 'UNHOVER_CARD' }), []);

  const value = useMemo(() => ({
    state,
    dispatch,
    startGame,
    beginLevel,
    playCard,
    drawMoreCards,
    makeChoice,
    dismissEvent,
    nextLevel,
    panicSuccess,
    panicFail,
    togglePause,
    toggleJournal,
    restart,
    swapCard,
    setScreen,
    setDifficulty,
    think,
    toggleMute,
    hoverCard,
    unhoverCard,
    playBackgroundMusic,
    stopBackgroundMusic,
  }), [state, startGame, beginLevel, playCard, drawMoreCards, makeChoice, dismissEvent, nextLevel, panicSuccess, panicFail, togglePause, toggleJournal, restart, swapCard, setScreen, setDifficulty, think, toggleMute, hoverCard, unhoverCard]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
};

export default GameContext;
