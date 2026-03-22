import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { AppShell } from '../../components/ui/AppShell';
import { PrimaryButton, SecondaryButton } from '../../components/ui/Buttons';
import { useRouter } from 'expo-router';
import { Bot, Link as LinkIcon, Zap } from 'lucide-react-native';

const SLIDES = [
  {
    title: 'Your Personal AI',
    description: 'Meet MyMe, the premium AI assistant designed to understand you and help you navigate your day.',
    icon: Bot,
  },
  {
    title: 'Connected to Your World',
    description: 'Seamlessly link Gmail, Calendar, GitHub, and more. MyMe works across all your favorite tools.',
    icon: LinkIcon,
  },
  {
    title: 'Takes Action For You',
    description: 'Not just a chatbot. MyMe can send emails, schedule meetings, and manage tasks autonomously.',
    icon: Zap,
  }
];

export default function OnboardingScreen() {
  const [slideIndex, setSlideIndex] = useState(0);
  const router = useRouter();

  const nextSlide = () => {
    if (slideIndex < SLIDES.length - 1) {
      setSlideIndex(slideIndex + 1);
    } else {
      router.push('/(auth)/sign-in');
    }
  };

  const SlideIcon = SLIDES[slideIndex].icon;

  return (
    <AppShell className="justify-between pb-8">
      <View className="flex-1 justify-center items-center px-4 mt-12">
        <View className="w-24 h-24 bg-surface rounded-[32px] items-center justify-center mb-10 border border-border shadow-md">
          <SlideIcon size={48} color="#3b82f6" />
        </View>
        <Text className="text-white text-3xl font-extrabold text-center mb-4 tracking-tight">
          {SLIDES[slideIndex].title}
        </Text>
        <Text className="text-muted text-lg text-center leading-relaxed">
          {SLIDES[slideIndex].description}
        </Text>
      </View>

      <View className="flex-row justify-center mb-10">
        {SLIDES.map((_, i) => (
          <View
            key={i}
            className={`h-1.5 rounded-full mx-1 ${i === slideIndex ? 'w-8 bg-primary' : 'w-2 bg-surface'}`}
          />
        ))}
      </View>

      <View className="space-y-4">
        <PrimaryButton 
          title={slideIndex === SLIDES.length - 1 ? "Get Started" : "Continue"} 
          onPress={nextSlide} 
        />
        {slideIndex < SLIDES.length - 1 && (
          <View className="mt-4">
            <SecondaryButton title="Skip Onboarding" onPress={() => router.push('/(auth)/sign-in')} />
          </View>
        )}
      </View>
    </AppShell>
  );
}
