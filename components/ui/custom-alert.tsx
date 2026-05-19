import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, FontSizes, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
}

export function CustomAlert({
  visible,
  title,
  message,
  icon,
  iconColor,
  buttons = [{ text: 'OK', style: 'default' }],
  onDismiss,
}: CustomAlertProps) {
  const scheme = useColorScheme() ?? 'dark';
  const colors = AppColors[scheme];

  const handlePress = (btn: AlertButton) => {
    btn.onPress?.();
    onDismiss?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Icon */}
          {icon && (
            <View style={[styles.iconWrap, {
              backgroundColor: (iconColor ?? colors.accent) + '18',
            }]}>
              <Ionicons name={icon} size={32} color={iconColor ?? colors.accent} />
            </View>
          )}

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

          {/* Message */}
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            {buttons.map((btn, i) => {
              const isCancel = btn.style === 'cancel';
              const isDestructive = btn.style === 'destructive';
              const bgColor = isCancel
                ? colors.surfaceLight
                : isDestructive
                  ? colors.danger
                  : colors.accent;
              const textColor = isCancel
                ? colors.textSecondary
                : '#FFF';

              return (
                <Pressable
                  key={i}
                  style={[
                    styles.button,
                    { backgroundColor: bgColor, flex: 1 },
                  ]}
                  onPress={() => handlePress(btn)}
                >
                  <Text style={[styles.buttonText, { color: textColor }]}>
                    {btn.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: Radii.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    textAlign: 'center',
  },
  message: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  button: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
  buttonText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
});
