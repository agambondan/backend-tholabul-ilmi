import { BookOpen, GraduationCap, Heart, Home, ScrollText } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, spacing } from '../theme';

export const tabs = [
  { Icon: Home, key: 'home', label: 'Beranda' },
  { Icon: BookOpen, key: 'quran', label: "Al-Qur'an" },
  { Icon: ScrollText, key: 'hadith', label: 'Hadis' },
  { Icon: Heart, key: 'ibadah', label: 'Ibadah' },
  { Icon: GraduationCap, key: 'belajar', label: 'Belajar' },
];

const teal = {
  active: '#0d9488',
  activeBg: '#f0fdfa',
  inactive: '#9ca3af',
  border: '#e5e7eb',
  bg: '#ffffff',
};

export function TabBar({ active, onChange }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {tabs.map((tab) => {
        const selected = active === tab.key;
        const Icon = tab.Icon;
        return (
          <Pressable
            accessibilityLabel={tab.label}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            android_ripple={{ color: teal.activeBg, borderless: false }}
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={styles.item}
          >
            <View style={[styles.iconWrap, selected && styles.iconWrapActive]}>
              <Icon
                color={selected ? teal.active : teal.inactive}
                size={20}
                strokeWidth={selected ? 2.5 : 1.9}
              />
            </View>
            {selected ? <Text style={styles.label}>{tab.label}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: teal.bg,
    borderTopColor: teal.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
    justifyContent: 'center',
    minHeight: 52,
    paddingVertical: spacing.xs,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 34,
    justifyContent: 'center',
    width: 46,
  },
  iconWrapActive: {
    backgroundColor: teal.activeBg,
  },
  label: {
    color: teal.active,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
