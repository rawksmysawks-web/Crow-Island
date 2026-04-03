/**
 * ErrorBoundary.js — React class-based error boundary.
 *
 * Catches any render errors and displays a friendly fallback screen
 * rather than crashing the app silently.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[Crow Island] Runtime error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong.</Text>
          <Text style={styles.message}>
            {this.state.error?.message ?? 'Unknown error'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Try to Recover</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#03000d',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    color: '#ef9a9a',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    color: '#555',
    fontSize: 12,
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  button: {
    borderWidth: 1,
    borderColor: '#7b1fa2',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#ce93d8',
    fontSize: 14,
  },
});

export default ErrorBoundary;
