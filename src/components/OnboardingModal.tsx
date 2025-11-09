import React, { useMemo, useState } from 'react';
import { View, Text, Image, Pressable, Dimensions, ScrollView, Switch, ImageSourcePropType } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useSettingsStore from '../state/settingsStore';

type Step = {
  key: string;
  title: string;
  subtitle?: string;
  image?: ImageSourcePropType; // image or video source (uri pointing to .mp4/.mov will render as video)
};

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  images?: Partial<Record<string, ImageSourcePropType>>; // optional mapping from step key to image (local require or URI)
  videos?: Partial<Record<string, any>>; // optional mapping from step key to video source (require or {uri})
}

export default function OnboardingModal({ visible, onClose, images, videos }: OnboardingModalProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get('window');
  const { showTutorialOnStart, setShowTutorialOnStart } = useSettingsStore();

  const steps: Step[] = useMemo(() => [
    { key: 'settings', title: 'Settings', subtitle: 'Manage families, invites, and preferences here.', image: images?.settings },
    { key: 'dashboard', title: 'Dashboard', subtitle: 'Quick snapshot of tasks, meals, and budget.', image: images?.dashboard },
    { key: 'dashboard2', title: 'Dashboard', subtitle: 'More dashboard tips and interactions.' },
    { key: 'calendar', title: 'Calendar', subtitle: 'Plan events and keep everyone in sync.', image: images?.calendar },
    { key: 'meals', title: 'Meals', subtitle: 'Plan weekly meals with ease.', image: images?.meals },
    { key: 'recipeSearch', title: 'Recipe Search', subtitle: 'Explore recipes and add to your plan.', image: images?.recipeSearch },
    { key: 'generateShopping', title: 'Generate Shopping List', subtitle: 'Build a grocery list from planned meals.', image: images?.generateShopping },
    { key: 'finances', title: 'Finances', subtitle: 'Track spending and stay on budget.', image: images?.finances },
    { key: 'groceryList', title: 'Grocery List', subtitle: 'Shop together and track progress.', image: images?.groceryList },
  ], [images]);

  const [index, setIndex] = useState(0);

  if (!visible) return null;

  const step = steps[index];

  return (
    <View style={{ position:'absolute', left:0, right:0, top:0, bottom:0, backgroundColor:'#0B1220E6', paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16, zIndex: 9999 }}>
      <View style={{ position:'absolute', top: insets.top + 8, right: 16, zIndex: 10000 }}>
        <Pressable
          onPress={onClose}
          style={{ paddingVertical:8, paddingHorizontal:12, backgroundColor:'rgba(255,255,255,0.96)', borderRadius:12 }}
          accessibilityRole="button"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={{ color:'#111827', fontWeight:'700' }}>Close</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 36, paddingBottom: 24 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color:'#FFFFFF', fontSize:20, fontWeight:'800', textAlign:'center', marginBottom:10 }}>{step.title}</Text>
          {!!step.subtitle && (
            <Text style={{ color:'#D1D5DB', textAlign:'center', marginBottom:16 }}>{step.subtitle}</Text>
          )}

          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {(videos && videos[step.key]) ? (
              <Video
                source={videos[step.key]}
                style={{ width: width - 32, height: Math.min(height * 0.55, 600), alignSelf:'center', borderRadius:16, backgroundColor:'#0F172A' }}
                resizeMode={ResizeMode.CONTAIN}
                isLooping
                shouldPlay
                useNativeControls={false}
                isMuted
              />
            ) : step.image ? (
              // Render video if the source URI ends with a common video extension
              (typeof step.image === 'object' && 'uri' in (step.image as any) && /\.(mp4|mov|m4v)$/i.test(((step.image as any).uri || ''))) ? (
                <Video
                  source={step.image as any}
                  style={{ width: width - 32, height: Math.min(height * 0.55, 600), alignSelf:'center', borderRadius:16, backgroundColor:'#0F172A' }}
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                  shouldPlay
                  useNativeControls={false}
                  isMuted
                />
              ) : (
                <Image
                  source={step.image}
                  style={{ width: width - 32, height: Math.min(height * 0.55, 600), alignSelf:'center', borderRadius:16, backgroundColor:'#0F172A' }}
                  resizeMode="contain"
                />
              )
            ) : (
              <View style={{ width: width - 32, height: Math.min(height * 0.45, 500), alignSelf:'center', borderRadius:16, backgroundColor:'#111827', alignItems:'center', justifyContent:'center' }}>
                <Text style={{ color:'#9CA3AF' }}>Add an image for "{step.title}"</Text>
              </View>
            )}
          </ScrollView>

          <View style={{ marginTop:16, flexDirection:'row', alignItems:'center', justifyContent:'center' }}>
            {steps.map((_, i) => (
              <View key={i} style={{ width:8, height:8, borderRadius:4, marginHorizontal:4, backgroundColor: i === index ? '#60A5FA' : '#374151' }} />
            ))}
          </View>
        </View>

        <View style={{ marginTop:18, flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
          <Pressable onPress={() => setIndex((i) => Math.max(i - 1, 0))} disabled={index === 0} style={{ paddingVertical:12, paddingHorizontal:18, borderRadius:10, backgroundColor: index === 0 ? '#1F2937' : '#374151' }}>
            <Text style={{ color:'#E5E7EB', fontWeight:'700' }}>Back</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              if (index === steps.length - 1) {
                onClose();
                return;
              }
              setIndex((i) => Math.min(i + 1, steps.length - 1));
            }}
            style={{ paddingVertical:12, paddingHorizontal:18, borderRadius:10, backgroundColor:'#2563EB' }}
          >
            <Text style={{ color:'white', fontWeight:'800' }}>{index === steps.length - 1 ? 'Done' : 'Next'}</Text>
          </Pressable>
        </View>

        <View style={{ marginTop:18, flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:'#0B1220', borderRadius:12, padding:12 }}>
          <Text style={{ color:'#E5E7EB' }}>Show on sign in</Text>
          <Switch value={showTutorialOnStart} onValueChange={setShowTutorialOnStart} />
        </View>
      </View>
    </View>
  );
}


