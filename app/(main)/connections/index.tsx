import React, { useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { AppShell } from '../../../components/ui/AppShell';
import { SectionHeader, SearchInput } from '../../../components/ui/DataDisplay';
import { IntegrationCard } from '../../../components/integrations/IntegrationCard';
import { LoadingState } from '../../../components/ui/States';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';

export default function ConnectionsScreen() {
  const [search, setSearch] = useState('');
  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => api.integrations.list(),
  });

  const filtered = integrations?.filter(i => i.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <AppShell className="px-0">
      <View className="px-4">
        <SectionHeader title="Connected Apps" />
        <View className="mb-6">
          <SearchInput value={search} onChangeText={setSearch} placeholder="Search integrations..." />
        </View>
      </View>
      
      {isLoading ? (
        <LoadingState message="Loading integrations..." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <IntegrationCard integration={item} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text className="text-muted text-center mt-10 text-base">No integrations found</Text>
          }
        />
      )}
    </AppShell>
  );
}
