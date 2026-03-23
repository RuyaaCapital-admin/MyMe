import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { CustomDrawerContent } from '../../components/ui/DrawerContent';
import { useAuthStore } from '../../store/useAuthStore';
import { useEffect } from 'react';

export default function MainLayout() {
  return (
    <Drawer 
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#09090B',
          width: 320,
        },
      }}
    >
      <Drawer.Screen name="chat" />
      <Drawer.Screen name="connections" />
      <Drawer.Screen name="settings" />
    </Drawer>
  );
}
