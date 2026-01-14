import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View, Alert, Easing } from "react-native";
import DrillsList from "../DugoutFolder/DrillsList";
import EquipmentList from "../DugoutFolder/EquipmentList";
import PracticePlansList from "../DugoutFolder/PracticePlansList";
import { checkApiHealth, getSetupInstructions } from "../../config/apiHealth";

export default function Dugout() {
  const [activeTab, setActiveTab] = useState("drills");
  const [tabWidth, setTabWidth] = useState(0);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  // Animation values
  const tabAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const statusPulse = useRef(new Animated.Value(1)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // API status pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(statusPulse, {
          toValue: 1.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(statusPulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Check API health
    checkApiHealth().then(result => {
      setApiStatus(result.isHealthy ? 'connected' : 'disconnected');
      if (!result.isHealthy) {
        console.error('[API Health]', result.message);
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
    const tabIndex = tab === "drills" ? 0 : tab === "practice" ? 1 : 2;

    // Tab indicator animation with bounce
    Animated.spring(tabAnimation, {
      toValue: tabIndex,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();

    // Content transition animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(contentFade, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(contentSlide, {
          toValue: -20,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(contentFade, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(contentSlide, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Haptic feedback pulse
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(pulseAnim, {
        toValue: 1,
        friction: 3,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();

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
      {/* Ultra-Modern Header with Multiple Gradients */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <LinearGradient
          colors={["#000000", "#001a00", "#002200", "#001a00", "#000000"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: 60,
            paddingBottom: 24,
            paddingHorizontal: 24,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            shadowColor: "#00ff41",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 20,
            elevation: 12,
          }}
        >
          {/* Animated glow effect */}
          <LinearGradient
            colors={["transparent", "rgba(0, 255, 65, 0.05)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
            }}
          />

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <View>
              <Text style={{
                fontSize: 42,
                fontWeight: "900",
                color: "#fff",
                letterSpacing: 2,
                textShadowColor: "rgba(0, 255, 65, 0.3)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 10,
              }}>
                DUGOUT
              </Text>
            </View>

            {/* Glassmorphic Status Indicator */}
            <TouchableOpacity
              onPress={recheckConnection}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: apiStatus === 'connected'
                  ? "rgba(0, 255, 65, 0.15)"
                  : apiStatus === 'disconnected'
                  ? "rgba(255, 0, 0, 0.15)"
                  : "rgba(255, 165, 0, 0.15)",
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 20,
                borderWidth: 1.5,
                borderColor: apiStatus === 'connected'
                  ? "rgba(0, 255, 65, 0.4)"
                  : apiStatus === 'disconnected'
                  ? "rgba(255, 0, 0, 0.4)"
                  : "rgba(255, 165, 0, 0.4)",
                shadowColor: apiStatus === 'connected' ? "#00ff41" : apiStatus === 'disconnected' ? "#ff0000" : "#FFA500",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.6,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Animated.View style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: apiStatus === 'connected' ? "#00ff41" : apiStatus === 'disconnected' ? "#ff0000" : "#FFA500",
                marginRight: 8,
                transform: [{ scale: apiStatus === 'checking' ? statusPulse : 1 }],
                shadowColor: apiStatus === 'connected' ? "#00ff41" : apiStatus === 'disconnected' ? "#ff0000" : "#FFA500",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 6,
              }} />
              <Text style={{
                fontSize: 11,
                fontWeight: "800",
                color: apiStatus === 'connected' ? "#00ff41" : apiStatus === 'disconnected' ? "#ff0000" : "#FFA500",
                letterSpacing: 1,
              }}>
                {apiStatus === 'connected' ? 'LIVE' : apiStatus === 'disconnected' ? 'OFFLINE' : 'SYNCING'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={{
            fontSize: 13,
            color: "#00ff41",
            fontWeight: "700",
            letterSpacing: 4,
            opacity: 0.8,
            marginBottom: 20,
          }}>
            TRAINING COMMAND CENTER
          </Text>

          {/* Next-Gen Floating Tab Bar with Glassmorphism */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(10px)",
              borderRadius: 20,
              padding: 5,
              borderWidth: 1.5,
              borderColor: "rgba(0, 255, 65, 0.25)",
              shadowColor: "#00ff41",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 15,
              elevation: 8,
            }}
            onLayout={(e) => {
              const width = e.nativeEvent.layout.width;
              setTabWidth((width - 10) / 3);
            }}
          >
            {/* Fluid Animated Indicator with Glow */}
            {tabWidth > 0 && (
              <Animated.View
                style={{
                  position: "absolute",
                  top: 5,
                  left: 5,
                  bottom: 5,
                  width: tabWidth,
                  borderRadius: 15,
                  overflow: "hidden",
                  transform: [{
                    translateX: tabAnimation.interpolate({
                      inputRange: [0, 1, 2],
                      outputRange: [0, tabWidth, tabWidth * 2]
                    })
                  }],
                }}
              >
                <LinearGradient
                  colors={["#00ff41", "#00dd3a", "#00ff41"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    flex: 1,
                    shadowColor: "#00ff41",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.9,
                    shadowRadius: 15,
                    elevation: 10,
                  }}
                />
              </Animated.View>
            )}

            {/* Drills Tab */}
            <Animated.View style={{ flex: 1, transform: [{ scale: activeTab === "drills" ? pulseAnim : 1 }] }}>
              <TouchableOpacity
                onPress={() => handleTabChange("drills")}
                activeOpacity={0.8}
                style={{
                  paddingVertical: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 15,
                  zIndex: 1,
                }}
              >
                <MaterialCommunityIcons
                  name={getTabIcon("drills")}
                  size={24}
                  color={activeTab === "drills" ? "#000" : "#00ff41"}
                  style={{ marginBottom: 6 }}
                />
                <Text style={{
                  fontSize: 11,
                  fontWeight: "800",
                  color: activeTab === "drills" ? "#000" : "#00ff41",
                  letterSpacing: 0.8,
                }}>
                  DRILLS
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Practice Tab */}
            <Animated.View style={{ flex: 1, transform: [{ scale: activeTab === "practice" ? pulseAnim : 1 }] }}>
              <TouchableOpacity
                onPress={() => handleTabChange("practice")}
                activeOpacity={0.8}
                style={{
                  paddingVertical: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 15,
                  zIndex: 1,
                }}
              >
                <MaterialCommunityIcons
                  name={getTabIcon("practice")}
                  size={24}
                  color={activeTab === "practice" ? "#000" : "#00ff41"}
                  style={{ marginBottom: 6 }}
                />
                <Text style={{
                  fontSize: 11,
                  fontWeight: "800",
                  color: activeTab === "practice" ? "#000" : "#00ff41",
                  letterSpacing: 0.8,
                }}>
                  PRACTICE
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Equipment Tab */}
            <Animated.View style={{ flex: 1, transform: [{ scale: activeTab === "equipment" ? pulseAnim : 1 }] }}>
              <TouchableOpacity
                onPress={() => handleTabChange("equipment")}
                activeOpacity={0.8}
                style={{
                  paddingVertical: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 15,
                  zIndex: 1,
                }}
              >
                <MaterialCommunityIcons
                  name={getTabIcon("equipment")}
                  size={24}
                  color={activeTab === "equipment" ? "#000" : "#00ff41"}
                  style={{ marginBottom: 6 }}
                />
                <Text style={{
                  fontSize: 11,
                  fontWeight: "800",
                  color: activeTab === "equipment" ? "#000" : "#00ff41",
                  letterSpacing: 0.8,
                }}>
                  GEAR
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Content Area with Smooth Transitions */}
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "#0a0a0a",
          opacity: contentFade,
          transform: [{ translateY: contentSlide }],
        }}
      >
        {activeTab === "drills" && <DrillsList />}
        {activeTab === "practice" && <PracticePlansList />}
        {activeTab === "equipment" && <EquipmentList />}
      </Animated.View>
    </View>
  );
}