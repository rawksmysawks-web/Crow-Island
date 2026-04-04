/**
 * GameContext.js — Global game state using React Context + useReducer.
 */

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { LEVELS, getNextLevel } from '../data/levels';
import { PANIC_CARD } from '../data/cards';
import { getEventsForLevel, getNextEvent } from '../data/events';
import { buildLevelDeck, drawCards, discardCard, shuffle } from '../game/DeckEngine';
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
import { playBackgroundMusic, stopBackgroundMusic, setMuted, playSFX } from '../game/AudioManager';
import { formatInGameTime } from '../game/TimeSystem';

// ─── Constants ──────────────────────────────────────────────────────────────

const PANIC_FEAR_RESET = 40; 

// Difficulty scaling factors
const DIFFICULTY_SCALING = {
  easy:   { fear: 0.7, goal: 0.8, pressure: 0.7 },
  medium: { fear: 1.0, goal: 1.0, pressure: 1.0 },
  hard:   { fear: 1.3, goal: 1.2, pressure: 1.3 },
};

// ─── Initial state ──────────────────────────────────────────────────────────

const makeInitialState = () => ({
  screen: 'title',
  difficulty: 'medium',
  currentLevel: null,
  phase: 'day',
  turnCount: 0,
  fear: 0,
  hasUsedPanic: false,
  isPanic: false,
  crowPressure: 0,
  progress: 0,
  shield: 0,
  nextDarkReduced: false,
  isReducedVis: false,
  isHallucinating: false,
  deck: [],
  hand: [],
  discardPile: [],
  seenEvents: [],
  activeEvent: null,
  journal: [],      // Clue descriptions/narrative
  clues: [],        // Found clue IDs
  lastViewedClueCount: 0,
  journeyLog: [],   // Event history for win screen
  cardMessage: null,
  jackThought: "I shouldn't be here.",
  loseReason: null,
  ending: null,
  isMuted: false,
  lastAction: null,
  bonusHandSize: 0,
});

// ─── Helpers ────────────────────────────────────────────────────────────────

const computeEnding = (fear) => {
  if (fear <= 30) return 'good';
  if (fear <= 65) return 'escape';
  return 'dark';
};

// ─── Reducer ────────────────────────────────────────────────────────────────

