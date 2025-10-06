import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import useFamilyStore from '../state/familyStore';
import { useAuthStore } from '../state/authStore';

export default function FamilySettings() {
  const { familyIds, activeFamilyId, families, isLoading, loadFamily, subscribeToFamily, createFamily, joinFamily, leaveFamily, getActiveFamily, setActiveFamily } = useFamilyStore();
  const { user, userName } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const activeFamily = getActiveFamily();

  // Debug: Monitor loading state
  useEffect(() => {
    console.log('FamilySettings - isLoading:', isLoading);
  }, [isLoading]);

  const handleLeaveFamily = (familyId: string) => {
    Alert.alert(
      'Leave Family',
      'Are you sure you want to leave this family? You can join again using the invite code.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🔄 Starting to leave family:', familyId);
              await leaveFamily(familyId);
              console.log('✅ Successfully left family');
              Alert.alert('Success', 'You have left the family');
            } catch (error: any) {
              console.error('❌ Error leaving family:', error);
              Alert.alert('Error', error.message || 'Failed to leave family');
            } finally {
              console.log('🏁 Leave family operation complete');
            }
          },
        },
      ]
    );
  };

  // NOTE: Removed duplicate subscription - useFamilySync hook already handles this!

  const handleCreateFamily = async () => {
    if (!user) return;
    
    const name = familyName.trim() || `${userName || user.email}'s Household`;
    
    try {
      const familyId = await createFamily(
        name,
        user.uid,
        user.email || '',
        userName || user.displayName || 'User'
      );
      Alert.alert('Success', `Family "${name}" created successfully!`);
      setFamilyName('');
      setShowCreateForm(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create family');
    }
  };

  const handleJoinFamily = async () => {
    if (!user || !inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }
    
    try {
      await joinFamily(
        inviteCode.trim(),
        user.uid,
        user.email || '',
        userName || user.displayName || 'User'
      );
      Alert.alert('Success', 'You have joined the family!');
      setInviteCode('');
      setShowJoinForm(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join family');
    }
  };

  const handleShareInviteCode = async () => {
    if (!activeFamily) return;

    try {
      await Share.share({
        message: `Join my HomeHub family! Use invite code: ${activeFamily.inviteCode}\n\nDownload HomeHub and enter this code to share our calendar, shopping lists, and more!`,
        title: 'Join My HomeHub Family',
      });
    } catch (error) {
      console.error('Error sharing invite code:', error);
    }
  };

  const handleCopyInviteCode = () => {
    // In a real app, use Clipboard API
    Alert.alert(
      'Invite Code',
      activeFamily?.inviteCode || '',
      [{ text: 'OK' }]
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Show Join/Create forms if requested or if no families exist
  if (showJoinForm || showCreateForm || familyIds.length === 0) {
    return (
      <Card className="mb-4">
        <View className="flex-row items-center mb-4">
          <View className="w-12 h-12 bg-purple-500/20 rounded-full items-center justify-center mr-3">
            <Ionicons name="people" size={24} color="#A78BFA" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">
              {showJoinForm ? 'Join a Household' : 'Create a Household'}
            </Text>
            <Text className="text-white/60 text-sm">
              {familyIds.length > 0 ? 'Add another family' : 'Share data with family members'}
            </Text>
          </View>
          {familyIds.length > 0 && (
            <Pressable onPress={() => { setShowJoinForm(false); setShowCreateForm(false); }}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>
          )}
        </View>

        {showCreateForm || (!showJoinForm && familyIds.length === 0) ? (
          <>
            {/* Create Family Form */}
            <View className="mb-4">
              <Input
                label="Household Name (optional)"
                value={familyName}
                onChangeText={setFamilyName}
                placeholder="The Smith Family"
                labelClassName="text-white/80"
              />
            </View>

            <Button
              title={isLoading ? "Creating..." : "Create Household"}
              onPress={handleCreateFamily}
              disabled={isLoading}
              className="bg-purple-600 mb-3"
            />

            <Pressable 
              onPress={() => { setShowJoinForm(true); setShowCreateForm(false); }}
              className="py-2"
            >
              <Text className="text-center text-white/60 text-sm">
                Already have an invite code? <Text className="text-purple-400 font-semibold">Join Family</Text>
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            {/* Join Family Form */}
            <View className="mb-4">
              <Input
                label="Invite Code"
                value={inviteCode}
                onChangeText={(text) => setInviteCode(text.toUpperCase())}
                placeholder="ABC123"
                autoCapitalize="characters"
                maxLength={6}
                labelClassName="text-white/80"
              />
            </View>

            <Button
              title={isLoading ? "Joining..." : "Join Household"}
              onPress={handleJoinFamily}
              disabled={isLoading || !inviteCode.trim()}
              className="bg-green-600 mb-3"
            />

            {familyIds.length === 0 && (
              <Pressable 
                onPress={() => { setShowJoinForm(false); setShowCreateForm(true); }}
                className="py-2"
              >
                <Text className="text-center text-white/60 text-sm">
                  Don't have a code? <Text className="text-purple-400 font-semibold">Create Family</Text>
                </Text>
              </Pressable>
            )}
          </>
        )}

        <View className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#60A5FA" />
            <Text className="text-blue-300 text-xs ml-2 flex-1">
              {showJoinForm 
                ? 'Enter the invite code shared by your family member to join their household and access shared data.'
                : 'Create a household to share your calendar, shopping lists, tasks, and meal plans with family members in real-time!'
              }
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  // Show family list and options
  return (
    <>
      {/* Active Family Card */}
      {activeFamily && (
        <Card className="mb-4">
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 bg-purple-500/20 rounded-full items-center justify-center mr-3">
              <Ionicons name="people" size={24} color="#A78BFA" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg">{activeFamily.name}</Text>
              <Text className="text-white/60 text-sm">
                {activeFamily.members.filter(m => m.status === 'ACTIVE').length} active member(s)
              </Text>
            </View>
          </View>

          {/* Family Members - Show only ACTIVE members */}
          <View className="mb-4">
            <Text className="text-white/80 font-semibold mb-2">Family Members</Text>
            {activeFamily.members.filter(member => member.status === 'ACTIVE').map((member, index) => (
          <View key={index} className="flex-row items-center py-2 border-b border-white/10">
            <View className="w-8 h-8 bg-blue-500/20 rounded-full items-center justify-center mr-3">
              <Text className="text-blue-400 font-bold">{member.name.charAt(0)}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white">{member.name}</Text>
              <Text className="text-white/40 text-xs">{member.email}</Text>
            </View>
            {member.role === 'owner' && (
              <View className="bg-purple-500/20 px-2 py-1 rounded">
                <Text className="text-purple-400 text-xs">Owner</Text>
              </View>
            )}
          </View>
        ))}
      </View>

          {/* Invite Code Section */}
          <View className="bg-white/5 rounded-lg p-4 mb-4">
            <Text className="text-white/80 text-sm mb-2">Invite Code</Text>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white text-2xl font-bold tracking-widest">
                {activeFamily.inviteCode}
              </Text>
              <Pressable 
                onPress={handleCopyInviteCode}
                className="bg-white/10 px-3 py-2 rounded-lg active:opacity-70"
              >
                <Ionicons 
                  name={copied ? "checkmark" : "copy"} 
                  size={20} 
                  color={copied ? "#4ADE80" : "#FFFFFF"} 
                />
              </Pressable>
            </View>
            <Text className="text-white/60 text-xs">
              Share this code with family members so they can join and access shared data
            </Text>
          </View>

          {/* Share Button */}
          <Button
            title="Share Invite Code"
            onPress={handleShareInviteCode}
            disabled={isLoading}
            className="bg-purple-600 mb-3"
          />

          {/* Leave Family Button */}
          {activeFamilyId && (
            <Pressable
              onPress={() => handleLeaveFamily(activeFamilyId)}
              disabled={isLoading}
              className={`py-3 border border-red-500/30 rounded-xl ${isLoading ? 'opacity-50' : 'active:opacity-70'}`}
            >
              <Text className="text-red-400 text-center font-semibold">
                {isLoading ? 'Leaving...' : 'Leave Family'}
              </Text>
            </Pressable>
          )}

          {/* Info */}
          <View className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#60A5FA" />
              <Text className="text-blue-300 text-xs ml-2 flex-1">
                All family members share the same calendar, shopping lists, tasks, and meal plans. Changes sync in real-time.
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Join/Create Buttons - Always visible */}
      <Card className="mb-4">
        <Text className="text-white font-semibold mb-3">Manage Families</Text>
        
        <Button
          title="Join Another Family"
          onPress={() => setShowJoinForm(true)}
          disabled={isLoading}
          className="bg-green-600 mb-2"
        />
        
        <Button
          title="Create New Family"
          onPress={() => setShowCreateForm(true)}
          disabled={isLoading}
          className="bg-purple-600"
        />
      </Card>
    </>
  );
}

