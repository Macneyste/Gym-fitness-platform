import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, fonts, radius, sizes, space, type } from '@/theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  secure?: boolean;
  showLabel?: string;
  hideLabel?: string;
};

/** Labelled input. Focused = violet border; password variant has a show/hide toggle. */
export function TextField(
  { label, error, secure, showLabel = 'Show', hideLabel = 'Hide', onFocus, onBlur, style, ...rest }: Props,
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, focused && styles.focused, !!error && styles.errored]}>
        <TextInput
          {...rest}
          accessibilityLabel={label}
          accessibilityHint={error}
          secureTextEntry={secure && hidden}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, style]}
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? showLabel : hideLabel}
            onPress={() => setHidden((h) => !h)}
            hitSlop={8}
            style={styles.eye}
          >
            {hidden ? <Eye size={20} color={colors.textMuted} strokeWidth={2} /> : <EyeOff size={20} color={colors.textMuted} strokeWidth={2} />}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  label: { ...type.label, color: colors.textLabel },
  field: {
    minHeight: 56,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.lg,
  },
  focused: { borderColor: colors.primary },
  errored: { borderColor: colors.ember },
  input: { flex: 1, fontFamily: fonts.body, fontSize: 16, color: colors.text, paddingVertical: space.md, textAlign: 'auto' },
  eye: { width: sizes.touch, height: sizes.touch, alignItems: 'center', justifyContent: 'center', marginEnd: -space.md },
  error: { ...type.label, color: colors.ember },
});
