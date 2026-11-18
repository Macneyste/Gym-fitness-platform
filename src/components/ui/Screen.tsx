import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, space } from '@/theme';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  /** Extra bottom padding so content clears the floating nav / sticky CTA. */
  bottomInset?: number;
  contentStyle?: StyleProp<ViewStyle>;
  background?: ReactNode;
};

/** Midnight background + safe area + optional scroll, with consistent 20px gutters. */
export function Screen({ children, scroll, edges = ['top'], bottomInset = space.xxl, contentStyle, background }: Props) {
  return (
    <SafeAreaView style={styles.root} edges={edges}>
      {background}
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomInset }, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.fill, { paddingBottom: bottomInset }, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space.xl, gap: space.xxl },
  fill: { flex: 1 },
});
