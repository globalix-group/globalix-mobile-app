import React from 'react';
import MapView, { Marker } from 'react-native-maps';

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
  theme: { primary: string };
}

export const ExploreMap: React.FC<ExploreMapProps> = ({
  mapRef,
  markers,
  selectedMarker,
  onMarkerPress,
  theme,
}) => {
  return (
    <MapView
      ref={mapRef}
      style={{ width: '100%', height: '100%' }}
      initialRegion={{
        latitude: 43.6629,
        longitude: -79.3957,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      }}
      showsUserLocation={true}
      showsMyLocationButton={true}
      toolbarEnabled={true}
      provider="google"
      pitchEnabled={true}
      rotateEnabled={true}
      scrollEnabled={true}
      zoomEnabled={true}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
          title={marker.title}
          description={marker.description}
          pinColor={selectedMarker === marker.id ? '#FF6B6B' : theme.primary}
          onPress={() => onMarkerPress(marker.id)}
        />
      ))}
    </MapView>
  );
};
