import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Check, Star, Zap, Crown } from 'lucide-react-native';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for trying out MyMe.',
    icon: Star,
    color: '#A1A1AA',
    features: ['50 Messages / month', 'GPT-4o Mini Access', 'Basic Integrations', 'Standard Support'],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: '$9.99',
    period: '/month',
    description: 'For moderate daily usage.',
    icon: Zap,
    color: '#3B82F6',
    features: ['500 Messages / month', 'GPT-4o Access', 'All Premium Integrations', 'Custom Instructions'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19.99',
    period: '/month',
    description: 'Power users and professionals.',
    icon: Crown,
    color: '#8B5CF6',
    popular: true,
    features: ['2,000 Messages / month', 'Priority API Routing', 'Advanced Persona Tuning', 'Priority Support'],
  },
  {
    id: 'pro_plus',
    name: 'Pro+',
    price: '$49.99',
    period: '/month',
    description: 'Unlimited potential.',
    icon: Crown,
    color: '#F59E0B',
    features: ['Unlimited Messages', 'Highest Speed Tier', 'Early Access Features', '24/7 Dedicated Support'],
  }
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const currentPlan = 'free';

  return (
    <View className="flex-1 bg-[#09090B]">
      <Stack.Screen 
        options={{ 
          headerTitle: 'Upgrade Plan', 
          headerStyle: { backgroundColor: '#09090B' }, 
          headerTintColor: '#fff',
          headerShadowVisible: false 
        }} 
      />
      <ScrollView className="flex-1 px-4 pt-6 pb-12" showsVerticalScrollIndicator={false}>
        <View className="mb-8 items-center">
          <Text className="text-white text-3xl font-bold mb-2">Unlock Your Potential</Text>
          <Text className="text-zinc-400 text-center">
            Choose the perfect plan for your automated lifestyle. Cancel anytime.
          </Text>
        </View>

        <View className="space-y-4 mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = currentPlan === plan.id;
            
            return (
              <TouchableOpacity 
                key={plan.id}
                className={`relative bg-surface/50 border rounded-2xl p-5 overflow-hidden ${
                  plan.popular ? 'border-[#8B5CF6]' : 'border-border/50'
                }`}
              >
                {plan.popular && (
                  <View className="absolute top-0 right-0 bg-[#8B5CF6] px-3 py-1 rounded-bl-xl">
                    <Text className="text-white text-xs font-bold uppercase tracking-wider">Most Popular</Text>
                  </View>
                )}

                <View className="flex-row items-center mb-4 mt-2">
                  <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${plan.color}20` }}>
                    <Icon size={20} color={plan.color} />
                  </View>
                  <View>
                    <Text className="text-white font-bold text-xl">{plan.name}</Text>
                    <Text className="text-zinc-400 text-sm">{plan.description}</Text>
                  </View>
                </View>

                <View className="flex-row items-end mb-6">
                  <Text className="text-white text-3xl font-bold">{plan.price}</Text>
                  <Text className="text-zinc-500 font-medium mb-1 ml-1">{plan.period}</Text>
                </View>

                <View className="space-y-3 mb-6">
                  {plan.features.map((feat, idx) => (
                    <View key={idx} className="flex-row items-center">
                      <Check size={16} color={plan.color} />
                      <Text className="text-zinc-300 ml-3">{feat}</Text>
                    </View>
                  ))}
                </View>

                <View 
                  className={`py-3 rounded-xl items-center justify-center ${
                    isCurrent ? 'bg-surface border border-border' : 'bg-primary'
                  }`}
                  style={!isCurrent ? { backgroundColor: plan.color } : {}}
                >
                  <Text className={`font-bold ${isCurrent ? 'text-zinc-400' : 'text-white'}`}>
                    {isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
