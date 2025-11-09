import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../components/GradientBackground';
import Card from '../components/Card';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';

export default function AdminPromoCodeScreen() {
  const [codeType, setCodeType] = useState<'lifetime' | 'monthly' | 'yearly'>('lifetime');
  const [customCode, setCustomCode] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking characters
    let code = '';
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const createPromoCode = async (code: string) => {
    try {
      const upperCode = code.toUpperCase().replace(/\s/g, '');
      
      await setDoc(doc(db, 'promoCodes', upperCode), {
        code: upperCode,
        type: codeType,
        used: false,
        createdAt: serverTimestamp(),
        expiresAt: null, // null = never expires
      });

      return upperCode;
    } catch (error) {
      console.error('Error creating promo code:', error);
      throw error;
    }
  };

  const handleGenerateSingle = async () => {
    setGenerating(true);
    try {
      const code = customCode.trim() || generateRandomCode();
      const createdCode = await createPromoCode(code);
      
      setGeneratedCodes(prev => [createdCode, ...prev]);
      setCustomCode('');
      
      Alert.alert(
        'Success!',
        `Promo code created:\n\n${createdCode}\n\nType: ${codeType}`,
        [
          {
            text: 'Copy',
            onPress: () => {
              // Copy to clipboard logic here if needed
              Alert.alert('Copied!', 'Code copied to clipboard');
            }
          },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create promo code');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateMultiple = async () => {
    Alert.alert(
      'Generate Multiple Codes',
      'How many codes would you like to generate?',
      [
        {
          text: '5',
          onPress: () => generateBulkCodes(5),
        },
        {
          text: '10',
          onPress: () => generateBulkCodes(10),
        },
        {
          text: '25',
          onPress: () => generateBulkCodes(25),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const generateBulkCodes = async (count: number) => {
    setGenerating(true);
    try {
      const codes: string[] = [];
      
      for (let i = 0; i < count; i++) {
        const code = generateRandomCode();
        await createPromoCode(code);
        codes.push(code);
      }
      
      setGeneratedCodes(prev => [...codes, ...prev]);
      
      Alert.alert(
        'Success!',
        `Generated ${count} promo codes!\n\nType: ${codeType}`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate codes');
    } finally {
      setGenerating(false);
    }
  };

  const typeButtons = [
    { type: 'lifetime' as const, label: 'Lifetime', icon: 'infinite-outline', color: '#10B981' },
    { type: 'monthly' as const, label: 'Monthly', icon: 'calendar-outline', color: '#3B82F6' },
    { type: 'yearly' as const, label: 'Yearly', icon: 'calendar-number-outline', color: '#8B5CF6' },
  ];

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1 px-4">
          {/* Header */}
          <View className="py-6">
            <Text className="text-3xl font-bold text-white mb-2">
              🎫 Promo Code Generator
            </Text>
            <Text className="text-white/70">
              Generate codes to give users premium access
            </Text>
          </View>

          {/* Type Selector */}
          <Card className="mb-4">
            <Text className="text-lg font-bold text-white mb-3">
              Select Access Type
            </Text>
            
            <View className="space-y-2">
              {typeButtons.map(({ type, label, icon, color }) => (
                <Pressable
                  key={type}
                  onPress={() => setCodeType(type)}
                  className={`flex-row items-center p-4 rounded-xl ${
                    codeType === type ? 'bg-white/20' : 'bg-white/5'
                  }`}
                  style={codeType === type ? { borderColor: color, borderWidth: 2 } : {}}
                >
                  <Ionicons name={icon as any} size={24} color={color} />
                  <Text className="text-white font-semibold text-base ml-3 flex-1">
                    {label}
                  </Text>
                  {codeType === type && (
                    <Ionicons name="checkmark-circle" size={24} color={color} />
                  )}
                </Pressable>
              ))}
            </View>
          </Card>

          {/* Custom Code Input */}
          <Card className="mb-4">
            <Text className="text-lg font-bold text-white mb-3">
              Custom Code (Optional)
            </Text>
            
            <TextInput
              value={customCode}
              onChangeText={setCustomCode}
              placeholder="Leave empty for random code"
              placeholderTextColor="rgba(255,255,255,0.4)"
              className="bg-white/10 text-white p-4 rounded-lg mb-3"
              autoCapitalize="characters"
              maxLength={15}
            />
            
            <Text className="text-white/60 text-xs mb-3">
              • Leave empty to generate random code
              • Use letters and numbers only
              • Recommended: 8-12 characters
            </Text>

            <Pressable
              onPress={handleGenerateSingle}
              disabled={generating}
              className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-xl"
              style={{
                backgroundColor: '#3B82F6',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 8,
              }}
            >
              {generating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold text-center text-base">
                  Generate Single Code
                </Text>
              )}
            </Pressable>
          </Card>

          {/* Bulk Generation */}
          <Card className="mb-4">
            <Text className="text-lg font-bold text-white mb-3">
              Bulk Generation
            </Text>
            
            <Pressable
              onPress={handleGenerateMultiple}
              disabled={generating}
              className="bg-white/10 p-4 rounded-xl border-2 border-white/20"
            >
              <Text className="text-white font-bold text-center text-base">
                Generate Multiple Codes
              </Text>
            </Pressable>
          </Card>

          {/* Generated Codes List */}
          {generatedCodes.length > 0 && (
            <Card className="mb-6">
              <Text className="text-lg font-bold text-white mb-3">
                Recently Generated ({generatedCodes.length})
              </Text>
              
              <View className="space-y-2">
                {generatedCodes.slice(0, 10).map((code, index) => (
                  <View
                    key={index}
                    className="bg-white/5 p-3 rounded-lg border border-white/10"
                  >
                    <Text className="text-white font-mono text-sm">
                      {code}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}


