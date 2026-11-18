import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { ChartNoAxesColumn, Dumbbell, House, UserRound } from 'lucide-react-native';

import { BottomNav, type NavItem } from '@/components/ui';
import { useI18n } from '@/i18n';
import { colors } from '@/theme';

const ICONS: Record<string, NavItem['icon']> = {
  index: House,
  workouts: Dumbbell,
  progress: ChartNoAxesColumn,
  account: UserRound,
};

const LABEL_KEYS: Record<string, string> = {
  index: 'nav.home',
  workouts: 'nav.workouts',
  progress: 'nav.progress',
  account: 'nav.account',
};

function TabBar({ state, navigateToTab }: BottomTabBarProps) {
  const { t } = useI18n();
  const items: NavItem[] = state.routes.map((r) => ({
    key: r.key,
    label: t(LABEL_KEYS[r.name] ?? r.name),
    icon: ICONS[r.name] ?? House,
  }));
  return <BottomNav items={items} activeKey={state.routes[state.index].key} onSelect={navigateToTab} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="workouts" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}
