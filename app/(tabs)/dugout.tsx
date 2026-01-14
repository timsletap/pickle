import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Animated, Text, TouchableOpacity, View, Alert } from "react-native";
import DrillsList from "../DugoutFolder/DrillsList";
import EquipmentList from "../DugoutFolder/EquipmentList";
import PracticePlansList from "../DugoutFolder/PracticePlansList";
import { checkApiHealth, getSetupInstructions } from "../../config/apiHealth";
import { API_BASE_URL } from "../../config/api";

export default function Dugout() {
  const [activeTab, setActiveTab] = useState("drills");
  const [animation] = useState(new Animated.Value(0));
  const [tabWidth, setTabWidth] = useState(0);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    // Check API health on mount
    checkApiHealth().then(result => {
      setApiStatus(result.isHealthy ? 'connected' : 'disconnected');
      if (!result.isHealthy) {
        console.error('[API Health]', result.message);
        // Show alert with setup instructions after a short delay
        setTimeout(() => {
          Alert.alert(
            'Backend Connection Failed',
            result.message + '\n\nSee console for setup instructions.',
            [
              { text: 'View Instructions', onPress: () => Alert.alert('Setup Instructions', getSetupInstructions()) },
              { text: 'Continue Anyway', style: 'cancel' }
            ]
          );
        }, 1000);
      }
    });
  }, []);

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

  const recheckConnection = async () => {
    setApiStatus('checking');
    const result = await checkApiHealth();
    setApiStatus(result.isHealthy ? 'connected' : 'disconnected');
    Alert.alert(
      result.isHealthy ? 'Connected' : 'Connection Failed',
      result.message
    );
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
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Text style={{
            fontSize: 36,
            fontWeight: "900",
            color: "#fff",
            letterSpacing: 1
          }}>
            DUGOUT
          </Text>
          {/* Connection Status Indicator */}
          <TouchableOpacity
            onPress={recheckConnection}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: apiStatus === 'connected' ? "rgba(0, 255, 65, 0.1)" : apiStatus === 'disconnected' ? "rgba(255, 0, 0, 0.1)" : "rgba(255, 165, 0, 0.1)",
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: apiStatus === 'connected' ? "rgba(0, 255, 65, 0.3)" : apiStatus === 'disconnected' ? "rgba(255, 0, 0, 0.3)" : "rgba(255, 165, 0, 0.3)"
            }}
          >
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: apiStatus === 'connected' ? "#00ff41" : apiStatus === 'disconnected' ? "#ff0000" : "#FFA500",
              marginRight: 6
            }} />
            <Text style={{
              fontSize: 11,
              fontWeight: "700",
              color: apiStatus === 'connected' ? "#00ff41" : apiStatus === 'disconnected' ? "#ff0000" : "#FFA500"
            }}>
              {apiStatus === 'connected' ? 'API' : apiStatus === 'disconnected' ? 'OFFLINE' : 'CHECKING'}
            </Text>
          </TouchableOpacity>
        </View>
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