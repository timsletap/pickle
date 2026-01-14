import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import DrillsList from "../DugoutFolder/DrillsList";
import EquipmentList from "../DugoutFolder/EquipmentList";
import PracticePlansList from "../DugoutFolder/PracticePlansList";

export default function Dugout() {
  const [activeTab, setActiveTab] = useState("drills");
  const [animation] = useState(new Animated.Value(0));
  const [tabWidth, setTabWidth] = useState(0);

  const handleTabChange = (tab: string) => {
    Animated.spring(animation, {
      toValue: tab === "drills" ? 0 : tab === "practice" ? 1 : 2,
      useNativeDriver: true,
      friction: 8,
      tension: 100
    }).start();
    setActiveTab(tab);
  };

  const getTabIcon = (tab: string) => {
    switch(tab) {
      case "drills": return "run";
      case "practice": return "clipboard-text-outline";
      case "equipment": return "baseball-bat";
      default: return "circle";
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* Premium Header with Gradient */}
      <LinearGradient
        colors={["#000", "#0a1f0a", "#000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 60,
          paddingBottom: 20,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          shadowColor: "#00ff41",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8
        }}
      >
        <Text style={{
          fontSize: 36,
          fontWeight: "900",
          color: "#fff",
          letterSpacing: 1,
          marginBottom: 8
        }}>
          DUGOUT
        </Text>
        <Text style={{
          fontSize: 14,
          color: "#00ff41",
          fontWeight: "600",
          letterSpacing: 3
        }}>
          TRAINING HEADQUARTERS
        </Text>

        {/* Modern Tab Bar */}
        <View
          style={{
            flexDirection: "row",
            marginTop: 24,
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderRadius: 16,
            padding: 4,
            borderWidth: 1,
            borderColor: "rgba(0, 255, 65, 0.2)"
          }}
          onLayout={(e) => {
            const width = e.nativeEvent.layout.width;
            setTabWidth((width - 8) / 3);
          }}
        >
          {/* Animated Indicator */}
          {tabWidth > 0 && (
            <Animated.View
              style={{
                position: "absolute",
                top: 4,
                left: 4,
                bottom: 4,
                width: tabWidth,
                backgroundColor: "#00ff41",
                borderRadius: 12,
                transform: [{
                  translateX: animation.interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: [0, tabWidth, tabWidth * 2]
                  })
                }],
                shadowColor: "#00ff41",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 8,
                elevation: 4
              }}
            />
          )}

          {/* Drills Tab */}
          <TouchableOpacity
            onPress={() => handleTabChange("drills")}
            style={{
              flex: 1,
              paddingVertical: 14,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              zIndex: 1
            }}
          >
            <MaterialCommunityIcons
              name={getTabIcon("drills")}
              size={22}
              color={activeTab === "drills" ? "#000" : "#00ff41"}
              style={{ marginBottom: 4 }}
            />
            <Text style={{
              fontSize: 12,
              fontWeight: "700",
              color: activeTab === "drills" ? "#000" : "#00ff41",
              letterSpacing: 0.5
            }}>
              DRILLS
            </Text>
          </TouchableOpacity>

          {/* Practice Tab */}
          <TouchableOpacity
            onPress={() => handleTabChange("practice")}
            style={{
              flex: 1,
              paddingVertical: 14,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              zIndex: 1
            }}
          >
            <MaterialCommunityIcons
              name={getTabIcon("practice")}
              size={22}
              color={activeTab === "practice" ? "#000" : "#00ff41"}
              style={{ marginBottom: 4 }}
            />
            <Text style={{
              fontSize: 12,
              fontWeight: "700",
              color: activeTab === "practice" ? "#000" : "#00ff41",
              letterSpacing: 0.5
            }}>
              PRACTICE
            </Text>
          </TouchableOpacity>

          {/* Equipment Tab */}
          <TouchableOpacity
            onPress={() => handleTabChange("equipment")}
            style={{
              flex: 1,
              paddingVertical: 14,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              zIndex: 1
            }}
          >
            <MaterialCommunityIcons
              name={getTabIcon("equipment")}
              size={22}
              color={activeTab === "equipment" ? "#000" : "#00ff41"}
              style={{ marginBottom: 4 }}
            />
            <Text style={{
              fontSize: 12,
              fontWeight: "700",
              color: activeTab === "equipment" ? "#000" : "#00ff41",
              letterSpacing: 0.5
            }}>
              GEAR
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content Area with Dark Theme */}
      <View style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
        {activeTab === "drills" && <DrillsList />}
        {activeTab === "practice" && <PracticePlansList />}
        {activeTab === "equipment" && <EquipmentList />}
      </View>
    </View>
  );
}