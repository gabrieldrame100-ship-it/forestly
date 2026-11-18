import { Tabs } from 'expo-router';
import { Home, BookOpen, Notebook, Trophy, User } from 'lucide-react-native';
import { colors, fonts } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: colors.olive,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.cream,
          borderTopWidth: 0,
          height: 68,
          paddingTop: 6,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Start', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="atlas"
        options={{ title: 'Atlas', tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="journal"
        options={{ title: 'Dziennik', tabBarIcon: ({ color, size }) => <Notebook color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="collection"
        options={{ title: 'Kolekcja', tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profil', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  );
}
