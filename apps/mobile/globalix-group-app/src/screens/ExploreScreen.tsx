import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  useWindowDimensions,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from '../theme/ThemeContext';

const TRENDING_SPOTS = [
  { id: '1', name: 'Waterfront Living', tag: 'Vibe', image: 'https://images.unsplash.com/photo-1519067786945-fc99d6d55b2d?q=80&w=800' },
  { id: '2', name: 'Downtown Penthouse', tag: 'Luxury', image: 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?q=80&w=800' },
  { id: '3', name: 'Exotic Rentals', tag: 'Cars', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800' },
  { id: '4', name: 'Hidden Estates', tag: 'Secret', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800' },
];

const MAP_MARKERS = [
  { id: '1', latitude: 43.6629, longitude: -79.3957, title: 'Downtown Toronto', description: '245 Properties' },
  { id: '2', latitude: 43.6000, longitude: -79.6000, title: 'Oakville', description: '156 Properties' },
  { id: '3', latitude: 43.2055, longitude: -79.8711, title: 'Hamilton', description: '189 Properties' },
  { id: '4', latitude: 43.4516, longitude: -79.6833, title: 'Burlington', description: '98 Properties' },
];

export const ExploreScreen = () => {
  const { theme, isDark } = useTheme();
  const { width, height } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState('Map');
  const [userLocation, setUserLocation] = useState<any>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [is3D, setIs3D] = useState(false);
  const [cameraAngle, setCameraAngle] = useState(0);
  const mapRef = useRef<MapView>(null);
  
  // Responsive sizing
  const gridItemSize = (width - (width * 0.1) - 20) / 2;
  const titleSize = width > 600 ? 32 : 28;
  const subtitleSize = width > 600 ? 22 : 18;
  const mapHeight = height > 800 ? 380 : 300;
  const cityCardWidth = width > 600 ? 160 : 140;
  
  // Get user location on component mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location access is required to show your location on the map.');
          setLocationLoading(false);
          return;
        }
        
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        // Animate map to user location
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }, 1000);
        }
      } catch (error) {
        Alert.alert('Error', 'Could not retrieve your location.');
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);
  
  const handleTabPress = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);
  
  const handleMarkerPress = (markerId: string) => {
    setSelectedMarker(markerId);
  };
  
  const navigateToLocation = (latitude: number, longitude: number) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2,
      }, 800);
    }
  };

  const toggle3DView = () => {
    setIs3D(!is3D);
    if (mapRef.current && userLocation) {
      const pitch = is3D ? 0 : 60;
      mapRef.current.animateCamera(
        {
          center: userLocation || { latitude: 43.6629, longitude: -79.3957 },
          pitch,
          heading: cameraAngle,
          altitude: is3D ? 1000 : 0,
          zoom: 16,
        },
        { duration: 800 }
      );
    }
  };

  const rotateCameraLeft = () => {
    const newAngle = (cameraAngle - 45 + 360) % 360;
    setCameraAngle(newAngle);
    if (mapRef.current && userLocation) {
      mapRef.current.animateCamera(
        {
          center: userLocation || { latitude: 43.6629, longitude: -79.3957 },
          pitch: is3D ? 60 : 0,
          heading: newAngle,
          altitude: is3D ? 1000 : 0,
          zoom: 16,
        },
        { duration: 600 }
      );
    }
  };

  const rotateCameraRight = () => {
    const newAngle = (cameraAngle + 45) % 360;
    setCameraAngle(newAngle);
    if (mapRef.current && userLocation) {
      mapRef.current.animateCamera(
        {
          center: userLocation || { latitude: 43.6629, longitude: -79.3957 },
          pitch: is3D ? 60 : 0,
          heading: newAngle,
          altitude: is3D ? 1000 : 0,
          zoom: 16,
        },
        { duration: 600 }
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      
      {/* 1. Explore Header with Search */}
      <View style={[styles.header, { paddingHorizontal: width * 0.05 }]}>
        <Text style={[styles.title, { color: theme.text, fontSize: titleSize }]}>Explore</Text>
        <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="search" size={20} color={theme.secondary} />
          <TextInput 
            placeholder="Search cities, neighborhoods..." 
            placeholderTextColor={theme.secondary}
            style={[styles.input, { color: theme.text }]}
          />
        </View>
      </View>

      {/* 2. Map/Grid Toggle Switch */}
      <View style={styles.toggleWrapper}>
        <View style={[styles.toggleContainer, { backgroundColor: theme.card, width: Math.min(width * 0.5, 200) }]}>
          {['Map', 'Grid'].map((tab) => (
            <TouchableOpacity 
              key={tab}
              activeOpacity={0.7}
              onPress={() => handleTabPress(tab)}
              style={[
                styles.toggleBtn, 
                activeTab === tab && { backgroundColor: theme.primary }
              ]}
            >
              <Text style={[
                styles.toggleText, 
                { color: activeTab === tab ? '#FFF' : theme.secondary }
              ]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
      >
        
        {/* 3. Conditional Content */}
        {activeTab === 'Map' ? (
          <View style={[styles.mapContainer, { marginHorizontal: width * 0.05, height: mapHeight }]}>
            {locationLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.text }]}>Getting your location...</Text>
              </View>
            )}
            <MapView
              ref={mapRef}
              style={styles.map}
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
              {MAP_MARKERS.map((marker) => (
                <Marker
                  key={marker.id}
                  coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                  title={marker.title}
                  description={marker.description}
                  pinColor={selectedMarker === marker.id ? '#FF6B6B' : theme.primary}
                  onPress={() => handleMarkerPress(marker.id)}
                />
              ))}
            </MapView>

            {/* 3D and Rotation Controls */}
            <View style={styles.mapControlsContainer}>
              <TouchableOpacity 
                style={[styles.mapControlBtn, { backgroundColor: is3D ? theme.primary : theme.card, borderColor: theme.border }]}
                onPress={toggle3DView}
              >
                <Ionicons name="cube" size={20} color={is3D ? '#FFF' : theme.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.mapControlBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={rotateCameraLeft}
                disabled={!is3D}
              >
                <Ionicons name="arrow-back" size={20} color={is3D ? theme.primary : theme.border} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.mapControlBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={rotateCameraRight}
                disabled={!is3D}
              >
                <Ionicons name="arrow-forward" size={20} color={is3D ? theme.primary : theme.border} />
              </TouchableOpacity>
            </View>
            
            {/* Selected Location Card */}
            {selectedMarker && (
              <View style={[styles.selectedLocationCard, { backgroundColor: isDark ? '#1a1a2e' : '#FFF', borderColor: theme.border }]}>
                {MAP_MARKERS.map(marker => 
                  marker.id === selectedMarker ? (
                    <View key={marker.id}>
                      <View style={styles.selectedHeaderRow}>
                        <View>
                          <Text style={[styles.selectedTitle, { color: theme.text }]}>{marker.title}</Text>
                          <Text style={[styles.selectedCount, { color: theme.secondary }]}>{marker.description}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setSelectedMarker(null)}>
                          <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity 
                        style={[styles.viewButton, { backgroundColor: theme.primary }]}
                        onPress={() => navigateToLocation(marker.latitude, marker.longitude)}
                      >
                        <Ionicons name="navigate" size={18} color="#FFF" />
                        <Text style={styles.viewButtonText}>Go to Location</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.viewButton, { backgroundColor: isDark ? '#333' : '#F0F0F0', borderWidth: 1, borderColor: theme.border }]}
                      >
                        <Ionicons name="home" size={18} color={theme.primary} />
                        <Text style={[styles.viewButtonText, { color: theme.primary }]}>View Properties</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null
                )}
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.gridContainer, { paddingHorizontal: width * 0.05 }]}>
            {TRENDING_SPOTS.map((spot) => (
              <TouchableOpacity 
                key={spot.id} 
                style={[styles.gridItem, { width: gridItemSize, height: gridItemSize, borderRadius: 16, overflow: 'hidden' }]}
                activeOpacity={0.75}
                onPress={() => setSelectedSpot(spot.id)}
              >
                <Image source={{ uri: spot.image }} style={styles.gridImage} />
                <View style={styles.gridOverlay}>
                  <Text style={styles.gridTag}>{spot.tag}</Text>
                  <Text style={styles.gridName}>{spot.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Selected Spot Detail Card */}
        {selectedSpot && (
          <View style={[styles.spotDetailCard, { backgroundColor: isDark ? '#1a1a2e' : '#FFF', borderColor: theme.border }]}>
            {TRENDING_SPOTS.map(spot =>
              spot.id === selectedSpot ? (
                <View key={spot.id}>
                  <View style={styles.spotHeader}>
                    <View>
                      <Text style={[styles.spotTitle, { color: theme.text }]}>{spot.name}</Text>
                      <Text style={[styles.spotTag, { color: theme.primary }]}>{spot.tag}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedSpot(null)}>
                      <Ionicons name="close" size={24} color={theme.text} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity 
                    style={[styles.spotButton, { backgroundColor: theme.primary }]}
                  >
                    <Ionicons name="image" size={18} color="#FFF" />
                    <Text style={styles.spotButtonText}>View Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.spotButton, { backgroundColor: isDark ? '#333' : '#F0F0F0', borderWidth: 1, borderColor: theme.border }]}
                  >
                    <Ionicons name="home" size={18} color={theme.primary} />
                    <Text style={[styles.spotButtonText, { color: theme.primary }]}>Explore Area</Text>
                  </TouchableOpacity>
                </View>
              ) : null
            )}
          </View>
        )}

        {/* 4. Trending Categories */}
        <View style={[styles.trendingHeader, { paddingHorizontal: width * 0.05 }]}>
          <Text style={[styles.subtitle, { color: theme.text, fontSize: subtitleSize }]}>Trending Locations</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.trendList}
          contentContainerStyle={[styles.trendListContent, { paddingHorizontal: width * 0.05 }]}
          scrollEventThrottle={16}
        >
          {['Toronto', 'Hamilton', 'Oakville', 'Burlington'].map((city) => (
            <TouchableOpacity 
              key={city} 
              activeOpacity={0.7}
              style={[styles.cityCard, { backgroundColor: selectedCity === city ? theme.primary : theme.card, borderColor: selectedCity === city ? theme.primary : theme.border, width: cityCardWidth }]}
              onPress={() => setSelectedCity(city)}
            >
              <Text style={[styles.cityName, { color: selectedCity === city ? '#FFF' : theme.text }]}>{city}</Text>
              <Text style={[styles.cityCount, { color: selectedCity === city ? 'rgba(255,255,255,0.8)' : theme.secondary }]}>12 Properties</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Selected City Info Card */}
        {selectedCity && (
          <View style={[styles.cityDetailCard, { backgroundColor: isDark ? '#1a1a2e' : '#FFF', borderColor: theme.border, marginHorizontal: width * 0.05 }]}>
            <View style={styles.cityDetailHeader}>
              <View>
                <Text style={[styles.cityDetailTitle, { color: theme.text }]}>{selectedCity}</Text>
                <Text style={[styles.cityDetailSubtitle, { color: theme.secondary }]}>Premium real estate hub</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedCity(null)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.cityStats}>
              <View style={styles.statItem}>
                <Ionicons name="home" size={20} color={theme.primary} />
                <Text style={[styles.statNumber, { color: theme.text }]}>245</Text>
                <Text style={[styles.statLabel, { color: theme.secondary }]}>Properties</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="person" size={20} color={theme.primary} />
                <Text style={[styles.statNumber, { color: theme.text }]}>1.2M</Text>
                <Text style={[styles.statLabel, { color: theme.secondary }]}>Population</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="trending-up" size={20} color={theme.primary} />
                <Text style={[styles.statNumber, { color: theme.text }]}>+12%</Text>
                <Text style={[styles.statLabel, { color: theme.secondary }]}>Growth</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.cityActionBtn, { backgroundColor: theme.primary }]}
            >
              <Ionicons name="map" size={18} color="#FFF" />
              <Text style={styles.cityActionText}>View on Map</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingVertical: 16, gap: 12 },
  title: { fontWeight: '900', letterSpacing: 0.3 },
  searchBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 14, 
    height: 50, 
    borderRadius: 15, 
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 }
    })
  },
  input: { flex: 1, marginHorizontal: 10, fontSize: 15, fontWeight: '500' },
  toggleWrapper: { alignItems: 'center', marginVertical: 18 },
  toggleContainer: { flexDirection: 'row', padding: 4, borderRadius: 12 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  toggleText: { fontWeight: '700', fontSize: 14 },
  scrollContent: { paddingBottom: 150 },
  mapContainer: { borderRadius: 24, borderWidth: 1, overflow: 'hidden', marginVertical: 10, borderColor: '#ccc', position: 'relative' },
  map: { width: '100%', height: '100%' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 24,
  },
  loadingText: { marginTop: 12, fontSize: 14, fontWeight: '600' },
  selectedLocationCard: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    zIndex: 100,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 5 }
    })
  },
  selectedHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  selectedTitle: { fontSize: 16, fontWeight: '800' },
  selectedCount: { fontSize: 13, fontWeight: '500', marginTop: 4 },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 8,
  },
  viewButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  mapControlsContainer: {
    position: 'absolute',
    right: 12,
    top: 12,
    flexDirection: 'column',
    gap: 8,
    zIndex: 50,
  },
  mapControlBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 3 }
    })
  },
  mapPlaceholder: { borderRadius: 24, borderWidth: 1, overflow: 'hidden', marginVertical: 10 },
  mapImage: { width: '100%', height: '100%', opacity: 0.85 },
  mapOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  marker: { 
    padding: 12, 
    borderRadius: 28, 
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 4 }
    }) 
  },
  mapInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 3 }
    })
  },
  mapInfoTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  mapInfoSubtitle: { fontSize: 13, fontWeight: '500' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridItem: { borderRadius: 18, overflow: 'hidden', ...Platform.select({
    ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
    android: { elevation: 3 }
  }) },
  gridImage: { width: '100%', height: '100%' },
  gridOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)', padding: 12, justifyContent: 'flex-end' },
  gridTag: { color: '#FFF', fontSize: 10, fontWeight: '800', opacity: 0.9, marginBottom: 4 },
  gridName: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  spotDetailCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 3 }
    })
  },
  spotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  spotTitle: { fontSize: 18, fontWeight: '800' },
  spotTag: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  spotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 8,
  },
  spotButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  trendingHeader: { marginVertical: 20 },
  subtitle: { fontWeight: '800', letterSpacing: 0.2 },
  trendList: {},
  trendListContent: { gap: 10 },
  cityCard: { padding: 14, borderRadius: 16, borderWidth: 1, justifyContent: 'center', ...Platform.select({
    ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
    android: { elevation: 2 }
  }) },
  cityName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cityCount: { fontSize: 12, fontWeight: '500' },
  cityDetailCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 3 }
    })
  },
  cityDetailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cityDetailTitle: { fontSize: 18, fontWeight: '800' },
  cityDetailSubtitle: { fontSize: 13, fontWeight: '500', marginTop: 4 },
  cityStats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(200,200,200,0.2)' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  statLabel: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  cityActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  cityActionText: { color: '#FFF', fontSize: 14, fontWeight: '700' }
});
