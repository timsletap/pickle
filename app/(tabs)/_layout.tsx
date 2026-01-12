import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from "expo-router"; //Tabs not Stack
import * as React from 'react';


export default function TabsLayout() {
  return (<Tabs screenOptions={{ tabBarInactiveBackgroundColor: "black" }}>
    <Tabs.Screen name="chalktalk" options={{ title: "Chalk Talk", tabBarIcon: (color) => (<FontAwesome6 name="chalkboard-teacher" size={24} color={"lime"} />) }} />
    <Tabs.Screen name="dugout" options={{ title: "Dugout", tabBarIcon: (color) => (<FontAwesome6 name="person-shelter" size={24} color={"lime"} />) }} />
    <Tabs.Screen name="playball" options={{ title: "Play Ball", tabBarIcon: (color) => (<MaterialCommunityIcons name="baseball-bat" size={24} color={"lime"} />) }} />
    <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: (color) => (<FontAwesome6 name="user-circle" size={24} color={"lime"} />) }} />
  </Tabs>);
}
