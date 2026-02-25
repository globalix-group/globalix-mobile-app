import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ExploreMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
}

interface ExploreMapProps {
  mapRef: React.RefObject<any>;
  markers: ExploreMarker[];
  selectedMarker: string | null;
  onMarkerPress: (markerId: string) => void;
  theme: { primary: string; card?: string; border?: string; text?: string; secondary?: string };
}

export const ExploreMap: React.FC<ExploreMapProps> = ({ theme }) => {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card || '#F8FAFC',
          borderColor: theme.border || '#E2E8F0',
        },
      ]}
    >
      <Ionicons name="map" size={42} color={theme.secondary || '#94A3B8'} />
      <Text style={[styles.title, { color: theme.text || '#0F172A' }]}>Map preview unavailable on web</Text>
      <Text style={[styles.subtitle, { color: theme.secondary || '#64748B' }]}>Open the mobile app to view the interactive map.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 20,
    margin: 14,
    padding: 20,
  },
  title: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 13, textAlign: 'center' },
});
