import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSession } from '../context/SessionContext';
import { forgotPassword, register } from '../api/auth';
import { colors, radius, spacing } from '../theme';
import { Card, CardTitle } from './Card';

export function SessionCard() {
  const { error, loading, signIn, signOut, user } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState('signin');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setMessage('');
    try {
      await signIn({ email: email.trim(), password });
      setPassword('');
      setMessage('Akun berhasil masuk di perangkat ini.');
    } catch {
      setMessage('');
    }
  };

  if (user) {
    return (
      <Card>
        <CardTitle meta="Akun aktif">Sudah Masuk</CardTitle>
        <Text style={styles.name}>{user.name || user.email || 'Pengguna Thullaabul Ilmi'}</Text>
        <Text style={styles.muted}>{user.email || 'Fitur personal sudah aktif di perangkat ini.'}</Text>
        <Pressable
          accessibilityLabel="Keluar dari akun"
          accessibilityRole="button"
          accessibilityState={{ disabled: loading }}
          android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
          disabled={loading}
          onPress={signOut}
          style={[styles.button, styles.secondaryButton]}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            {loading ? 'Keluar...' : 'Keluar'}
          </Text>
        </Pressable>
      </Card>
    );
  }

  const submitRegister = async () => {
    if (!name.trim() || !email.trim() || !password) return;
    setBusy(true);
    setMessage('');
    try {
      await register({ email: email.trim(), name: name.trim(), password });
      setMode('signin');
      setMessage('Akun berhasil dibuat. Silakan masuk.');
    } catch (err) {
      setMessage(err?.message ?? 'Tidak bisa membuat akun saat ini.');
    } finally {
      setBusy(false);
    }
  };

  const submitForgot = async () => {
    if (!email.trim()) return;
    setBusy(true);
    setMessage('');
    try {
      const responseMessage = await forgotPassword(email.trim());
      setMode('signin');
      setMessage(
        typeof responseMessage === 'string'
          ? responseMessage
          : 'Jika email terdaftar, tautan reset sandi sudah dikirim.',
      );
    } catch (err) {
      setMessage(err?.message ?? 'Tidak bisa memproses lupa sandi saat ini.');
    } finally {
      setBusy(false);
    }
  };

  const isSignIn = mode === 'signin';
  const isRegister = mode === 'register';
  const isForgot = mode === 'forgot';
  const isSubmitDisabled =
    loading ||
    busy ||
    (isSignIn && (!email || !password)) ||
    (isRegister && (!name.trim() || !email || !password)) ||
    (isForgot && !email);

  return (
    <Card>
      <CardTitle meta="Akun">{isSignIn ? 'Masuk' : isRegister ? 'Daftar Akun' : 'Lupa Sandi'}</CardTitle>
      <Text style={styles.muted}>Masuk untuk sinkronisasi bookmark, progress, catatan, dan pengingat.</Text>
      <View style={styles.form}>
        {isRegister ? (
          <TextInput
            accessibilityLabel="Nama"
            autoCapitalize="words"
            autoCorrect={false}
            onChangeText={setName}
            placeholder="Nama"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={name}
          />
        ) : null}
        <TextInput
          accessibilityLabel="Email"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={email}
        />
        {!isForgot ? (
          <TextInput
            accessibilityLabel="Kata sandi"
            onChangeText={setPassword}
            placeholder="Kata sandi"
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={styles.input}
            value={password}
          />
        ) : null}

        <Pressable
          accessibilityLabel={isSignIn ? 'Masuk ke akun' : isRegister ? 'Buat akun baru' : 'Kirim tautan reset sandi'}
          accessibilityRole="button"
          accessibilityState={{ disabled: isSubmitDisabled }}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.14)', borderless: false }}
          disabled={isSubmitDisabled}
          onPress={isSignIn ? submit : isRegister ? submitRegister : submitForgot}
          style={[styles.button, isSubmitDisabled ? styles.buttonDisabled : null]}
        >
          {loading || busy ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>
              {isSignIn ? 'Masuk' : isRegister ? 'Buat Akun' : 'Kirim Tautan Reset'}
            </Text>
          )}
        </Pressable>
      </View>
      <View style={styles.modeRow}>
        <Pressable
          accessibilityLabel="Tampilkan form masuk"
          accessibilityRole="button"
          accessibilityState={{ selected: isSignIn }}
          android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
          onPress={() => setMode('signin')}
          style={[styles.modeLink, isSignIn ? styles.modeLinkActive : null]}
        >
          <Text style={[styles.modeLinkText, isSignIn ? styles.modeLinkTextActive : null]}>Masuk</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Tampilkan form daftar"
          accessibilityRole="button"
          accessibilityState={{ selected: isRegister }}
          android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
          onPress={() => setMode('register')}
          style={[styles.modeLink, isRegister ? styles.modeLinkActive : null]}
        >
          <Text style={[styles.modeLinkText, isRegister ? styles.modeLinkTextActive : null]}>Daftar</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Tampilkan form lupa sandi"
          accessibilityRole="button"
          accessibilityState={{ selected: isForgot }}
          android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
          onPress={() => setMode('forgot')}
          style={[styles.modeLink, isForgot ? styles.modeLinkActive : null]}
        >
          <Text style={[styles.modeLinkText, isForgot ? styles.modeLinkTextActive : null]}>Lupa Sandi</Text>
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.success}>{message}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.bg,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 14,
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.56,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.faint,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  name: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  muted: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  success: {
    color: colors.primary,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  modeLink: {
    alignItems: 'center',
    borderColor: colors.faint,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 34,
    minWidth: 88,
    paddingHorizontal: spacing.sm,
  },
  modeLinkActive: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.primary,
  },
  modeLinkText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  modeLinkTextActive: {
    color: colors.primary,
  },
});
