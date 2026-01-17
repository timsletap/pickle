import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    Linking,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";


/* ---------------- TYPES ---------------- */

type Section = "rules" | "quiz" | "messages";

/* ---------------- DATA ---------------- */

const RULES = [
  {
    category: "Game Structure",
    text: "Teams: 9 players on the field\nInnings: 7 innings (each team bats once per inning)\nOuts: 3 outs per half-inning\nObjective: Score more runs than the other team",
    video: "https://www.youtube.com/watch?v=YLU6W6AYQto&t=1s",
  },
  {
    category: "Pitching",
    text: "Pitch must be underhand\nPitcher must keep one foot on the pitching rubber and a circular pitch motion\nNo crow hopping (pushing off and re-planting)\nPitcher cannot step backward before releasing the ball\nIllegal pitches result in a ball",
    video: "https://www.youtube.com/watch?v=eSvzm-vRrT8",
  },
  {
    category: "Batting",
    text: "Strike = swinging and missing, foul ball (under 2 strikes), or pitch in strike zone\n3 strikes = out\nBunting not allowed with 2 strikes\nFoul ball on third strike = out\nBat must be approved",
    video: "https://www.youtube.com/watch?v=DwVYejPGS-k",
  },
  {
    category: "Base Running",
    text: "Runners cannot leave the base until the pitch is released\nLeading off early = out\nSliding is allowed\nRunner must avoid contact with the fielder\nNo running through home plate (must slide or avoid contact)",
    video: "https://www.youtube.com/watch?v=Nhj7wHp2WTM",
  },
  {
    category: "Fielding",
    text: "Fielders must give runners a clear path to the base and not obstruct without the ball\nInterference by a runner = out\nObstruction by a fielder = runner awarded base(s)",
    video: "https://www.youtube.com/watch?v=wSK_ZmJWDRE",
  },
  {
    category: "Fair vs Foul",
    text: "Ball is fair if it lands inside foul lines, touches a base, or is fielded in fair territory\nBall is foul if it lands outside foul lines before passing first or third base",
    video: "https://www.youtube.com/watch?v=S05DyO5eVlc",
  },
  {
    category: "Equipment Rule",
    text: "Helmets required when batting and running bases\nCatcher must wear full protective gear",
    video: "https://www.youtube.com/watch?v=dEBzOSsMhZU",
  },
  {
    category: "Situational Rules",
    text: "Dropped third strike: Batter may run if first base is unoccupied (or 2 outs)\nInfield fly rule: Batter is automatically out on a pop-up with runners on 1st & 2nd (or bases loaded), fewer than 2 outs\nMissing a base or leaving early can be appealed by the defense",
    video: "https://www.youtube.com/watch?v=Nhj7wHp2WTM",
  },
  
];

const QUIZ = [
  {
    question: "Can a runner leave early on a fly ball?",
    options: ["Yes", "No"],
    correct: 1,
    explanation: "Runners must wait until the ball is caught.",
  },
];

/* ---------------- COMPONENT ---------------- */

