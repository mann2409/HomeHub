import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../components/GradientBackground';
import Card from '../components/Card';
import useSubscriptionStore from '../state/subscriptionStore';
import { useAuthStore } from '../state/authStore';
import { Ionicons } from '@expo/vector-icons';

interface RedeemPromoCodeScreenProps {
  onClose: () => void;
}

export default function RedeemPromoCodeScreen({ onClose }: RedeemPromoCodeScreenProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { redeemPromoCode, validatePromoCode } = useSubscriptionStore();
  const { user } = useAuthStore();

  const handleValidate = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }

    setLoading(true);
    try {
      const result = await validatePromoCode(code.trim());
      
      if (result.valid) {
        Alert.alert(
          '✅ Valid Code!',
          result.message,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Redeem', onPress: handleRedeem },
          ]
        );
      } else {
        Alert.alert('Invalid Code', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to validate code');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'You must be logged in to redeem a code');
      return;
    }

    setLoading(true);
    try {
      const result = await redeemPromoCode(code.trim(), user.uid);
      
      if (result.success) {
        Alert.alert(
          '🎉 Success!',
          result.message,
          [
            {
              text: 'Awesome!',
              onPress: onClose,
            },
          ]
        );
        setCode('');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to redeem code');
    } finally {
      setLoading(false);
    }
  };

  const formatCode = (text: string) => {
    // Remove spaces and convert to uppercase
    const cleaned = text.replace(/\s/g, '').toUpperCase();
    
    // Add dashes every 4 characters
    const formatted = cleaned.match(/.{1,4}/g)?.join('-') || cleaned;
    
    return formatted;
  };

  const handleCodeChange = (text: string) => {
    const formatted = formatCode(text);
    setCode(formatted);
  };

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView 
          className="flex-1 px-4"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between py-6">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white mb-2">
                🎫 Promo Code
              </Text>
              <Text className="text-white/70">
                Enter your code to unlock premium
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="bg-white/10 rounded-full p-2"
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Code Input Card */}
          <Card className="mb-4">
            <View className="items-center mb-4">
              <View className="bg-white/10 rounded-full p-6 mb-4">
                <Ionicons name="ticket-outline" size={48} color="#10B981" />
              </View>
              <Text className="text-xl font-bold text-white mb-2">
                Enter Promo Code
              </Text>
              <Text className="text-white/70 text-center text-sm">
                Get premium access without payment
              </Text>
            </View>

            <TextInput
              value={code}
              onChangeText={handleCodeChange}
              placeholder="XXXX-XXXX-XXXX"
              placeholderTextColor="rgba(255,255,255,0.4)"
              className="bg-white/10 text-white text-center text-2xl font-bold p-4 rounded-xl mb-4"
              autoCapitalize="characters"
              maxLength={14} // 12 characters + 2 dashes
              autoCorrect={false}
              editable={!loading}
            />

            <View className="space-y-3">
              <Pressable
                onPress={handleValidate}
                disabled={loading || !code.trim()}
                className={`p-4 rounded-xl ${
                  loading || !code.trim() ? 'bg-white/10' : 'bg-gradient-to-r from-green-500 to-emerald-600'
                }`}
                style={
                  !loading && code.trim()
                    ? {
                        backgroundColor: '#10B981',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 6,
                        elevation: 8,
                      }
                    : {}
                }
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-bold text-center text-base">
                    Validate & Redeem Code
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={onClose}
                disabled={loading}
                className="bg-white/5 p-4 rounded-xl border border-white/20"
              >
                <Text className="text-white/80 font-semibold text-center text-base">
                  Cancel
                </Text>
              </Pressable>
            </View>
          </Card>

          {/* Info Card */}
          <Card className="mb-4">
            <Text className="text-lg font-bold text-white mb-3">
              ℹ️ How it Works
            </Text>
            
            <View className="space-y-2">
              <View className="flex-row items-start">
                <Text className="text-green-400 font-bold mr-2">1.</Text>
                <Text className="text-white/80 flex-1">
                  Enter your promo code above
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text className="text-green-400 font-bold mr-2">2.</Text>
                <Text className="text-white/80 flex-1">
                  Click "Validate & Redeem Code"
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text className="text-green-400 font-bold mr-2">3.</Text>
                <Text className="text-white/80 flex-1">
                  Enjoy premium features instantly!
                </Text>
              </View>
            </View>

            <View className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <Text className="text-green-400 text-sm text-center">
                ✨ No payment required • Instant activation
              </Text>
            </View>
          </Card>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}


