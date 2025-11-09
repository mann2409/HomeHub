import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { RecordingAction } from '../types/automation';
import { X, Record, Square } from 'phosphor-react-native';

interface AutomationWebViewProps {
  visible: boolean;
  onClose: () => void;
  onRecorded: (actions: RecordingAction[]) => void;
  retailer: 'woolworths' | 'coles';
  url: string;
}

export default function AutomationWebView({ visible, onClose, onRecorded, retailer, url }: AutomationWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedActions, setRecordedActions] = useState<RecordingAction[]>([]);
  const [currentUrl, setCurrentUrl] = useState(url);

  const retailerUrls = {
    woolworths: 'https://www.woolworths.com.au',
    coles: 'https://www.coles.com.au'
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordedActions([]);
    setCurrentUrl(retailerUrls[retailer]);
    
    // Immediately inject the script when starting to record
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(injectedJavaScript);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordedActions.length > 0) {
      Alert.alert(
        'Recording Complete ✅',
        `Captured ${recordedActions.length} actions:\n\n${recordedActions.slice(0, 3).map((a, i) => `${i + 1}. ${a.type} at (${a.x}, ${a.y})${a.value ? ` - "${a.value}"` : ''}`).join('\n')}${recordedActions.length > 3 ? '\n...' : ''}\n\nSave this automation?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save', onPress: () => {
            onRecorded(recordedActions);
            onClose();
          }}
        ]
      );
    } else {
      Alert.alert('No Actions Recorded', 'Please perform some actions while recording.');
    }
  };

  // Inject JavaScript to capture all clicks on the page
  const injectedJavaScript = `
    (function() {
      console.log('🎬 Starting to inject recording script...');
      
      // Remove existing listeners to avoid duplicates
      document.removeEventListener('click', window._recordClick);
      document.removeEventListener('input', window._recordInput);
      document.removeEventListener('touchstart', window._recordTouch);
      
      // Capture click events
      window._recordClick = function(e) {
        console.log('📍 Click detected at:', e.clientX, e.clientY);
        try {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'click',
            x: e.clientX,
            y: e.clientY,
            timestamp: Date.now(),
            target: e.target.tagName
          }));
        } catch(err) {
          console.error('Error posting click message:', err);
        }
      };
      
      // Capture input events
      window._recordInput = function(e) {
        console.log('⌨️ Input detected:', e.target.value);
        try {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'input',
            x: e.clientX,
            y: e.clientY,
            timestamp: Date.now(),
            value: e.target.value,
            target: e.target.tagName
          }));
        } catch(err) {
          console.error('Error posting input message:', err);
        }
      };
      
      // Capture touch events (for mobile)
      window._recordTouch = function(e) {
        if (e.touches.length > 0) {
          const touch = e.touches[0];
          console.log('👆 Touch detected at:', touch.clientX, touch.clientY);
          try {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'click',
              x: touch.clientX,
              y: touch.clientY,
              timestamp: Date.now(),
              target: e.target.tagName
            }));
          } catch(err) {
            console.error('Error posting touch message:', err);
          }
        }
      };
      
      // Add event listeners
      document.addEventListener('click', window._recordClick, true);
      document.addEventListener('input', window._recordInput, true);
      document.addEventListener('touchstart', window._recordTouch, true);
      
      console.log('✅ Recording script successfully injected');
    })();
    true; // Required for injected scripts
  `;

  const handleMessage = (event: any) => {
    if (!isRecording) {
      console.log('Message received but not recording');
      return;
    }

    console.log('Processing message:', event.nativeEvent.data);

    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      const action: RecordingAction = {
        type: data.type === 'input' ? 'input' : 'tap',
        x: data.x,
        y: data.y,
        timestamp: data.timestamp,
        value: data.value
      };

      console.log('Recording action:', action);
      setRecordedActions(prev => {
        const newActions = [...prev, action];
        console.log(`Total actions: ${newActions.length}`);
        return newActions;
      });
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {retailer.charAt(0).toUpperCase() + retailer.slice(1)} Web
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Recording Status */}
        {isRecording && (
          <View style={styles.recordingBar}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>
              Recording... {recordedActions.length} actions captured
            </Text>
          </View>
        )}

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: currentUrl }}
          style={styles.webview}
          injectedJavaScript={isRecording ? injectedJavaScript : ''}
          onMessage={handleMessage}
          onLoadEnd={() => {
            // Inject script after page loads if recording
            if (isRecording && webViewRef.current) {
              setTimeout(() => {
                webViewRef.current?.injectJavaScript(injectedJavaScript);
              }, 500);
            }
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
          userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15"
          scalesPageToFit={true}
        />

        {/* Controls */}
        <View style={styles.controls}>
          {!isRecording ? (
            <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
              <Record size={24} color="#fff" weight="fill" />
              <Text style={styles.recordButtonText}>Start Recording</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
                <Square size={24} color="#fff" weight="fill" />
                <Text style={styles.stopButtonText}>Stop Recording</Text>
              </TouchableOpacity>
              
              {recordedActions.length > 0 && (
                <View style={styles.actionsCount}>
                  <Text style={styles.actionsCountText}>
                    {recordedActions.length} actions
                  </Text>
                </View>
              )}
            </>
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
  recordingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FF6B6B',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  recordingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1A1B2E',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    gap: 12,
  },
  recordButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  stopButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionsCount: {
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  actionsCountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