export default function ChalkTalk() {
  const [section, setSection] = useState<Section>("rules");
  const [tabWidth, setTabWidth] = useState(0);

  // Animation values
  const tabAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(30)).current;

  /* ----- Quiz State ----- */
  const [answer, setAnswer] = useState<number | null>(null);

  /* ----- Messages State ----- */
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { text: string; time: string }[]
  >([]);

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
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.spring(contentSlide, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleTabChange = (tab: Section) => {
    const tabIndex = tab === "rules" ? 0 : tab === "quiz" ? 1 : 2;

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

    setSection(tab);
  };

  const getTabIcon = (tab: Section): keyof typeof MaterialCommunityIcons.glyphMap => {
    switch(tab) {
      case "rules": return "book-open-variant";
      case "quiz": return "head-question";
      case "messages": return "message-text";
      default: return "circle";
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* Header with Gradient */}
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

          <View style={{ marginBottom: 12 }}>
            <Text style={{
              fontSize: 42,
              fontWeight: "900",
              color: "#fff",
              letterSpacing: 2,
              textShadowColor: "rgba(0, 255, 65, 0.3)",
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 10,
            }}>
              CHALK TALK
            </Text>
          </View>

          <Text style={{
            fontSize: 13,
            color: "#00ff41",
            fontWeight: "700",
            letterSpacing: 4,
            opacity: 0.8,
            marginBottom: 20,
          }}>
            LEARN THE GAME
          </Text>

          {/* Tab Bar with Glassmorphism */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
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
            {/* Animated Indicator */}
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

            {/* Rules Tab */}
            <Animated.View style={{ flex: 1, transform: [{ scale: section === "rules" ? pulseAnim : 1 }] }}>
              <TouchableOpacity
                onPress={() => handleTabChange("rules")}
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
                  name={getTabIcon("rules")}
                  size={24}
                  color={section === "rules" ? "#000" : "#00ff41"}
                  style={{ marginBottom: 6 }}
                />
                <Text style={{
                  fontSize: 11,
                  fontWeight: "800",
                  color: section === "rules" ? "#000" : "#00ff41",
                  letterSpacing: 0.8,
                }}>
                  RULES
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Quiz Tab */}
            <Animated.View style={{ flex: 1, transform: [{ scale: section === "quiz" ? pulseAnim : 1 }] }}>
              <TouchableOpacity
                onPress={() => handleTabChange("quiz")}
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
                  name={getTabIcon("quiz")}
                  size={24}
                  color={section === "quiz" ? "#000" : "#00ff41"}
                  style={{ marginBottom: 6 }}
                />
                <Text style={{
                  fontSize: 11,
                  fontWeight: "800",
                  color: section === "quiz" ? "#000" : "#00ff41",
                  letterSpacing: 0.8,
                }}>
                  QUIZ
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Messages Tab */}
            <Animated.View style={{ flex: 1, transform: [{ scale: section === "messages" ? pulseAnim : 1 }] }}>
              <TouchableOpacity
                onPress={() => handleTabChange("messages")}
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
                  name={getTabIcon("messages")}
                  size={24}
                  color={section === "messages" ? "#000" : "#00ff41"}
                  style={{ marginBottom: 6 }}
                />
                <Text style={{
                  fontSize: 11,
                  fontWeight: "800",
                  color: section === "messages" ? "#000" : "#00ff41",
                  letterSpacing: 0.8,
                }}>
                  MESSAGES
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
        {/* ---------------- RULES ---------------- */}
        {section === "rules" && (
          <ScrollView style={{ padding: 16 }}>
            {RULES.map((rule, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: "rgba(0, 255, 65, 0.08)",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: "rgba(0, 255, 65, 0.2)",
                }}
              >
                <Text style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#00ff41",
                  marginBottom: 8,
                  letterSpacing: 1,
                }}>
                  {rule.category}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: "#fff",
                  lineHeight: 22,
                  opacity: 0.9,
                }}>
                  {rule.text}
                </Text>
                <TouchableOpacity
                  onPress={() => Linking.openURL(rule.video)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 12,
                    backgroundColor: "rgba(0, 255, 65, 0.15)",
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    alignSelf: "flex-start",
                  }}
                >
                  <MaterialCommunityIcons name="play-circle" size={20} color="#00ff41" />
                  <Text style={{
                    color: "#00ff41",
                    fontWeight: "700",
                    marginLeft: 8,
                    fontSize: 13,
                  }}>
                    Watch Video
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* ---------------- QUIZ ---------------- */}
        {section === "quiz" && (
          <View style={{ padding: 16 }}>
            <View style={{
              backgroundColor: "rgba(0, 255, 65, 0.08)",
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: "rgba(0, 255, 65, 0.2)",
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: "800",
                color: "#fff",
                marginBottom: 20,
              }}>
                {QUIZ[0].question}
              </Text>

              {QUIZ[0].options.map((opt, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setAnswer(i)}
                  style={{
                    backgroundColor: answer === i
                      ? (i === QUIZ[0].correct ? "rgba(0, 255, 65, 0.3)" : "rgba(255, 0, 0, 0.3)")
                      : "rgba(0, 255, 65, 0.1)",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 10,
                    borderWidth: 1.5,
                    borderColor: answer === i
                      ? (i === QUIZ[0].correct ? "#00ff41" : "#ff0000")
                      : "rgba(0, 255, 65, 0.3)",
                  }}
                >
                  <Text style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#fff",
                    textAlign: "center",
                  }}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}

              {answer !== null && (
                <View style={{
                  marginTop: 16,
                  padding: 16,
                  backgroundColor: answer === QUIZ[0].correct
                    ? "rgba(0, 255, 65, 0.15)"
                    : "rgba(255, 0, 0, 0.15)",
                  borderRadius: 12,
                }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: answer === QUIZ[0].correct ? "#00ff41" : "#ff6b6b",
                  }}>
                    {answer === QUIZ[0].correct ? "Correct!" : "Incorrect."} {QUIZ[0].explanation}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ---------------- MESSAGES ---------------- */}
        {section === "messages" && (
          <View style={{ flex: 1, padding: 16 }}>
            <View style={{
              backgroundColor: "rgba(0, 255, 65, 0.08)",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: "rgba(0, 255, 65, 0.2)",
            }}>
              <TextInput
                placeholder="Write a message..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={message}
                onChangeText={setMessage}
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  borderRadius: 12,
                  padding: 16,
                  color: "#fff",
                  fontSize: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: "rgba(0, 255, 65, 0.2)",
                }}
              />

              <TouchableOpacity
                onPress={() => {
                  if (!message) return;
                  setMessages([
                    {
                      text: message,
                      time: new Date().toLocaleTimeString(),
                    },
                    ...messages,
                  ]);
                  setMessage("");
                }}
                style={{
                  backgroundColor: "#00ff41",
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <Text style={{
                  color: "#000",
                  fontWeight: "800",
                  fontSize: 14,
                  letterSpacing: 1,
                }}>
                  POST MESSAGE
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {messages.map((m, i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: "rgba(0, 255, 65, 0.08)",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: "rgba(0, 255, 65, 0.15)",
                  }}
                >
                  <Text style={{
                    color: "#fff",
                    fontSize: 15,
                    marginBottom: 6,
                  }}>
                    {m.text}
                  </Text>
                  <Text style={{
                    color: "rgba(0, 255, 65, 0.6)",
                    fontSize: 12,
                  }}>
                    {m.time}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </Animated.View>
    </View>
  );
}