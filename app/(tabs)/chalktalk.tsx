import { auth, db } from "@/config/FirebaseConfig";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
    addDoc,
    collection,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc
} from "firebase/firestore";
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

type User = {
  id: string;
  name: string;
  email: string;
};

type Chat = {
  id: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage?: string;
};

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
    question: "How many innings are there in a softball game?",
    options: ["7", "9"],
    correct: 0,
    explanation: "There are 7 innings in a softball game unless there are extra innings.",
  },
  {
    question: "Can a pitcher step backwards before pitching the ball?",
    options: ["Yes", "No"],
    correct: 1,
    explanation: "Stepping backwards before releasing the ball results in an illegal pitch.",
  },
  {
    question: "Does a foul ball result in an out with 2 strikes?",
    options: ["Yes", "No"],
    correct: 0,
    explanation: "A foul ball with 2 strikes results in an out.",
  },
  {
    question: "A runner can't leave the base until the pitch is released.",
    options: ["True", "False"],
    correct: 0,
    explanation: "Runners must wait until the ball is pitched before taking off.",
  },
  {
    question: "Can a runner be out if they interfere with a fielder?",
    options: ["Yes", "No"],
    correct: 0,
    explanation: "Interference with a fielder can lead to an out for the runner.",
  },
  {
    question: "If a ball hits a base, is it fair?",
    options: ["Yes", "No"],
    correct: 0,
    explanation: "A ball is fair as long as it is within foul lines, touches a base, or is fielded in field territory.",
  },
  {
    question: "Helmets aren't required for running bases.",
    options: ["True", "False"],
    correct: 1,
    explanation: "All batters and runners must wear a helmet.",
  },
  {
    question: "If a third strike is dropped, it results in a ball?",
    options: ["True", "False"],
    correct: 1,
    explanation: "If a third strike is dropped then a runner can run to first base if it's unoccupied.",
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
  const [answers, setAnswers] = useState<{ [key: number]: number | null }>({});

  /* ----- Messages State ----- */
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { id: string; text: string; time: string; senderId?: string }[]
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

  // DEBUG: Check current user
  useEffect(() => {
    console.log("Logged in as:", auth.currentUser?.uid);
    console.log("Email:", auth.currentUser?.email);
  }, []);

  // Load users list
  useEffect(() => {
    if (section !== "messages") return;

    const loadUsers = async () => {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      const usersList: User[] = [];
      
      snapshot.forEach((doc) => {
        if (doc.id !== auth.currentUser?.uid) {
          usersList.push({
            id: doc.id,
            name: doc.data().name || doc.data().email || "User",
            email: doc.data().email || "",
          });
        }
      });
      
      setUsers(usersList);
    };

    loadUsers();
  }, [section]);

  // Filter users based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers([]);
    } else {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  // Firebase messages listener for selected chat
  useEffect(() => {
    if (!selectedUser || !auth.currentUser) return;

    const chatId = [auth.currentUser.uid, selectedUser.id].sort().join("_");
    const messagesRef = collection(db, "chats", chatId, "messages");
    const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        msgs.push({
          id: doc.id,
          text: data.text,
          time: data.timestamp?.toDate().toLocaleTimeString() || "Just now",
          senderId: data.senderId,
        });
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedUser]);

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
    setSelectedUser(null); // Reset when switching tabs
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser || !auth.currentUser) return;

    const chatId = [auth.currentUser.uid, selectedUser.id].sort().join("_");
    const messagesRef = collection(db, "chats", chatId, "messages");
    
    await addDoc(messagesRef, {
      text: message,
      senderId: auth.currentUser.uid,
      timestamp: serverTimestamp(),
    });

    // Create/update chat document
    const chatRef = doc(db, "chats", chatId);
    await setDoc(chatRef, {
      participants: [auth.currentUser.uid, selectedUser.id],
      lastMessage: message,
      lastMessageTime: serverTimestamp(),
    }, { merge: true });

    setMessage("");
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
        <View
          style={{
            paddingTop: 50,
            paddingBottom: 20,
            paddingHorizontal: 20,
            backgroundColor: "#0c0c0e",
            borderBottomWidth: 1,
            borderBottomColor: "rgba(0, 168, 120, 0.22)",
          }}
        >
          <Text style={{
            fontSize: 12,
            color: "#00a878",
            fontWeight: "700",
            letterSpacing: 3,
            marginTop: 4,
          }}>
            LEARN THE GAME
          </Text>
          <Text style={{
            fontSize: 28,
            fontWeight: "900",
            color: "#fff",
            letterSpacing: 1,
            marginBottom: 12,
          }}>
            Chalk Talk
          </Text>

          {/* Tab Bar with Glassmorphism */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              borderRadius: 20,
              padding: 5,
              borderWidth: 1.5,
              borderColor: "rgba(0, 168, 120, 0.25)",
              shadowColor: "#00a878",
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
                  backgroundColor: "#00a878",
                  transform: [{
                    translateX: tabAnimation.interpolate({
                      inputRange: [0, 1, 2],
                      outputRange: [0, tabWidth, tabWidth * 2]
                    })
                  }],
                }}
              />
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
                  color={section === "rules" ? "#000" : "#00a878"}
                  style={{ marginBottom: 6 }}
                />
                <Text style={{
                  fontSize: 11,
                  fontWeight: "800",
                  color: section === "rules" ? "#000" : "#00a878",
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
                  color={section === "quiz" ? "#000" : "#00a878"}
                  style={{ marginBottom: 6 }}
                />
                <Text style={{
                  fontSize: 11,
                  fontWeight: "800",
                  color: section === "quiz" ? "#000" : "#00a878",
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
                  color={section === "messages" ? "#000" : "#00a878"}
                  style={{ marginBottom: 6 }}
                />
                <Text style={{
                  fontSize: 11,
                  fontWeight: "800",
                  color: section === "messages" ? "#000" : "#00a878",
                  letterSpacing: 0.8,
                }}>
                  MESSAGES
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </Animated.View>

      {/* Content Area */}
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
                  backgroundColor: "rgba(0, 168, 120, 0.08)",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: "rgba(0, 168, 120, 0.2)",
                }}
              >
                <Text style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#00a878",
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
                    backgroundColor: "rgba(0, 168, 120, 0.15)",
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    alignSelf: "flex-start",
                  }}
                >
                  <MaterialCommunityIcons name="play-circle" size={20} color="#00a878" />
                  <Text style={{
                    color: "#00a878",
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
          <ScrollView style={{ flex: 1, padding: 16 }}>
            {QUIZ.map((quiz, quizIndex) => (
              <View
                key={quizIndex}
                style={{
                  backgroundColor: "rgba(0, 168, 120, 0.08)",
                  borderRadius: 16,
                  padding: 12,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: "rgba(0, 168, 120, 0.2)",
                }}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: "#fff",
                  marginBottom: 12,
                }}>
                  Question {quizIndex + 1}: {quiz.question}
                </Text>

                {quiz.options.map((opt, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setAnswers({ ...answers, [quizIndex]: i })}
                    style={{
                      backgroundColor: answers[quizIndex] === i
                        ? (i === quiz.correct ? "rgba(0, 168, 120, 0.3)" : "rgba(255, 0, 0, 0.3)")
                        : "rgba(0, 168, 120, 0.1)",
                      borderRadius: 12,
                      padding: 10,
                      marginBottom: 8,
                      borderWidth: 1.5,
                      borderColor: answers[quizIndex] === i
                        ? (i === quiz.correct ? "#00a878" : "#ff0000")
                        : "rgba(0, 168, 120, 0.3)",
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

                {answers[quizIndex] !== undefined && answers[quizIndex] !== null && (
                  <View style={{
                    marginTop: 12,
                    padding: 12,
                    backgroundColor: answers[quizIndex] === quiz.correct
                      ? "rgba(0, 168, 120, 0.15)"
                      : "rgba(255, 0, 0, 0.15)",
                    borderRadius: 12,
                  }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: answers[quizIndex] === quiz.correct ? "#00a878" : "#ff6b6b",
                    }}>
                      {answers[quizIndex] === quiz.correct ? "Correct!" : "Incorrect."} {quiz.explanation}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}

        {/* ---------------- MESSAGES ---------------- */}
        {section === "messages" && (
          <View style={{ flex: 1, padding: 16 }}>
            {!selectedUser ? (
              // User search and list
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#00a878",
                  marginBottom: 12,
                }}>
                  Search for a user
                </Text>
                
                {/* Search input */}
                <View style={{
                  backgroundColor: "rgba(0, 168, 120, 0.08)",
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "rgba(0, 168, 120, 0.2)",
                }}>
                  <TextInput
                    placeholder="Type name or email..."
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={{
                      color: "#fff",
                      fontSize: 16,
                      padding: 4,
                    }}
                  />
                </View>

                {/* Search results */}
                <ScrollView>
                  {searchQuery.trim() === "" ? (
                    <Text style={{ color: "rgba(255, 255, 255, 0.5)", textAlign: "center", marginTop: 32 }}>
                      Start typing to search for users
                    </Text>
                  ) : filteredUsers.length === 0 ? (
                    <Text style={{ color: "rgba(255, 255, 255, 0.5)", textAlign: "center", marginTop: 32 }}>
                      No users found
                    </Text>
                  ) : (
                    filteredUsers.map((user) => (
                      <TouchableOpacity
                        key={user.id}
                        onPress={() => {
                          setSelectedUser(user);
                          setSearchQuery("");
                        }}
                        style={{
                          backgroundColor: "rgba(0, 168, 120, 0.08)",
                          borderRadius: 12,
                          padding: 16,
                          marginBottom: 12,
                          borderWidth: 1,
                          borderColor: "rgba(0, 168, 120, 0.2)",
                        }}
                      >
                        <Text style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: "#fff",
                          marginBottom: 4,
                        }}>
                          {user.name}
                        </Text>
                        <Text style={{
                          fontSize: 12,
                          color: "rgba(255, 255, 255, 0.6)",
                        }}>
                          {user.email}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            ) : (
              // Chat view
              <View style={{ flex: 1 }}>
                {/* Back button and user name */}
                <TouchableOpacity
                  onPress={() => setSelectedUser(null)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <MaterialCommunityIcons name="arrow-left" size={24} color="#00a878" />
                  <Text style={{
                    fontSize: 18,
                    fontWeight: "800",
                    color: "#00a878",
                    marginLeft: 8,
                  }}>
                    {selectedUser.name}
                  </Text>
                </TouchableOpacity>

                {/* Messages */}
                <ScrollView style={{ flex: 1, marginBottom: 16 }}>
                  {messages.map((m) => (
                    <View
                      key={m.id}
                      style={{
                        backgroundColor: m.senderId === auth.currentUser?.uid
                          ? "rgba(0, 168, 120, 0.3)"
                          : "rgba(0, 168, 120, 0.08)",
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 8,
                        borderWidth: 1,
                        borderColor: "rgba(0, 168, 120, 0.2)",
                        alignSelf: m.senderId === auth.currentUser?.uid ? "flex-end" : "flex-start",
                        maxWidth: "80%",
                      }}
                    >
                      <Text style={{
                        color: "#fff",
                        fontSize: 14,
                        marginBottom: 4,
                      }}>
                        {m.text}
                      </Text>
                      <Text style={{
                        color: "rgba(0, 168, 120, 0.6)",
                        fontSize: 11,
                      }}>
                        {m.time}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                {/* Input */}
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(0, 168, 120, 0.08)",
                  borderRadius: 12,
                  padding: 8,
                  borderWidth: 1,
                  borderColor: "rgba(0, 168, 120, 0.2)",
                }}>
                  <TextInput
                    placeholder="Type a message..."
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={message}
                    onChangeText={setMessage}
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(0, 0, 0, 0.3)",
                      borderRadius: 8,
                      padding: 8,
                      color: "#fff",
                      fontSize: 14,
                      marginRight: 8,
                      borderWidth: 1,
                      borderColor: "rgba(0, 168, 120, 0.2)",
                    }}
                  />

                  <TouchableOpacity
                    onPress={handleSendMessage}
                    style={{
                      backgroundColor: "#00a878",
                      borderRadius: 8,
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{
                      color: "#000",
                      fontWeight: "800",
                      fontSize: 12,
                      letterSpacing: 0.8,
                    }}>
                      SEND
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </Animated.View>
    </View>
  );
}