import { X } from 'lucide-react-native';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import { hapticTap } from '../utils/haptics';

export function AppModalSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
  stickyFooter = true,
  scroll = true,
  maxHeight = '80%',
  closeLabel = 'Tutup',
  contentStyle,
  headerStyle,
  sheetStyle,
  titleStyle,
  subtitleStyle,
}) {
  const shouldStickFooter = Boolean(footer) && stickyFooter;
  const Body = scroll ? ScrollView : View;
  const bodyProps = scroll
    ? {
        contentContainerStyle: [styles.content, contentStyle],
        showsVerticalScrollIndicator: false,
        style: styles.scrollBody,
      }
    : { style: [styles.content, styles.staticBody, contentStyle] };

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <Pressable accessibilityLabel={closeLabel} onPress={onClose} style={styles.overlay} />
      <View style={[styles.sheet, { maxHeight }, sheetStyle]}>
        <View style={styles.handle} />
        <View style={[styles.header, headerStyle]}>
          <View style={styles.headerCopy}>
            <Text style={[styles.title, titleStyle]}>{title}</Text>
            {subtitle ? <Text numberOfLines={2} style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text> : null}
          </View>
          <Pressable
            accessibilityLabel={closeLabel}
            accessibilityRole="button"
            android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: true }}
            hitSlop={8}
            onPress={(event) => {
              hapticTap();
              onClose?.(event);
            }}
            style={styles.close}
          >
            <X color={colors.muted} size={18} strokeWidth={2.2} />
          </Pressable>
        </View>
        <Body {...bodyProps}>
          {children}
          {shouldStickFooter ? null : footer}
          {scroll ? <View style={shouldStickFooter ? styles.stickyBottomPad : styles.bottomPad} /> : null}
        </Body>
        {shouldStickFooter ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.38)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    bottom: 0,
    elevation: 24,
    left: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    position: 'absolute',
    right: 0,
    shadowColor: '#000',
    shadowOffset: { height: -2, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: colors.faint,
    borderRadius: 3,
    height: 4,
    marginBottom: spacing.md,
    width: 40,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.ink,
    fontFamily: 'serif',
    fontSize: 17,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  close: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  content: {
    paddingBottom: spacing.sm,
  },
  scrollBody: {
    flexShrink: 1,
  },
  staticBody: {
    flexShrink: 1,
  },
  footer: {
    backgroundColor: colors.bg,
    borderTopColor: colors.faint,
    borderTopWidth: 1,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  stickyBottomPad: {
    height: spacing.md,
  },
  bottomPad: {
    height: spacing.xl * 2,
  },
});