const gameReducer = (state, action) => {
  switch (action.type) {

    case 'SET_SCREEN': return { ...state, screen: action.screen };
    case 'SET_DIFFICULTY': return { ...state, difficulty: action.difficulty };

    case 'START_GAME': {
      playBackgroundMusic();
      const firstLevel = LEVELS[0];
      return { 
        ...state, 
        screen: 'story',
        journal: [{
          id: 'arrival',
          title: 'Arrival',
          body: "The ferry dropped me at the decaying wooden dock an hour ago... I need to find whoever sent that message.",
          timestamp: '6:00 PM'
        }]
      };
    }

    case 'BEGIN_LEVEL': {
      const level = action.level ?? LEVELS[0];
      const { deck, hand, discardPile } = buildLevelDeck(level);
      return {
        ...state,
        screen: 'game',
        currentLevel: level,
        phase: level.phase === 'night' ? 'night' : 'day',
        turnCount: 0,
        fear: state.fear, 
        crowPressure: 0,   
        progress: 0,
        shield: 0,
        deck,
        hand,
        discardPile,
        seenEvents: [],
        activeEvent: null,
        cardMessage: null,
        jackThought: level.number === 1 ? "Just a quick search. Then I'm gone." : "It's getting darker.",
        loseReason: null,
        lastAction: null,
      };
    }

    case 'PLAY_CARD': {
      const { card } = action;
      const { currentLevel: level, hand, deck, discardPile, seenEvents, difficulty } = state;
      if (!level) return state;

      const scaling = DIFFICULTY_SCALING[difficulty || 'medium'];

      // 1. Resolve card effects
      const delta = resolveCard(card, state, level);
      const effectivePhase = level.phase;

      // 2. Apply Fear (with difficulty scaling)
      let fDelta = delta.fearDelta * scaling.fear;
      let newFear = applyFear(state.fear, fDelta, effectivePhase, level);
      newFear = decayFear(newFear, level, effectivePhase);
      newFear = applyNightPenalty(newFear, level, effectivePhase);

      // 3. Apply Crow Pressure (with difficulty scaling)
      let pDelta = delta.crowPressureDelta * scaling.pressure;
      let { pressure: newCrowPressure, captured } = applyCrowPressure(
        state.crowPressure,
        pDelta,
        effectivePhase,
        level,
      );

      // 4. Progress (with difficulty scaling)
      // v2 uses a multiplier system based on progressGoal
      const progressMultiplier = 1 / scaling.goal;
      const moveAmount = (delta.progressDelta / level.progressGoal) * 100 * progressMultiplier;
      let newProgress = Math.min(100, Math.max(0, state.progress + moveAmount));

      // 5. Shield
      let newShield = Math.max(0, state.shield + (delta.shieldDelta ?? 0));

      // 6. Turn count
      const newTurnCount = state.turnCount + 1;

      // 7. Discard and Draw
      const afterDiscard = discardCard(hand, discardPile, card.instanceId);
      const targetHandSize = (level.handSize || 5) + state.bonusHandSize;
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
          afterDraw = drawCards(afterDraw.deck, afterDraw.hand, afterDraw.discardPile, cardsToDraw - 1);
        }
      } else if (cardsToDraw > 0) {
        afterDraw = drawCards(afterDiscard.deck ?? deck, afterDiscard.hand, afterDiscard.discardPile, cardsToDraw);
      } else {
        afterDraw = {
          deck: afterDiscard.deck ?? deck,
          hand: afterDiscard.hand,
          discardPile: afterDiscard.discardPile,
        };
      }

      // -- Failure Checks --
      if (afterDraw.hand.length === 0 && afterDraw.deck.length === 0 && newProgress < 100) {
        return { ...state, fear: newFear, progress: newProgress, screen: 'game_over', loseReason: 'fear_overload' };
      }
      if (captured) {
        return { ...state, screen: 'game_over', loseReason: 'crow_capture', crowPressure: newCrowPressure };
      }
      if (newFear >= FEAR_MAX) {
        if (newShield > 0) {
           newShield -= 1;
           newFear = 75;
        } else {
           return { ...state, screen: 'game_over', loseReason: 'fear_overload', fear: FEAR_MAX };
        }
      }

      // -- Random Events (Choice-based) --
      let activeEventData = null;
      let eventMessage = null;
      if (card.type === 'movement') {
        const randomEvent = rollRandomEvent(effectivePhase);
        if (randomEvent) {
          if (randomEvent.choices) {
            activeEventData = { ...randomEvent, title: randomEvent.name, text: randomEvent.message, icon: '⚠️' };
          } else {
            // Apply simple random event
            newFear = applyFear(newFear, randomEvent.effect?.fearDelta ?? 0, effectivePhase, level);
            newProgress = Math.min(100, Math.max(0, newProgress + (randomEvent.effect?.progressDelta ?? 0)));
            const ce = applyCrowPressure(newCrowPressure, randomEvent.effect?.crowPressure ?? 0, effectivePhase, level);
            newCrowPressure = ce.pressure;
            eventMessage = randomEvent.message;
          }
        }
      }

      // -- Win / Advance Check --
      if (newProgress >= 100) {
        const nextLevel = getNextLevel(level.id);
        if (!nextLevel) {
          return { ...state, screen: 'win', progress: 100, fear: newFear, ending: computeEnding(newFear) };
        }
        return { ...state, progress: 100, fear: newFear, screen: 'level_intro', currentLevel: nextLevel };
      }

      // -- Story Events --
      const levelEvents = getEventsForLevel(level.id);
      const nextEvent = getNextEvent(levelEvents, newProgress, state.seenEvents);
      let newSeenEvents = [...state.seenEvents];
      let newJournal = [...state.journal];
      let activeEvent = activeEventData;

      if (nextEvent) {
        newSeenEvents.push(nextEvent.id);
        activeEvent = nextEvent;
        if (nextEvent.isJournal) {
          newJournal.push({
            id: nextEvent.id,
            title: nextEvent.title,
            body: nextEvent.text,
            timestamp: formatInGameTime(effectivePhase, newProgress),
          });
        }
      }

      return {
        ...state,
        fear: newFear,
        crowPressure: newCrowPressure,
        progress: newProgress,
        shield: newShield,
        turnCount: newTurnCount,
        deck: afterDraw.deck,
        hand: afterDraw.hand,
        discardPile: afterDraw.discardPile,
        seenEvents: newSeenEvents,
        activeEvent,
        journal: newJournal,
        cardMessage: delta.message || eventMessage,
        lastAction: `Played ${card.name}`,
        jackThought: newFear > 70 ? "I'm not gonna make it." : (state.clues.length >= 10 ? "Almost there." : state.jackThought),
      };
    }

    case 'THINK': {
      const { currentLevel: level, phase, fear, crowPressure, progress, hand, deck, discardPile, difficulty } = state;
      if (!level) return state;

      const scaling = DIFFICULTY_SCALING[difficulty || 'medium'];

      // v2 Think Logic (Fixed effects table)
      const effects = [
        { msg: "You listen to the wind.", fear: 2, progress: 5, pressure: 2, thought: "The island is huge." },
        { msg: "Checking the gear.", fear: 0, progress: 0, pressure: -5, thought: "Flashlight is steady." },
        { msg: "The isolation sinks in.", fear: 5, progress: 0, pressure: 0, thought: "I'm so alone out here." },
        { msg: "A deep breath.", fear: -10, progress: 0, pressure: 0, thought: "Gotta get a grip." },
      ];
      
      const effect = effects[Math.floor(Math.random() * effects.length)];
      
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

      // Optional: Add choice-based random event to Think as well
      const randomEvent = rollRandomEvent(phase);
      let activeEvent = state.activeEvent;
      if (randomEvent && randomEvent.choices) {
        activeEvent = { ...randomEvent, title: randomEvent.name, text: randomEvent.message, icon: '⚠️' };
      }
      
      const afterDraw = drawCards(deck, hand, discardPile, 1, difficulty !== 'hard', false);
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
        lastAction: 'Used Tactical Think',
        activeEvent,
      };
    }

    case 'MAKE_CHOICE': {
      const { choice } = action;
      const { effect } = choice;
      const { currentLevel: level, difficulty } = state;

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

      const scaling = DIFFICULTY_SCALING[difficulty || 'medium'];
      const progressMultiplier = 1 / scaling.goal;
      const choiceMove = ((effect.progressDelta || 0) / level.progressGoal) * 100 * progressMultiplier;
      const newProgress = Math.min(100, Math.max(0, state.progress + choiceMove));
      
      let newJournal = [...state.journal];
      if (effect.journal) {
        newJournal.push({
          id: `choice_${Date.now()}`,
          title: state.activeEvent?.title || 'Investigation Note',
          body: effect.journal,
          timestamp: formatInGameTime(state.phase, newProgress),
        });
      }

      let newClues = [...state.clues];
      let newJourneyLog = [...state.journeyLog];
      newJourneyLog.push({ type: 'choice', title: choice.text });

      if (effect.clueId && !newClues.includes(effect.clueId)) {
        newClues.push(effect.clueId);
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
        jackThought: effect.journal ? "Better write this down." : state.jackThought,
        lastAction: `Chose: ${choice.text}`,
      };
    }

    case 'DISMISS_EVENT': return { ...state, activeEvent: null };

    case 'TOGGLE_MUTE': {
      const newMuted = !state.isMuted;
      setMuted(newMuted);
      return { ...state, isMuted: newMuted };
    }

    case 'TOGGLE_PAUSE': return { ...state, screen: state.screen === 'pause' ? 'game' : 'pause' };
    case 'TOGGLE_JOURNAL': return { ...state, screen: state.screen === 'journal' ? 'game' : 'journal' };
    
    case 'SWAP_CARD': {
      const { cardId } = action;
      const { currentLevel: level, hand, deck, discardPile } = state;
      const afterDiscard = discardCard(hand, discardPile, cardId);
      const afterDraw = drawCards(afterDiscard.deck ?? deck, afterDiscard.hand, afterDiscard.discardPile, 1);
      return {
        ...state,
        ...afterDraw,
        fear: Math.min(FEAR_MAX, state.fear + 2),
        lastAction: 'Swapped a card',
      };
    }

    case 'RESTART': return makeInitialState();

    case 'HOVER_CARD': return { ...state, hoverMessage: action.card.flavorText };
    case 'UNHOVER_CARD': return { ...state, hoverMessage: null };

    default: return state;
  }
};

