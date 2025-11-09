import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ArrowLeft, ArrowRight, ArrowClockwise, Robot, Pause, Play, ShoppingCart, Record } from 'phosphor-react-native';
import useShoppingStore from '../state/shoppingStore';
import { automateRetailerShopping, automateUsingProductUrls, RetailerType, AutomationStep } from '../services/retailerAutomationService';
import { fetchAddPlan } from '../api/addPlan';
import AutomationWebView from '../components/AutomationWebView';
import AutomationPlayer from '../components/AutomationPlayer';
import { AutomationScript } from '../types/automation';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AutomatedShoppingScreenProps {
  onClose: () => void;
  retailer: RetailerType;
}

export default function AutomatedShoppingScreen({ onClose, retailer }: AutomatedShoppingScreenProps) {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isAutomating, setIsAutomating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState<AutomationStep | null>(null);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [failedItems, setFailedItems] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Automation recording/playback state
  const [showAutomationRecorder, setShowAutomationRecorder] = useState(false);
  const [showAutomationPlayer, setShowAutomationPlayer] = useState(false);
  const [savedAutomationScript, setSavedAutomationScript] = useState<AutomationScript | null>(null);
  const [currentProductForPlayback, setCurrentProductForPlayback] = useState<string>('');
  
  // Message queue for handling script execution results
  const pendingExecutions = useRef<Map<number, { resolve: (value: any) => void; reject: (error: any) => void }>>(new Map());
  const executionCounter = useRef(0);
  
  const { getPendingItems } = useShoppingStore();
  const shoppingItems = getPendingItems();

  const retailerUrl = retailer === 'woolworths' 
    ? 'https://www.woolworths.com.au' 
    : 'https://www.coles.com.au';

  useEffect(() => {
    setCurrentUrl(retailerUrl);
  }, [retailerUrl]);

  // Load saved automation script on mount
  useEffect(() => {
    loadSavedAutomation();
  }, []);

  const loadSavedAutomation = async () => {
    try {
      const data = await AsyncStorage.getItem(`automation_${retailer}`);
      if (data) {
        const script: AutomationScript = JSON.parse(data);
        setSavedAutomationScript(script);
        addLog('✅ Loaded saved automation script');
      }
    } catch (error) {
      console.error('Error loading automation script:', error);
    }
  };

  const saveAutomationScript = async (script: AutomationScript) => {
    try {
      await AsyncStorage.setItem(`automation_${retailer}`, JSON.stringify(script));
      setSavedAutomationScript(script);
      addLog('✅ Automation script saved');
    } catch (error) {
      console.error('Error saving automation script:', error);
      Alert.alert('Error', 'Failed to save automation script');
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 20));
    console.log(`[Auto Shop] ${message}`);
  };

  const handleGoBack = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
    }
  };

  const handleGoForward = () => {
    if (webViewRef.current && canGoForward) {
      webViewRef.current.goForward();
    }
  };

  const handleRefresh = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const executeJavaScript = (script: string) => {
    return new Promise<any>((resolve, reject) => {
      if (!webViewRef.current) {
        console.log('WebView ref not available');
        resolve(null);
        return;
      }

      // Create a unique identifier for this script execution
      const executionId = ++executionCounter.current;
      
      // Store the promise resolvers
      pendingExecutions.current.set(executionId, { resolve, reject });
      
      // Wrap the script to send results back via postMessage with the execution ID
      const wrappedScript = `
        (async function() {
          try {
            const result = await (async () => { ${script} })();
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
              success: true, 
              result, 
              executionId: ${executionId}
            }));
            return result;
          } catch (error) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
              success: false, 
              error: error.message, 
              executionId: ${executionId}
            }));
            return null;
          }
        })();
        true;
      `;
      
      try {
        webViewRef.current.injectJavaScript(wrappedScript);
      } catch (error) {
        console.error('Failed to inject JavaScript:', error);
        pendingExecutions.current.delete(executionId);
        resolve(null);
        return;
      }
      
      // Set timeout for this execution
      setTimeout(() => {
        const execution = pendingExecutions.current.get(executionId);
        if (execution) {
          pendingExecutions.current.delete(executionId);
          console.log('Script execution timeout for ID:', executionId);
          resolve(null);
        }
      }, 10000);
    });
  };

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      // Check if this is a script execution result
      if (data.executionId && pendingExecutions.current.has(data.executionId)) {
        const execution = pendingExecutions.current.get(data.executionId);
        if (execution) {
          pendingExecutions.current.delete(data.executionId);
          
          if (data.success) {
            console.log('Script executed successfully:', data.result);
            execution.resolve(data.result);
          } else {
            console.error('Script execution failed:', data.error);
            execution.resolve(null);
          }
        }
      } else {
        // Handle other messages (like general logging)
        if (data && data.autoShopLog && typeof data.message === 'string') {
          addLog(data.message);
        } else if (data.success) {
          console.log('Script executed successfully:', data.result);
        } else {
          console.error('Script execution failed:', data.error);
        }
      }
    } catch (error) {
      console.error('Failed to parse webview message:', error);
    }
  };

  const startAutomation = async () => {
    if (shoppingItems.length === 0) {
      Alert.alert('No Items', 'Please add items to your shopping list first.');
      return;
    }

    setIsAutomating(true);
    setIsPaused(false);
    addLog(`🤖 Starting automated shopping for ${shoppingItems.length} items on ${retailer}`);

    try {
      // Step 1: Try to get AddPlan from server (browserless-backed)
      addLog('🌐 Building product plan via server');
      let plan: { items: { productUrl: string; qty: number }[] } | null = null;
      try {
        plan = await fetchAddPlan(retailer, shoppingItems);
        addLog(`📦 Received plan with ${plan.items.length} products`);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        addLog(`⚠️ Server plan failed: ${message}`);
        addLog('🔎 Falling back to in-page search automation');
      }

      // If we got product URLs, use URL-based automation; otherwise fallback to search-based
      const hasUrls = !!(plan && plan.items && plan.items.length > 0);

      if (hasUrls) {
        await automateUsingProductUrls({
          retailer,
          planItems: plan!.items,
          executeScript: executeJavaScript,
          onProgress: (step) => {
            setCurrentStep(step);
            addLog(`${step.icon} ${step.action}${step.description ? ' - ' + step.description : ''}`);
          },
        });
      } else {
        // Fallback to in-page search add
        await automateRetailerShopping({
        retailer,
        items: shoppingItems,
        executeScript: executeJavaScript,
        onProgress: (step, item) => {
          setCurrentStep(step);
          if (item) {
            addLog(`${step.icon} ${step.action} - ${item.name}`);
          } else {
            addLog(`${step.icon} ${step.action}`);
          }
        },
        onItemCompleted: (itemId, success) => {
          if (success) {
            setCompletedItems(prev => [...prev, itemId]);
            addLog(`✅ Item added to cart successfully`);
          } else {
            setFailedItems(prev => [...prev, itemId]);
            addLog(`❌ Failed to add item`);
          }
        },
        onPauseForAuth: () => {
          setIsPaused(true);
          addLog('⏸️ Paused for user authentication');
          Alert.alert(
            'Sign In Required',
            'Please sign in to your account to continue. Press "Resume" when ready.',
            [{ text: 'OK' }]
          );
        },
        });
      }

      addLog('🎉 Automation completed!');
      Alert.alert(
        'Automation Complete',
        `✅ ${completedItems.length} items added\n❌ ${failedItems.length} items failed\n\nYou can now proceed to checkout and payment.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`❌ Error: ${errorMessage}`);
      Alert.alert(
        'Error', 
        `An error occurred during automation:\n\n${errorMessage}\n\nPlease check your server connection and try again.`
      );
    } finally {
      setIsAutomating(false);
      setCurrentStep(null);
    }
  };

  const pauseAutomation = () => {
    setIsPaused(true);
    addLog('⏸️ Automation paused by user');
  };

  const resumeAutomation = () => {
    setIsPaused(false);
    addLog('▶️ Automation resumed');
  };

  const stopAutomation = () => {
    setIsAutomating(false);
    setIsPaused(false);
    setCurrentStep(null);
    addLog('🛑 Automation stopped by user');
  };

  // Handle automation recording
  const handleAutomationRecorded = (actions: any[]) => {
    const script: AutomationScript = {
      id: Date.now().toString(),
      retailer,
      name: `${retailer} Automation`,
      actions,
      createdAt: Date.now()
    };
    saveAutomationScript(script);
    Alert.alert(
      'Success! ✅', 
      `Automation script recorded with ${actions.length} actions!\n\nYou can now use "Auto Shop" to automatically add items to your cart.`,
      [{ text: 'Got it!' }]
    );
  };

  // Handle starting automation playback
  const handleStartAutomationPlayback = async (itemName: string) => {
    if (!savedAutomationScript) {
      Alert.alert('No Automation', 'Please record an automation script first.');
      return;
    }

    setCurrentProductForPlayback(itemName);
    setShowAutomationPlayer(true);
  };

  // Handle automation completion
  const handleAutomationComplete = () => {
    setShowAutomationPlayer(false);
    addLog(`✅ Automation completed for: ${currentProductForPlayback}`);
    setCompletedItems(prev => [...prev, Date.now().toString()]);
    Alert.alert('Success', `Automated shopping completed for ${currentProductForPlayback}`);
  };

  const handleAutomationError = (error: string) => {
    addLog(`❌ Automation error: ${error}`);
    setFailedItems(prev => [...prev, Date.now().toString()]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleGoBack}
            disabled={!canGoBack}
          >
            <ArrowLeft size={20} color={canGoBack ? '#333' : '#ccc'} weight="bold" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleGoForward}
            disabled={!canGoForward}
          >
            <ArrowRight size={20} color={canGoForward ? '#333' : '#ccc'} weight="bold" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navButton} onPress={handleRefresh}>
            <ArrowClockwise size={20} color="#333" weight="bold" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.urlText} numberOfLines={1}>
            {currentUrl}
          </Text>
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={20} color="#333" weight="bold" />
        </TouchableOpacity>
      </View>

      {/* Automation Control Panel */}
      <View style={styles.controlPanel}>
        <View style={styles.controlHeader}>
          <Robot size={24} color="#10A37F" weight="bold" />
          <Text style={styles.controlTitle}>AI Shopping Assistant</Text>
        </View>

        {!isAutomating ? (
          <>
            <View style={styles.buttonRowHorizontal}>
              <TouchableOpacity
                style={[styles.startButton, styles.flex1]}
                onPress={startAutomation}
                disabled={shoppingItems.length === 0}
              >
                <Play size={20} color="#fff" weight="fill" />
                <Text style={styles.startButtonText}>
                  Auto Shop ({shoppingItems.length} items)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.recordButton}
                onPress={() => setShowAutomationRecorder(true)}
              >
                <Record size={20} color="#fff" weight="fill" />
                <Text style={styles.recordButtonText}>
                  {savedAutomationScript ? 'Re-record' : 'Record'}
                </Text>
              </TouchableOpacity>
            </View>

            {savedAutomationScript && (
              <View style={styles.automationInfo}>
                <Text style={styles.automationInfoText}>
                  ✓ Automation script saved ({savedAutomationScript.actions.length} actions)
                </Text>
                <TouchableOpacity 
                  style={styles.viewScriptButton}
                  onPress={() => {
                    Alert.alert(
                      'Saved Automation Script',
                      `Actions: ${savedAutomationScript.actions.length}\nRetailer: ${savedAutomationScript.retailer}\nCreated: ${new Date(savedAutomationScript.createdAt).toLocaleString()}\n\nActions:\n${savedAutomationScript.actions.slice(0, 5).map((a, i) => `${i + 1}. ${a.type} at (${a.x}, ${a.y})${a.value ? ` - "${a.value}"` : ''}`).join('\n')}${savedAutomationScript.actions.length > 5 ? '\n...' : ''}`
                    );
                  }}
                >
                  <Text style={styles.viewScriptText}>View Details</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={styles.automationControls}>
            <View style={styles.statusRow}>
              {currentStep && (
                <View style={styles.currentStepContainer}>
                  <Text style={styles.currentStepText}>
                    {currentStep.icon} {currentStep.action}
                  </Text>
                  {currentStep.description && (
                    <Text style={styles.stepDescription}>{currentStep.description}</Text>
                  )}
                </View>
              )}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{completedItems.length}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{failedItems.length}</Text>
                <Text style={styles.statLabel}>Failed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {shoppingItems.length - completedItems.length - failedItems.length}
                </Text>
                <Text style={styles.statLabel}>Remaining</Text>
              </View>
            </View>

            <View style={styles.buttonRow}>
              {!isPaused ? (
                <TouchableOpacity style={styles.pauseButton} onPress={pauseAutomation}>
                  <Pause size={16} color="#fff" weight="fill" />
                  <Text style={styles.buttonText}>Pause</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.resumeButton} onPress={resumeAutomation}>
                  <Play size={16} color="#fff" weight="fill" />
                  <Text style={styles.buttonText}>Resume</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.stopButton} onPress={stopAutomation}>
                <X size={16} color="#fff" weight="bold" />
                <Text style={styles.buttonText}>Stop</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Activity Log */}
        {logs.length > 0 && (
          <View style={styles.logContainer}>
            <Text style={styles.logTitle}>Activity Log</Text>
            <ScrollView style={styles.logScroll} nestedScrollEnabled>
              {logs.map((log, index) => (
                <Text key={index} style={styles.logText}>
                  {log}
                </Text>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10A37F" />
          <Text style={styles.loadingText}>Loading {retailer}...</Text>
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: retailerUrl }}
        style={styles.webview}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
          setCanGoForward(navState.canGoForward);
          setCurrentUrl(navState.url);
        }}
        onMessage={handleWebViewMessage}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
        mixedContentMode="always"
        scalesPageToFit={true}
        allowFileAccess={true}
        startInLoadingState={true}
      />

      {/* Automation Recorder Modal */}
      <AutomationWebView
        visible={showAutomationRecorder}
        onClose={() => setShowAutomationRecorder(false)}
        onRecorded={handleAutomationRecorded}
        retailer={retailer}
        url={retailerUrl}
      />

      {/* Automation Player Modal */}
      <AutomationPlayer
        visible={showAutomationPlayer}
        onClose={() => setShowAutomationPlayer(false)}
        script={savedAutomationScript}
        productName={currentProductForPlayback}
        onComplete={handleAutomationComplete}
        onError={handleAutomationError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 6,
  },
  headerCenter: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  urlText: {
    fontSize: 12,
    color: '#666',
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  controlPanel: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    padding: 12,
    maxHeight: 300,
  },
  controlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  controlTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  startButton: {
    backgroundColor: '#10A37F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonRowHorizontal: {
    flexDirection: 'row',
    gap: 8,
  },
  flex1: {
    flex: 1,
  },
  recordButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  automationInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#d1fae5',
    borderRadius: 6,
  },
  automationInfoText: {
    fontSize: 12,
    color: '#065f46',
    fontWeight: '500',
    marginBottom: 8,
  },
  viewScriptButton: {
    marginTop: 4,
    padding: 6,
    backgroundColor: 'rgba(5, 95, 70, 0.1)',
    borderRadius: 6,
    alignItems: 'center',
  },
  viewScriptText: {
    fontSize: 11,
    color: '#065f46',
    fontWeight: '600',
  },
  automationControls: {
    gap: 12,
  },
  statusRow: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  currentStepContainer: {
    gap: 4,
  },
  currentStepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  stepDescription: {
    fontSize: 12,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10A37F',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pauseButton: {
    flex: 1,
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  resumeButton: {
    flex: 1,
    backgroundColor: '#10A37F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  stopButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  logContainer: {
    marginTop: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
    maxHeight: 120,
  },
  logTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  logScroll: {
    maxHeight: 90,
  },
  logText: {
    fontSize: 11,
    color: '#333',
    fontFamily: 'monospace',
    paddingVertical: 2,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  webview: {
    flex: 1,
  },
});

