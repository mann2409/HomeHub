import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { AutomationScript, RecordingAction } from '../types/automation';
import { X, Play, Pause } from 'phosphor-react-native';
import { TouchableOpacity } from 'react-native';

interface AutomationPlayerProps {
  visible: boolean;
  onClose: () => void;
  script: AutomationScript | null;
  productName: string;
  onComplete: () => void;
  onError: (error: string) => void;
}

export default function AutomationPlayer({ 
  visible, 
  onClose, 
  script, 
  productName,
  onComplete,
  onError 
}: AutomationPlayerProps) {
  const webViewRef = useRef<WebView>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAction, setCurrentAction] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const retailerUrls = {
    woolworths: 'https://www.woolworths.com.au',
    coles: 'https://www.coles.com.au'
  };

  useEffect(() => {
    if (visible && script) {
      reset();
    }
  }, [visible, script]);

  const reset = () => {
    setCurrentAction(0);
    setIsPlaying(false);
    setIsLoading(true);
  };

  const startPlayback = () => {
    if (!script || script.actions.length === 0) {
      Alert.alert('Error', 'No automation script available');
      return;
    }

    setIsPlaying(true);
    executeNextAction(0);
  };

  const executeNextAction = (actionIndex: number) => {
    if (!script || actionIndex >= script.actions.length) {
      // All actions completed
      setIsPlaying(false);
      onComplete();
      return;
    }

    const action = script.actions[actionIndex];
    setCurrentAction(actionIndex);

    const delay = actionIndex > 0 
      ? action.timestamp - script.actions[actionIndex - 1].timestamp 
      : 500;

    setTimeout(() => {
      executeAction(action, actionIndex);
    }, Math.min(delay, 2000)); // Cap delay at 2 seconds
  };

  const executeAction = (action: RecordingAction, index: number) => {
    if (!webViewRef.current) return;

    let jsCode = '';

    if (action.type === 'input') {
      // For input actions, replace with product name
      const value = productName || action.value || '';
      
      jsCode = `
        (function() {
          const element = document.elementFromPoint(${action.x}, ${action.y});
          if (element) {
            element.focus();
            element.value = "${value}";
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('Input set at (${action.x}, ${action.y}) with value: ${value}');
          } else {
            console.error('Element not found at (${action.x}, ${action.y})');
          }
        })();
        true;
      `;
    } else {
      // For tap/click actions
      jsCode = `
        (function() {
          const element = document.elementFromPoint(${action.x}, ${action.y});
          if (element) {
            element.click();
            console.log('Clicked element at (${action.x}, ${action.y})');
          } else {
            console.error('Element not found at (${action.x}, ${action.y})');
            // Try alternative: dispatch click event at coordinates
            const event = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window,
              clientX: ${action.x},
              clientY: ${action.y}
            });
            document.elementFromPoint(${action.x}, ${action.y})?.dispatchEvent(event);
          }
        })();
        true;
      `;
    }

    webViewRef.current.injectJavaScript(jsCode);

    // Execute next action
    executeNextAction(index + 1);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
  };

  const getProgress = () => {
    if (!script || script.actions.length === 0) return 0;
    return (currentAction / script.actions.length) * 100;
  };

  const currentActionText = () => {
    if (!script || currentAction >= script.actions.length) {
      return 'Complete';
    }
    const action = script.actions[currentAction];
    return `${action.type} at (${action.x}, ${action.y})`;
  };

  if (!script) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Auto Shopping: {productName}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Status Bar */}
        {isPlaying && (
          <View style={styles.statusBar}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${getProgress()}%` }]} />
            </View>
            <Text style={styles.statusText}>
              {currentAction} / {script.actions.length} - {currentActionText()}
            </Text>
          </View>
        )}

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: retailerUrls[script.retailer] }}
          style={styles.webview}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => {
            setIsLoading(false);
            // Auto-start after page loads
            if (visible && !isPlaying) {
              setTimeout(() => startPlayback(), 1000);
            }
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
          userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15"
          scalesPageToFit={true}
        />

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading {script.retailer}...</Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          {!isPlaying ? (
            <TouchableOpacity 
              style={styles.playButton} 
              onPress={startPlayback}
              disabled={isLoading}
            >
              <Play size={24} color="#fff" weight="fill" />
              <Text style={styles.controlButtonText}>Start Automation</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.pauseButton} 
              onPress={stopPlayback}
            >
              <Pause size={24} color="#fff" weight="fill" />
              <Text style={styles.controlButtonText}>Stop</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B2E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#1A1B2E',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  statusBar: {
    padding: 12,
    backgroundColor: '#4CAF50',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 27, 46, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 14,
  },
  controls: {
    padding: 16,
    backgroundColor: '#1A1B2E',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
