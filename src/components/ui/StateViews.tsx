import { AlertTriangle, Inbox, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { useI18n } from '@/i18n';
import { colors, radius, space, type } from '@/theme';
import { Button } from './Button';

type EmptyProps = { title: string; body?: string; icon?: LucideIcon; testID?: string };

export function EmptyState({ title, body, icon: Icon = Inbox, testID }: EmptyProps) {
  return (
    <View style={styles.box} testID={testID ?? 'empty-state'}>
      <View style={styles.iconWrap}>
        <Icon size={26} color={colors.textMuted} strokeWidth={2} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  );
}

type ErrorProps = { title?: string; body?: string; onRetry?: () => void };

export function ErrorState({ title, body, onRetry }: ErrorProps) {
  const { t } = useI18n();
  return (
    <View style={styles.box} testID="error-state" accessibilityLiveRegion="polite">
      <View style={[styles.iconWrap, { backgroundColor: `${colors.ember}22` }]}>
        <AlertTriangle size={26} color={colors.ember} strokeWidth={2} />
      </View>
      <Text style={styles.title}>{title ?? t('common.errorTitle')}</Text>
      <Text style={styles.body}>{body ?? t('common.errorBody')}</Text>
      {onRetry ? <Button label={t('common.retry')} variant="secondary" compact onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    gap: space.md,
    padding: space.xxl,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...type.h3, color: colors.text, textAlign: 'center' },
  body: { ...type.small, color: colors.textMuted, textAlign: 'center' },
});
