import { useState } from 'react';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

const LOCATIONS = [
  { lat: 21.4225, lng: 39.8262, name: 'Makkah Al-Mukarramah', desc: 'Kelahiran Nabi ﷺ, Masjidil Haram, Ka\'bah' },
  { lat: 24.4672, lng: 39.6112, name: 'Madinah Al-Munawwarah', desc: 'Masjid Nabawi, hijrah Rasulullah ﷺ' },
  { lat: 21.3891, lng: 39.8579, name: 'Ka\'bah (Kiblat)', desc: 'Kiblat umat Islam sedunia' },
  { lat: 31.7683, lng: 35.2137, name: 'Baitul Maqdis (Al-Quds)', desc: 'Kiblat pertama, Masjidil Aqsha' },
  { lat: 25.2048, lng: 55.2708, name: 'Dubai', desc: 'Pusat peradaban Islam modern' },
  { lat: 33.3152, lng: 44.3661, name: 'Baghdad', desc: 'Baitul Hikmah, pusat ilmu Abbasiah' },
  { lat: 30.0444, lng: 31.2357, name: 'Kairo', desc: 'Universitas Al-Azhar' },
  { lat: 36.8065, lng: 10.1815, name: 'Kairouan', desc: 'Masjid Uqbah, pusat ilmu di Afrika Utara' },
  { lat: 37.8889, lng: -4.7794, name: 'Cordoba', desc: 'Masjid Cordoba, pusat Islam di Andalusia' },
  { lat: 41.0082, lng: 28.9784, name: 'Istanbul', desc: 'Kekhalifahan Utsmaniyah' },
  { lat: 34.0209, lng: -6.8419, name: 'Fes', desc: 'Universitas Al-Qarawiyyin, tertua di dunia' },
];

export function HistoricalMapContent() {
  const [activeLocation, setActiveLocation] = useState(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('map');

  const filtered = search.trim()
    ? LOCATIONS.filter((loc) =>
        loc.name.toLowerCase().includes(search.toLowerCase()) ||
        loc.desc.toLowerCase().includes(search.toLowerCase()),
      )
    : LOCATIONS;

  return (
    <>
      <View style={styles.viewToggle}>
        <Pressable
          onPress={() => setViewMode('map')}
          style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]}
        >
          <Text style={[styles.toggleBtnText, viewMode === 'map' && styles.toggleBtnTextActive]}>Peta</Text>
        </Pressable>
        <Pressable
          onPress={() => setViewMode('list')}
          style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
        >
          <Text style={[styles.toggleBtnText, viewMode === 'list' && styles.toggleBtnTextActive]}>Jelajahi</Text>
        </Pressable>
      </View>

      {viewMode === 'map' ? (
        <View style={styles.mapContainer}>
          <MapView
            initialRegion={{
              latitude: 28,
              longitude: 35,
              latitudeDelta: 45,
              longitudeDelta: 45,
            }}
            style={styles.map}
          >
            {LOCATIONS.map((loc) => (
              <Marker
                key={loc.name}
                coordinate={{ latitude: loc.lat, longitude: loc.lng }}
                onPress={() => setActiveLocation(loc.name)}
                title={loc.name}
              >
                <Callout>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>{loc.name}</Text>
                    <Text style={styles.calloutDesc}>{loc.desc}</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>
        </View>
      ) : (
        <View>
          <TextInput
            onChangeText={setSearch}
            placeholder="Cari lokasi..."
            placeholderTextColor={colors.muted}
            returnKeyType="search"
            style={styles.searchInput}
            value={search}
          />
          {filtered.map((loc) => (
            <Pressable
              key={loc.name}
              android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
              onPress={() => setViewMode('map')}
              style={styles.locationRow}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.locationName}>{loc.name}</Text>
                <Text style={styles.locationDesc}>{loc.desc}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    borderRadius: radius.md,
    height: 400,
    overflow: 'hidden',
  },
  map: {
    height: '100%',
    width: '100%',
  },
  callout: {
    maxWidth: 220,
    padding: 4,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  calloutDesc: {
    color: '#555',
    fontSize: 12,
    lineHeight: 16,
  },
  viewToggle: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  toggleBtn: {
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleBtnText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  toggleBtnTextActive: {
    color: '#fff',
  },
  searchInput: {
    backgroundColor: colors.bg,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 14,
    marginBottom: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  locationRow: {
    borderBottomColor: colors.faint,
    borderBottomWidth: 1,
    paddingVertical: spacing.md,
  },
  locationName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  locationDesc: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
});

export default HistoricalMapContent;
