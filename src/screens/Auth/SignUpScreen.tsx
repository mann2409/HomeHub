import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import GradientBackground from '../../components/GradientBackground';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuthStore } from '../../state/authStore';

interface SignUpScreenProps {
  onSwitchToSignIn?: () => void;
}

export default function SignUpScreen({ onSwitchToSignIn }: SignUpScreenProps) {
  const insets = useSafeAreaInsets();
  const { signUp, isLoading, error, clearError } = useAuthStore();
  const navigation = useNavigation();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      clearError();
      await signUp(name.trim(), email.trim(), password);
      Alert.alert('Success', 'Account created successfully!');
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Handle specific Firebase errors with user-friendly messages
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already registered. Please use a different email or try signing in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Sign Up Failed', errorMessage);
    }
  };

  return (
    <GradientBackground style={{ paddingTop: insets.top }}>
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="p-4">
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-4">
              <Ionicons name="person-add" size={40} color="#FFFFFF" />
            </View>
            <Text className="text-3xl font-bold text-white mb-2">
              Create Account
            </Text>
            <Text className="text-white/80 text-center">
              Join HomeHub to manage your daily tasks and expenses
            </Text>
          </View>

          <Card className="mb-6">
            <View className="mb-6">
              <Input
                label="Full Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                autoCapitalize="words"
                autoCorrect={false}
                labelClassName="text-white/80"
              />
            </View>

            <View className="mb-6">
              <Input
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                labelClassName="text-white/80"
              />
            </View>

            <View className="mb-6">
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                labelClassName="text-white/80"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8"
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="rgba(255, 255, 255, 0.6)" 
                />
              </Pressable>
            </View>

            <View className="mb-6">
              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry={!showConfirmPassword}
                labelClassName="text-white/80"
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-8"
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="rgba(255, 255, 255, 0.6)" 
                />
              </Pressable>
            </View>

            {error && (
              <View className="mb-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                <Text className="text-red-400 text-sm text-center">
                  {error}
                </Text>
              </View>
            )}

            <Button
              title="Create Account"
              onPress={handleSignUp}
              disabled={isLoading}
              className="mb-4"
            />

            <Button
              title="Cancel"
              variant="outline"
              onPress={() => {
                if (onSwitchToSignIn) {
                  onSwitchToSignIn();
                } else {
                  // @ts-ignore - navigation exists in app container
                  navigation.goBack?.();
                }
              }}
              disabled={isLoading}
              className="mb-4"
            />

            <View className="flex-row items-center justify-center">
              <Text className="text-white/60 text-sm">
                Already have an account?{' '}
              </Text>
              <Pressable onPress={onSwitchToSignIn}>
                <Text className="text-white font-semibold text-sm">
                  Sign In
                </Text>
              </Pressable>
            </View>
          </Card>

          <View className="items-center">
            <Text className="text-white/40 text-xs text-center">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}
