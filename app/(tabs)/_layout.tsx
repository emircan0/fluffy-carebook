import type { ComponentProps } from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, Text, type ColorValue } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { colors, layout, radius, spacing, fontWeight, typography } from '../../lib/theme';

type TabIconProps = {
  color: ColorValue;
  focused: boolean;
  name: ComponentProps<typeof Feather>['name'];
};

function TabIcon({ color, focused, name }: TabIconProps) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Feather name={name} size={20} color={color} />
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.today'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name="home" />
          ),
        }}
      />
      <Tabs.Screen
        name="pets"
        options={{
          title: t('tabs.pets'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name="heart" />
          ),
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: t('tabs.reminders'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name="calendar" />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: t('tabs.expenses'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name="pie-chart" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name="user" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: layout.tabBarBottom,
    left: spacing.lg,
    right: spacing.lg,
    height: 76,
    backgroundColor: colors.surface,
    borderRadius: 38,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    shadowColor: colors.textSecondary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 8,
    paddingBottom: 8,
    paddingHorizontal: spacing.sm,
    paddingTop: 6,
  },
  tabBarItem: {
    alignItems: 'center',
    height: 62,
    justifyContent: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 48,
  },
  iconWrapActive: {
    backgroundColor: colors.accentSofter,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    marginTop: 2,
    letterSpacing: 0.2,
  },
});
