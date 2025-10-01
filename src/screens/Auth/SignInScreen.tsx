import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuthStore } from '../../state/authStore';

interface SignInScreenProps {
  onSwitchToSignUp?: () => void;
}

export default function SignInScreen({ onSwitchToSignUp }: SignInScreenProps) {
  const insets = useSafeAreaInsets();
  const { signIn, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      clearError();
      await signIn(email.trim(), password);
      Alert.alert('Success', 'Welcome back!');
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Handle specific Firebase errors with user-friendly messages
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address. Please check your email or create a new account.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Sign In Failed', errorMessage);
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
              <Ionicons name="person" size={40} color="#FFFFFF" />
            </View>
            <Text className="text-3xl font-bold text-white mb-2">
              Welcome Back
            </Text>
            <Text className="text-white/80 text-center">
              Sign in to continue managing your daily tasks
            </Text>
          </View>

          <Card className="mb-6">
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

            {error && (
              <View className="mb-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                <Text className="text-red-400 text-sm text-center">
                  {error}
                </Text>
              </View>
            )}

            <Button
              title="Sign In"
              onPress={handleSignIn}
              disabled={isLoading}
              className="mb-4"
            />

            <View className="flex-row items-center justify-center">
              <Text className="text-white/60 text-sm">
                Don't have an account?{' '}
              </Text>
              <Pressable onPress={onSwitchToSignUp}>
                <Text className="text-white font-semibold text-sm">
                  Create Account
                </Text>
              </Pressable>
            </View>
          </Card>

          <View className="items-center mt-4">
            <Pressable onPress={() => {
              console.log('Forgot password pressed');
              // Temporary: Use Alert to get email and send reset
              Alert.prompt(
                'Reset Password',
                'Enter your email address to receive a password reset link:',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Send Reset Email',
                    onPress: async (email) => {
                      if (email && email.trim()) {
                        try {
                          const { forgotPassword } = useAuthStore.getState();
                          await forgotPassword(email.trim());
                          Alert.alert(
                            'Success',
                            'Password reset email sent! Check your inbox for instructions.'
                          );
                        } catch (error: any) {
                          let errorMessage = 'An error occurred. Please try again.';
                          if (error.code === 'auth/user-not-found') {
                            errorMessage = 'No account found with this email address.';
                          } else if (error.code === 'auth/invalid-email') {
                            errorMessage = 'Please enter a valid email address.';
                          }
                          Alert.alert('Error', errorMessage);
                        }
                      } else {
                        Alert.alert('Error', 'Please enter your email address.');
                      }
                    }
                  }
                ],
                'plain-text',
                email
              );
            }}>
              <Text className="text-white/60 text-sm">
                Forgot your password?
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}
