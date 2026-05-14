import * as Linking from 'expo-linking';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { TabBar } from './src/components/TabBar';
import { FeedbackProvider } from './src/context/FeedbackContext';
import { SessionProvider } from './src/context/SessionContext';
import { TabActivityProvider } from './src/context/TabActivityContext';
import { quranFontAssets } from './src/constants/quranFonts';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { HadithScreen } from './src/screens/HadithScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { IbadahScreen } from './src/screens/IbadahScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { QuranScreen } from './src/screens/QuranScreen';
import { colors } from './src/theme';
import { parseDeepLink } from './src/utils/deepLinks';

const normalizeTabRequest = (tab, params = null) => {
  if (tab === 'qibla') {
    return {
      params: { ...(params ?? {}), view: 'qibla' },
      tab: 'ibadah',
    };
  }

  return { params, tab };
};

export default function App() {
  const [quranFontsLoaded, quranFontsError] = useFonts(quranFontAssets);
  const [activeTab, setActiveTab] = useState('home');
  const [deepLinkTarget, setDeepLinkTarget] = useState(null);
  const [internalRoutes, setInternalRoutes] = useState({});

  // Refs so the single BackHandler registration never goes stale
  const activeTabRef = useRef('home');
  const internalRoutesRef = useRef({});
  const screenBackRef = useRef(null); // set by active screen when it has sub-navigation

  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { internalRoutesRef.current = internalRoutes; }, [internalRoutes]);

  const openTab = useCallback((requestedTab, requestedParams = null) => {
    const { params, tab } = normalizeTabRequest(requestedTab, requestedParams);
    const returnTab = activeTabRef.current && activeTabRef.current !== tab ? activeTabRef.current : null;

    setActiveTab(tab);
    if (params?.view) {
      setInternalRoutes((current) => ({
        ...current,
        [tab]: {
          id: `${Date.now()}:${tab}:${params.view}`,
          params,
          returnTab,
          view: params.view,
        },
      }));
    }
    setDeepLinkTarget(
      params
        ? {
            id: `${Date.now()}:${tab}:${JSON.stringify(params)}`,
            params,
            tab,
          }
        : null,
    );
  }, []);

  const openInternalView = useCallback((requestedTab, view, params = {}) => {
    const normalized = normalizeTabRequest(requestedTab, { ...params, view });
    const tab = normalized.tab;
    const returnTab = activeTabRef.current && activeTabRef.current !== tab ? activeTabRef.current : null;

    setActiveTab(tab);
    setInternalRoutes((current) => ({
      ...current,
      [tab]: {
        id: `${Date.now()}:${tab}:${normalized.params.view}`,
        params: normalized.params,
        returnTab,
        view: normalized.params.view,
      },
    }));
  }, []);

  const closeInternalView = useCallback((tab = activeTab) => {
    const route = internalRoutesRef.current[tab];
    setInternalRoutes((current) => {
      const next = { ...current };
      delete next[tab];
      return next;
    });
    if (route?.returnTab && route.returnTab !== tab) {
      setActiveTab(route.returnTab);
    }
  }, [activeTab]);

  const resetInternalViews = useCallback(() => {
    setInternalRoutes({});
  }, []);

  const handleDeepLink = useCallback((url) => {
    const rawTarget = parseDeepLink(url);
    if (!rawTarget) return;

    const normalized = normalizeTabRequest(rawTarget.tab, rawTarget.params);
    const target = { ...rawTarget, ...normalized };
    if (!target) return;

    setActiveTab(target.tab);
    if (target.params?.view) {
      setInternalRoutes((current) => ({
        ...current,
        [target.tab]: {
          id: `${Date.now()}:${target.tab}:${target.params.view}`,
          params: target.params,
          view: target.params.view,
        },
      }));
    }
    setDeepLinkTarget({
      ...target,
      id: `${Date.now()}:${url}`,
      url,
    });
  }, []);

  // Registered ONCE — reads from refs to avoid stale closures.
  // Priority: screen sub-nav → internal cross-tab route → go to Home → OS handle (minimize).
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screenBackRef.current?.()) return true;
      const tab = activeTabRef.current;
      if (internalRoutesRef.current[tab]) {
        const route = internalRoutesRef.current[tab];
        setInternalRoutes((prev) => {
          const next = { ...prev };
          delete next[tab];
          return next;
        });
        if (route?.returnTab && route.returnTab !== tab) {
          setActiveTab(route.returnTab);
        }
        return true;
      }
      if (tab !== 'home') {
        setActiveTab('home');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    let mounted = true;
    Linking.getInitialURL().then((url) => {
      if (mounted && url) {
        handleDeepLink(url);
      }
    });

    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [handleDeepLink]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;

    const handleHashChange = () => {
      handleDeepLink(window.location.href);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [handleDeepLink]);

  const currentTarget = useMemo(
    () => (deepLinkTarget?.tab === activeTab ? deepLinkTarget : null),
    [activeTab, deepLinkTarget],
  );
  const setBack = useCallback((fn) => { screenBackRef.current = fn; }, []);
  const clearBack = useCallback(() => { screenBackRef.current = null; }, []);

  const navigation = useMemo(
    () => ({
      clearBack,
      close: closeInternalView,
      current: internalRoutes[activeTab] ?? null,
      open: openInternalView,
      reset: resetInternalViews,
      routes: internalRoutes,
      setBack,
    }),
    [activeTab, clearBack, closeInternalView, internalRoutes, openInternalView, resetInternalViews, setBack],
  );

  if (!quranFontsLoaded && !quranFontsError) {
    return (
      <SafeAreaProvider>
        <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, styles.fontLoading]}>
          <ActivityIndicator color={colors.primaryDark} size="small" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SessionProvider>
        <FeedbackProvider>
          <TabActivityProvider>
            <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
                style={styles.container}
              >
                <View style={[styles.screenPane, activeTab === 'home' ? styles.screenPaneVisible : styles.screenPaneHidden]}>
                  <HomeScreen isActive={activeTab === 'home'} navigation={navigation} onOpenTab={openTab} />
                </View>
                <View style={[styles.screenPane, activeTab === 'quran' ? styles.screenPaneVisible : styles.screenPaneHidden]}>
                  <QuranScreen deepLinkTarget={activeTab === 'quran' ? currentTarget : null} isActive={activeTab === 'quran'} navigation={navigation} />
                </View>
                <View style={[styles.screenPane, activeTab === 'hadith' ? styles.screenPaneVisible : styles.screenPaneHidden]}>
                  <HadithScreen deepLinkTarget={activeTab === 'hadith' ? currentTarget : null} isActive={activeTab === 'hadith'} navigation={navigation} />
                </View>
                <View style={[styles.screenPane, activeTab === 'ibadah' ? styles.screenPaneVisible : styles.screenPaneHidden]}>
                  <IbadahScreen isActive={activeTab === 'ibadah'} navigation={navigation} onOpenTab={openTab} />
                </View>
                <View style={[styles.screenPane, activeTab === 'belajar' ? styles.screenPaneVisible : styles.screenPaneHidden]}>
                  <ExploreScreen deepLinkTarget={activeTab === 'belajar' ? currentTarget : null} isActive={activeTab === 'belajar'} navigation={navigation} onOpenTab={openTab} />
                </View>
                <View style={[styles.screenPane, activeTab === 'profile' ? styles.screenPaneVisible : styles.screenPaneHidden]}>
                  <ProfileScreen isActive={activeTab === 'profile'} navigation={navigation} onOpenTab={openTab} />
                </View>
              </KeyboardAvoidingView>
              {activeTab === 'quran' ? null : <TabBar active={activeTab} onChange={openTab} />}
              <StatusBar style="dark" backgroundColor={colors.bg} />
            </SafeAreaView>
          </TabActivityProvider>
        </FeedbackProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  screenPane: {
    ...StyleSheet.absoluteFillObject,
  },
  screenPaneVisible: {
    display: 'flex',
  },
  screenPaneHidden: {
    display: 'none',
  },
  fontLoading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
