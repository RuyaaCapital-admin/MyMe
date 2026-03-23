import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { FlatList, Text, View } from "react-native";
import { IntegrationCard } from "../../../components/integrations/IntegrationCard";
import { AppShell } from "../../../components/ui/AppShell";
import { SearchInput, SectionHeader } from "../../../components/ui/DataDisplay";
import { LoadingState } from "../../../components/ui/States";
import { api } from "../../../services/api";

export default function ConnectionsScreen() {
  const [search, setSearch] = useState("");
  const {
    data: integrations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["integrations"],
    queryFn: () => api.integrations.list(),
  });

  const filtered =
    integrations?.filter((i) =>
      i.name.toLowerCase().includes(search.toLowerCase()),
    ) || [];

  return (
    <AppShell className="px-0">
      <View className="px-4">
        <SectionHeader title="Connected Apps" />
        <View className="mb-6">
          <SearchInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search integrations..."
          />
        </View>
      </View>
      {error && error.message === "REQUIRES_AUTH" ? (
        <Text className="text-amber-400 text-center mt-10 text-base font-medium">
          Sign in required to view and manage integrations.
        </Text>
      ) : isLoading ? (
        <LoadingState message="Loading integrations..." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <IntegrationCard integration={item} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text className="text-muted text-center mt-10 text-base">
              No integrations found
            </Text>
          }
        />
      )}
    </AppShell>
  );
}
