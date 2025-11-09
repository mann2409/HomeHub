import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, Alert, ScrollView } from 'react-native';
import { RecordingAction } from '../types/automation';

interface AutomationRecorderProps {
  visible: boolean;
  onClose: () => void;
  onRecorded: (actions: RecordingAction[]) => void;
  retailer: 'woolworths' | 'coles';
}

export default function AutomationRecorder({ visible, onClose, onRecorded, retailer }: AutomationRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedActions, setRecordedActions] = useState<RecordingAction[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Tap the search box',
    'Enter your test product (e.g., "milk")',
    'Tap the search button',
    'Tap on the first result',
    'Tap add to cart',
    'Complete the recording'
  ];

  const startRecording = () => {
    setIsRecording(true);
    setRecordedActions([]);
    setCurrentStep(0);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordedActions.length > 0) {
      Alert.alert(
        'Recording Complete',
        `Captured ${recordedActions.length} actions. Save this automation?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save', onPress: () => {
            onRecorded(recordedActions);
            onClose();
          }}
        ]
      );
    }
  };

  const clearActions = () => {
    setRecordedActions([]);
    setCurrentStep(0);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Automation Recorder</Text>
          <Pressable onPress={onClose}>
            <Text style={styles.closeButton}>Done</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>📱 Recording Instructions</Text>
            <Text style={styles.infoText}>
              We'll capture your tap locations to automate shopping.{'\n\n'}
              Retailer: <Text style={styles.retailerName}>{retailer.charAt(0).toUpperCase() + retailer.slice(1)}</Text>
            </Text>
          </View>

          {/* Steps Guide */}
          <View style={styles.stepsContainer}>
            <Text style={styles.stepsTitle}>Follow these steps:</Text>
            {steps.map((step, index) => (
              <View key={index} style={[styles.stepItem, currentStep === index && styles.activeStep]}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Recording Controls */}
          <View style={styles.controlsContainer}>
            {!isRecording ? (
              <Pressable style={styles.recordButton} onPress={startRecording}>
                <View style={styles.recordButtonInner}>
                  <Text style={styles.recordButtonText}>🔴 Start Recording</Text>
                </View>
              </Pressable>
            ) : (
              <>
                <Pressable style={[styles.recordButton, styles.stopButton]} onPress={stopRecording}>
                  <View style={styles.recordButtonInner}>
                    <Text style={styles.recordButtonText}>⏹ Stop Recording</Text>
                  </View>
                </Pressable>
                <Text style={styles.recordingText}>
                  Recording... Tap on the screen to record actions
                </Text>
              </>
            )}

            {recordedActions.length > 0 && (
              <Pressable style={styles.clearButton} onPress={clearActions}>
                <Text style={styles.clearButtonText}>Clear All Actions</Text>
              </Pressable>
            )}
          </View>

          {/* Recorded Actions */}
          {recordedActions.length > 0 && (
            <View style={styles.actionsContainer}>
              <Text style={styles.actionsTitle}>Recorded Actions: {recordedActions.length}</Text>
              {recordedActions.map((action, index) => (
                <View key={index} style={styles.actionItem}>
                  <Text style={styles.actionText}>
                    {index + 1}. Tap at ({action.x}, {action.y}) {action.type}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    fontSize: 16,
    color: '#4CAF50',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoBox: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  retailerName: {
    fontWeight: '600',
    color: '#4CAF50',
  },
  stepsContainer: {
    marginBottom: 20,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  activeStep: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
  },
  controlsContainer: {
    marginBottom: 20,
  },
  recordButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  recordButtonInner: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    alignItems: 'center',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  stopButton: {
    opacity: 0.8,
  },
  recordingText: {
    color: '#FF9800',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
  },
  clearButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
  },
  actionsContainer: {
    marginTop: 20,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  actionItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
});