// ─── Context + Provider ─────────────────────────────────────────────────────

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, makeInitialState());

  const startGame     = useCallback(() => dispatch({ type: 'START_GAME' }), []);
  const beginLevel    = useCallback((level) => dispatch({ type: 'BEGIN_LEVEL', level }), []);
  const playCard      = useCallback((card) => dispatch({ type: 'PLAY_CARD', card }), []);
  const drawMoreCards = useCallback((n = 1) => dispatch({ type: 'DRAW_CARDS', n }), []);
  const makeChoice    = useCallback((choice) => dispatch({ type: 'MAKE_CHOICE', choice }), []);
  const dismissEvent  = useCallback(() => dispatch({ type: 'DISMISS_EVENT' }), []);
  const togglePause   = useCallback(() => { playSFX('click'); dispatch({ type: 'TOGGLE_PAUSE' }); }, []);
  const toggleJournal = useCallback(() => { playSFX('scribble'); dispatch({ type: 'TOGGLE_JOURNAL' }); }, []);
  const restart       = useCallback(() => dispatch({ type: 'RESTART' }), []);
  const swapCard      = useCallback((cardId) => dispatch({ type: 'SWAP_CARD', cardId }), []);
  const setScreen     = useCallback((screen) => dispatch({ type: 'SET_SCREEN', screen }), []);
  const setDifficulty = useCallback((difficulty) => dispatch({ type: 'SET_DIFFICULTY', difficulty }), []);
  const think         = useCallback(() => dispatch({ type: 'THINK' }), []);
  const toggleMute    = useCallback(() => { dispatch({ type: 'TOGGLE_MUTE' }); }, []);
  const hoverCard     = useCallback((card) => dispatch({ type: 'HOVER_CARD', card }), []);
  const unhoverCard   = useCallback(() => dispatch({ type: 'UNHOVER_CARD' }), []);

  const value = useMemo(() => ({
    state,
    dispatch,
    startGame,
    beginLevel,
    playCard,
    drawMoreCards,
    makeChoice,
    dismissEvent,
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
  }), [state, startGame, beginLevel, playCard, drawMoreCards, makeChoice, dismissEvent, togglePause, toggleJournal, restart, swapCard, setScreen, setDifficulty, think, toggleMute, hoverCard, unhoverCard]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
};

export default GameContext;
