import React, { useState } from 'react';
import { View, Text, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { useAuthStore } from '../state/authStore';

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ visible, onClose }: ForgotPasswordModalProps) {
  const { forgotPassword, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');

  console.log('ForgotPasswordModal rendered, visible:', visible);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      await forgotPassword(email.trim());
      Alert.alert(
        'Password Reset Email Sent',
        'Check your email for instructions to reset your password.',
        [
          {
            text: 'OK',
            onPress: () => {
              setEmail('');
              onClose();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Forgot password error:', error);
      
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const handleClose = () => {
    setEmail('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title="Reset Password"
      size="md"
    >
      <View className="p-6">
        <View className="mb-6">
          <View className="w-16 h-16 bg-blue-500/20 rounded-full items-center justify-center mx-auto mb-4">
            <Ionicons name="mail" size={32} color="#3B82F6" />
          </View>
          <Text className="text-lg font-semibold text-white text-center mb-2">
            Forgot Your Password?
          </Text>
          <Text className="text-white/70 text-center leading-6">
            Enter your email address and we'll send you a link to reset your password.
          </Text>
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
            autoFocus
          />
        </View>

        <Button
          title="Send Reset Email"
          onPress={handleResetPassword}
          loading={isLoading}
          disabled={!email.trim() || isLoading}
          className="mb-4"
        />

        <Pressable
          onPress={handleClose}
          className="py-3"
        >
          <Text className="text-white/70 text-center">
            Remember your password? <Text className="text-primary font-medium">Sign In</Text>
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}
