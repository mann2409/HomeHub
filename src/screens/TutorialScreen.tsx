import React, { useMemo } from 'react';
import { View, Text, ScrollView, Image, Pressable, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GradientBackground from '../components/GradientBackground';
import { guideBus } from '../utils/guideBus';
import Card from '../components/Card';
import useSettingsStore from '../state/settingsStore';

interface TutorialScreenProps { onClose?: () => void }

export default function TutorialScreen({ onClose }: TutorialScreenProps) {
  const insets = useSafeAreaInsets();
  const { showTutorialOnStart, setShowTutorialOnStart } = useSettingsStore();

  const sections = useMemo(() => ([
    { title: 'Dashboard', text: 'Get a quick overview of today: tasks, meals, spending and shopping.' },
    { title: 'Tasks', text: 'Create tasks with priority and repeat rules. Swipe to complete or edit.' },
    { title: 'Meals', text: 'Plan meals for the week and keep your grocery shopping focused.' },
    { title: 'Finance', text: 'Track expenses by category and watch charts update instantly.' },
    { title: 'Shopping', text: 'Build smart shopping lists. Items auto‑group and are easy to check off.' },
  ]), []);

  return (
    <GradientBackground style={{ paddingTop: insets.top }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="p-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-white">Quick Tutorial</Text>
            {onClose && (
              <Pressable onPress={onClose} className="px-3 py-2 rounded-lg bg-white/15">
                <Text className="text-white">Close</Text>
              </Pressable>
            )}
          </View>

          <Card className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white/90">Show on first launch</Text>
              <Switch value={showTutorialOnStart} onValueChange={setShowTutorialOnStart} />
            </View>
            <Text className="text-white/60 text-xs">You can open this anytime from the Help button in the header or Settings.</Text>
          </Card>

          <Card className="mb-4">
            <Text className="text-lg font-semibold text-white mb-2">Interactive Guide</Text>
            <Text className="text-white/80 mb-3">We’ll walk you through adding your first expense.</Text>
            <Pressable onPress={() => { onClose?.(); setTimeout(() => guideBus.emit({ type:'guide:start', scenario:'expense' }), 100); }} className="bg-white/15 rounded-lg px-4 py-3">
              <Text className="text-white text-center font-semibold">Start “Add Expense” Guide</Text>
            </Pressable>
          </Card>

          {sections.map((s) => (
            <Card key={s.title} className="mb-4">
              <Text className="text-lg font-semibold text-white mb-2">{s.title}</Text>
              <Text className="text-white/80">{s.text}</Text>
            </Card>
          ))}

          <Card>
            <Text className="text-lg font-semibold text-white mb-2">FAQ</Text>
            <Text className="text-white/80 mb-2">Q: How do I back up data?
            {'\n'}A: Settings → Data Management → Export All Data as JSON.</Text>
            <Text className="text-white/80 mb-2">Q: Can I sync with my family?
            {'\n'}A: Invite family in Settings → Family to share lists and tasks.</Text>
            <Text className="text-white/80">Q: Notifications aren’t showing.
            {'\n'}A: Enable in Settings → Notifications and in iOS Settings.</Text>
          </Card>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}


