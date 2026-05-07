import {
    ArrowLeft,
    Bell,
    BookOpen,
    HardDrive,
    LogOut,
    Palette,
    Settings,
    ShieldCheck,
    Target,
    Trophy,
    User,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { getHafalanSummary, getMyPoints, getMyStreak, getPrayerStats, getTilawahSummary } from '../api/personal';
import { CacheStatusCard } from '../components/CacheStatusCard';
import { Card } from '../components/Card';
import { NotificationCenter } from '../components/NotificationCenter';
import { OfflinePackCard } from '../components/OfflinePackCard';
import { Screen } from '../components/Screen';
import { SessionCard } from '../components/SessionCard';
import { useSession } from '../context/SessionContext';
import { colors, radius, spacing } from '../theme';

const BADGES = [
    { emoji: '📖', label: 'Tilawah Perdana', unlocked: false },
    { emoji: '✅', label: 'Sholat Penuh', unlocked: false },
    { emoji: '🌟', label: 'Penuntut Ilmi', unlocked: true },
    { emoji: '🔥', label: 'Streak 7 Hari', unlocked: false },
];

function SubScreen({ title, onBack, children }) {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.flex}
        >
            <View style={styles.subHeader}>
                <Pressable
                    accessibilityLabel="Kembali"
                    android_ripple={{ color: colors.faint, borderless: true }}
                    hitSlop={12}
                    onPress={onBack}
                    style={styles.backButton}
                >
                    <ArrowLeft color={colors.primary} size={20} strokeWidth={2.5} />
                </Pressable>
                <Text style={styles.subTitle}>{title}</Text>
            </View>
            <ScrollView
                contentContainerStyle={styles.subContent}
                keyboardShouldPersistTaps="handled"
            >
                {children}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

function MenuRow({ Icon, label, meta, danger, onPress }) {
    return (
        <Pressable
            android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
            onPress={onPress}
            style={styles.menuRow}
        >
            <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
                <Icon
                    color={danger ? colors.danger : colors.primary}
                    size={18}
                    strokeWidth={2.2}
                />
            </View>
            <View style={styles.menuText}>
                <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
                {meta ? <Text style={styles.menuMeta}>{meta}</Text> : null}
            </View>
            <Text style={styles.chevron}>›</Text>
        </Pressable>
    );
}

function SettingsList({ onNavigate }) {
    const items = [
        {
            Icon: User,
            label: 'Akun',
            meta: 'Login, sandi, dan data akun',
            screen: 'settings-account',
        },
        {
            Icon: Bell,
            label: 'Notifikasi',
            meta: 'Pengingat sholat dan harian',
            screen: 'settings-notifications',
        },
        {
            Icon: HardDrive,
            label: 'Penyimpanan',
            meta: 'Konten offline dan cache',
            screen: 'settings-storage',
        },
        {
            Icon: Palette,
            label: 'Tampilan',
            meta: 'Tema dan bahasa',
            screen: 'settings-appearance',
        },
        {
            Icon: ShieldCheck,
            label: 'Keamanan',
            meta: 'Sesi aktif dan keamanan akun',
            screen: 'settings-security',
        },
    ];
    return (
        <Card>
            {items.map(({ Icon, label, meta, screen }) => (
                <MenuRow
                    Icon={Icon}
                    key={screen}
                    label={label}
                    meta={meta}
                    onPress={() => onNavigate(screen)}
                />
            ))}
        </Card>
    );
}

export function ProfileScreen({ isActive, navigation, onOpenTab }) {
    const { loading: sessionLoading, session, signOut, user } = useSession();
    const [stack, setStack] = useState([]);
    const [stats, setStats] = useState(null);

    const push = (screen) => setStack((s) => [...s, screen]);
    const pop = () => setStack((s) => s.slice(0, -1));
    const currentScreen = stack[stack.length - 1] ?? 'main';

    useEffect(() => {
        const routeView = navigation?.current?.view;
        if (routeView === 'settings') {
            setStack(['settings']);
        }
        if (typeof routeView === 'string' && routeView.startsWith('settings-')) {
            setStack(['settings', routeView]);
        }
    }, [navigation?.current?.id, navigation?.current?.view]);

    useEffect(() => {
        if (!isActive) return;
        if (stack.length > 0) {
            navigation?.setBack(() => { pop(); return true; });
        } else {
            navigation?.clearBack?.();
        }
    }, [isActive, stack.length, navigation]);

    const initials = `${user?.name || user?.email || 'TI'}`
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');

    useEffect(() => {
        if (!session?.token) {
            setStats(null);
            return;
        }
        Promise.allSettled([
            getMyPoints(),
            getMyStreak(),
            getHafalanSummary(),
            getPrayerStats(),
            getTilawahSummary(),
        ]).then(([pointsRes, streakRes, hafalanRes, prayerRes, tilawahRes]) => {
            setStats({
                points:
                    pointsRes.status === 'fulfilled'
                        ? (pointsRes.value?.total_points ?? pointsRes.value?.points ?? 0)
                        : 0,
                streak:
                    streakRes.status === 'fulfilled'
                        ? (streakRes.value?.current_streak ?? streakRes.value?.streak ?? 0)
                        : 0,
                hafalanCount:
                    hafalanRes.status === 'fulfilled'
                        ? (hafalanRes.value?.memorized_count ?? hafalanRes.value?.total ?? 0)
                        : null,
                sholatWeekly:
                    prayerRes.status === 'fulfilled'
                        ? (prayerRes.value?.weekly_completion_pct ?? prayerRes.value?.completion_pct ?? null)
                        : null,
                tilawahPages:
                    tilawahRes.status === 'fulfilled'
                        ? (tilawahRes.value?.total_pages ?? tilawahRes.value?.pages ?? null)
                        : null,
            });
        });
    }, [session?.token]);

    if (currentScreen === 'settings') {
        return (
            <SubScreen title="Pengaturan" onBack={pop}>
                <SettingsList onNavigate={push} />
            </SubScreen>
        );
    }

    if (currentScreen === 'settings-account') {
        return (
            <SubScreen title="Akun" onBack={pop}>
                <SessionCard />
                {user ? (
                    <Pressable
                        android_ripple={{ color: 'rgba(185, 28, 28, 0.12)', borderless: false }}
                        disabled={sessionLoading}
                        onPress={signOut}
                        style={styles.signOutButton}
                    >
                        <LogOut color={colors.danger} size={16} strokeWidth={2.4} />
                        <Text style={styles.signOutText}>
                            {sessionLoading ? 'Keluar...' : 'Keluar dari Akun'}
                        </Text>
                    </Pressable>
                ) : null}
            </SubScreen>
        );
    }

    if (currentScreen === 'settings-notifications') {
        return (
            <SubScreen title="Notifikasi" onBack={pop}>
                <NotificationCenter />
            </SubScreen>
        );
    }

    if (currentScreen === 'settings-storage') {
        return (
            <SubScreen title="Penyimpanan" onBack={pop}>
                <OfflinePackCard />
                <View style={styles.gap} />
                <CacheStatusCard />
            </SubScreen>
        );
    }

    if (currentScreen === 'settings-appearance') {
        return (
            <SubScreen title="Tampilan" onBack={pop}>
                <Card>
                    <Text style={styles.appearanceLabel}>Tema</Text>
                    <Text style={styles.appearanceMeta}>
                        Opsi tema gelap dan terang akan tersedia segera.
                    </Text>
                    <Text style={[styles.appearanceLabel, styles.appearanceLabelGap]}>
                        Bahasa
                    </Text>
                    <Text style={styles.appearanceMeta}>
                        Dukungan multi bahasa sedang disiapkan.
                    </Text>
                </Card>
            </SubScreen>
        );
    }

    if (currentScreen === 'settings-security') {
        return (
            <SubScreen title="Keamanan" onBack={pop}>
                <Card>
                    <Text style={styles.appearanceLabel}>Sesi Aktif</Text>
                    <Text style={styles.appearanceMeta}>
                        Manajemen sesi aktif dan riwayat login akan tersedia segera.
                    </Text>
                    <Text style={[styles.appearanceLabel, styles.appearanceLabelGap]}>
                        Ganti Sandi
                    </Text>
                    <Text style={styles.appearanceMeta}>
                        Fitur ganti sandi sedang disiapkan. Gunakan lupa sandi untuk saat ini.
                    </Text>
                    <Text style={[styles.appearanceLabel, styles.appearanceLabelGap]}>
                        Hapus Akun
                    </Text>
                    <Text style={styles.appearanceMeta}>
                        Untuk menghapus akun, hubungi tim Tholabul Ilmi.
                    </Text>
                </Card>
            </SubScreen>
        );
    }

    return (
        <Screen subtitle="Kelola akun, progress belajar, dan preferensi pribadimu." title="Profil">
            <Card style={styles.profileCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials || 'TI'}</Text>
                </View>
                <View style={styles.profileBody}>
                    <Text style={styles.name}>{user?.name || 'Thullabul Ilmi'}</Text>
                    <Text style={styles.email}>
                        {user?.email || 'Belum masuk ke akun'}
                    </Text>
                </View>
                <Pressable
                    accessibilityLabel="Buka pengaturan profil"
                    android_ripple={{ color: colors.faint, borderless: true }}
                    hitSlop={12}
                    onPress={() => push('settings')}
                    style={styles.gearButton}
                >
                    <Settings color={colors.muted} size={20} strokeWidth={2} />
                </Pressable>
            </Card>

            {stats ? (
                <View style={styles.statsRow}>
                    <Card style={styles.statCard}>
                        <Text style={styles.statValue}>
                            {stats.points.toLocaleString('id-ID')}
                        </Text>
                        <Text style={styles.statLabel}>Total Poin</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.streak}</Text>
                        <Text style={styles.statLabel}>Hari Streak</Text>
                    </Card>
                </View>
            ) : null}

            {stats && (stats.hafalanCount !== null || stats.sholatWeekly !== null || stats.tilawahPages !== null) ? (
                <View style={styles.progressSection}>
                    <Text style={styles.sectionLabel}>RINGKASAN PROGRESS</Text>
                    <View style={styles.progressGrid}>
                        {stats.hafalanCount !== null ? (
                            <Pressable
                                onPress={() => onOpenTab('quran', { tab: 'hafalan' })}
                                style={styles.progressCard}
                            >
                                <BookOpen color={colors.primary} size={20} strokeWidth={2} />
                                <Text style={styles.progressValue}>{stats.hafalanCount}</Text>
                                <Text style={styles.progressLabel}>Surah Hafalan</Text>
                            </Pressable>
                        ) : null}
                        {stats.sholatWeekly !== null ? (
                            <Pressable
                                onPress={() => onOpenTab('ibadah')}
                                style={styles.progressCard}
                            >
                                <Target color={colors.primary} size={20} strokeWidth={2} />
                                <Text style={styles.progressValue}>{stats.sholatWeekly}%</Text>
                                <Text style={styles.progressLabel}>Sholat Minggu Ini</Text>
                            </Pressable>
                        ) : null}
                        {stats.tilawahPages !== null ? (
                            <Pressable
                                onPress={() => onOpenTab('quran')}
                                style={styles.progressCard}
                            >
                                <Trophy color={colors.primary} size={20} strokeWidth={2} />
                                <Text style={styles.progressValue}>{stats.tilawahPages}</Text>
                                <Text style={styles.progressLabel}>Halaman Tilawah</Text>
                            </Pressable>
                        ) : null}
                    </View>
                </View>
            ) : null}

            <View style={styles.badgeSection}>
                <Text style={styles.sectionLabel}>PENCAPAIAN</Text>
                <View style={styles.badgeGrid}>
                    {BADGES.map((badge) => (
                        <View
                            key={badge.label}
                            style={[styles.badge, !badge.unlocked && styles.badgeLocked]}
                        >
                            <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                            <Text
                                style={[
                                    styles.badgeLabel,
                                    !badge.unlocked && styles.badgeLabelLocked,
                                ]}
                            >
                                {badge.label}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            <Card>
                <MenuRow
                    Icon={Trophy}
                    label="Leaderboard"
                    meta="Peringkat streak komunitas"
                    onPress={() => onOpenTab('belajar', { featureKey: 'leaderboard' })}
                />
                <MenuRow
                    Icon={Target}
                    label="Target Belajar"
                    meta="Target pembelajaran personal"
                    onPress={() => onOpenTab('belajar', { featureKey: 'goals' })}
                />
                {user ? (
                    <MenuRow
                        Icon={LogOut}
                        danger
                        label="Keluar"
                        onPress={signOut}
                    />
                ) : (
                    <MenuRow
                        Icon={User}
                        label="Masuk / Daftar"
                        meta="Login untuk fitur personal"
                        onPress={() => push('settings-account')}
                    />
                )}
            </Card>
        </Screen>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    subHeader: {
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderBottomColor: colors.faint,
        borderBottomWidth: 1,
        flexDirection: 'row',
        gap: spacing.md,
        minHeight: 56,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
    },
    backButton: {
        alignItems: 'center',
        backgroundColor: colors.bg,
        borderColor: colors.faint,
        borderRadius: radius.md,
        borderWidth: 1,
        height: 38,
        justifyContent: 'center',
        width: 38,
    },
    subTitle: {
        color: colors.ink,
        fontFamily: 'serif',
        fontSize: 16,
        fontWeight: '900',
    },
    subContent: {
        backgroundColor: colors.bg,
        padding: spacing.lg,
        paddingBottom: spacing.xl,
    },
    gap: {
        height: spacing.md,
    },
    profileCard: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.md,
    },
    avatar: {
        alignItems: 'center',
        backgroundColor: colors.primary,
        borderRadius: 24,
        height: 52,
        justifyContent: 'center',
        width: 52,
    },
    avatarText: {
        color: colors.onPrimary,
        fontFamily: 'serif',
        fontSize: 18,
        fontWeight: '900',
    },
    profileBody: {
        flex: 1,
    },
    name: {
        color: colors.ink,
        fontFamily: 'serif',
        fontSize: 16,
        fontWeight: '900',
    },
    email: {
        color: colors.muted,
        fontSize: 12,
        lineHeight: 18,
        marginTop: spacing.xs,
    },
    gearButton: {
        alignItems: 'center',
        height: 40,
        justifyContent: 'center',
        width: 40,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    statCard: {
        alignItems: 'center',
        flex: 1,
        paddingVertical: spacing.md,
    },
    statValue: {
        color: colors.primaryDark,
        fontFamily: 'serif',
        fontSize: 24,
        fontWeight: '900',
    },
    statLabel: {
        color: colors.muted,
        fontSize: 11,
        fontWeight: '700',
        marginTop: spacing.xs,
        textTransform: 'uppercase',
    },
    progressSection: {
        marginBottom: spacing.md,
    },
    progressGrid: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    progressCard: {
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderColor: colors.faint,
        borderRadius: radius.md,
        borderWidth: 1,
        flex: 1,
        gap: spacing.xs,
        paddingVertical: spacing.md,
    },
    progressValue: {
        color: colors.primaryDark,
        fontFamily: 'serif',
        fontSize: 20,
        fontWeight: '900',
    },
    progressLabel: {
        color: colors.muted,
        fontSize: 10,
        fontWeight: '700',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    badgeSection: {
        marginBottom: spacing.md,
    },
    sectionLabel: {
        color: colors.muted,
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
        marginBottom: spacing.sm,
        textTransform: 'uppercase',
    },
    badgeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    badge: {
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderColor: colors.faint,
        borderRadius: radius.md,
        borderWidth: 1,
        flexBasis: '47%',
        flexGrow: 1,
        gap: spacing.xs,
        paddingVertical: spacing.md,
    },
    badgeLocked: {
        backgroundColor: colors.bg,
        opacity: 0.5,
    },
    badgeEmoji: {
        fontSize: 22,
    },
    badgeLabel: {
        color: colors.ink,
        fontSize: 12,
        fontWeight: '700',
        textAlign: 'center',
    },
    badgeLabelLocked: {
        color: colors.muted,
    },
    menuRow: {
        alignItems: 'center',
        borderBottomColor: colors.faint,
        borderBottomWidth: 1,
        flexDirection: 'row',
        gap: spacing.md,
        minHeight: 56,
        paddingVertical: spacing.sm,
    },
    menuIcon: {
        alignItems: 'center',
        backgroundColor: colors.surfaceMuted,
        borderColor: colors.faint,
        borderRadius: radius.md,
        borderWidth: 1,
        height: 38,
        justifyContent: 'center',
        width: 38,
    },
    menuIconDanger: {
        backgroundColor: '#fef2f2',
        borderColor: '#fecaca',
    },
    menuText: {
        flex: 1,
    },
    menuLabel: {
        color: colors.ink,
        fontFamily: 'serif',
        fontSize: 14,
        fontWeight: '900',
    },
    menuLabelDanger: {
        color: colors.danger,
    },
    menuMeta: {
        color: colors.muted,
        fontSize: 12,
        marginTop: 2,
    },
    chevron: {
        color: colors.muted,
        fontSize: 22,
    },
    signOutButton: {
        alignItems: 'center',
        borderColor: '#fecaca',
        borderRadius: radius.lg,
        borderWidth: 1,
        flexDirection: 'row',
        gap: spacing.sm,
        justifyContent: 'center',
        marginTop: spacing.md,
        minHeight: 46,
    },
    signOutText: {
        color: colors.danger,
        fontSize: 13,
        fontWeight: '800',
    },
    appearanceLabel: {
        color: colors.ink,
        fontFamily: 'serif',
        fontSize: 14,
        fontWeight: '900',
        marginBottom: spacing.xs,
    },
    appearanceLabelGap: {
        marginTop: spacing.lg,
    },
    appearanceMeta: {
        color: colors.muted,
        fontSize: 13,
        lineHeight: 19,
    },
});
