import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from "expo-router";
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

// Animated tab button component with glow effect
function AnimatedTabButton({ children, onPress, accessibilityState }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const focused = accessibilityState?.selected;

  useEffect(() => {
    Animated.timing(glowOpacity, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.85,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 150,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
    >
      {/* Glow background for active tab */}
      <Animated.View
        style={[
          styles.glowBackground,
          { opacity: glowOpacity },
        ]}
      />

      <Animated.View
        style={[
          styles.tabContent,
          { transform: [{ scale }] },
        ]}
      >
        {children}
      </Animated.View>

      {/* Active indicator dot */}
      {focused && (
        <View style={styles.activeIndicator} />
      )}
    </Pressable>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#00ff41',
        tabBarInactiveTintColor: 'rgba(0, 255, 65, 0.35)',
        tabBarLabelStyle: styles.tabLabel,
        tabBarButton: (props) => <AnimatedTabButton {...props} />,
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6
              name="user-circle"
              size={focused ? 26 : 22}
              color={color}
              style={focused ? styles.iconShadow : undefined}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="lineups"
        options={{
          title: "Lineups",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6
              name="clipboard-list"
              size={focused ? 26 : 22}
              color={color}
              style={focused ? styles.iconShadow : undefined}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chalktalk"
        options={{
          title: "Chalk Talk",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6
              name="chalkboard-teacher"
              size={focused ? 26 : 22}
              color={color}
              style={focused ? styles.iconShadow : undefined}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="dugout"
        options={{
          title: "Dugout",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6
              name="person-shelter"
              size={focused ? 26 : 22}
              color={color}
              style={focused ? styles.iconShadow : undefined}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="playball"
        options={{
          title: "Play Ball",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name="baseball-bat"
              size={focused ? 26 : 22}
              color={color}
              style={focused ? styles.iconShadow : undefined}
            />
          ),
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="EditingUsername" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 255, 65, 0.15)',
    height: 75,
    paddingBottom: 12,
    paddingTop: 8,
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  glowBackground: {
    position: 'absolute',
    top: 4,
    left: '15%',
    right: '15%',
    bottom: 4,
    backgroundColor: 'rgba(0, 255, 65, 0.1)',
    borderRadius: 16,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#00ff41',
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  iconShadow: {
    textShadowColor: '#00ff41',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});
