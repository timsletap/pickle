import { useState } from "react";
import {
    Linking,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";


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



  /* ----- Quiz State ----- */
  const [answer, setAnswer] = useState<number | null>(null);

  /* ----- Messages State ----- */
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { text: string; time: string }[]
  >([]);



  

  /* ---------------- UI ---------------- */

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Chalk Talk
      </Text>

      {/* Section Navigation */}
      <View style={styles.nav}>
        <Button onPress={() => setSection("rules")}>Rules</Button>
        <Button onPress={() => setSection("quiz")}>Quiz</Button>
        <Button onPress={() => setSection("messages")}>Messages</Button>
      </View>

      

      {/* ---------------- RULES ---------------- */}
      {section === "rules" && (
        <ScrollView>
          {RULES.map((rule, i) => (
            <Card key={i} style={styles.card}>
              <Card.Title title={rule.category} />
              <Card.Content>
                <Text>{rule.text}</Text>
                <Button
                  onPress={() => Linking.openURL(rule.video)}
                  style={{ marginTop: 8 }}
                >
                  Watch Video
                </Button>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}

      {/* ---------------- QUIZ ---------------- */}
      {section === "quiz" && (
        <View>
          <Text variant="titleMedium">{QUIZ[0].question}</Text>

          {QUIZ[0].options.map((opt, i) => (
            <Button
              key={i}
              mode="outlined"
              style={{ marginTop: 8 }}
              onPress={() => setAnswer(i)}
            >
              {opt}
            </Button>
          ))}

          {answer !== null && (
            <Text style={{ marginTop: 12 }}>
              {answer === QUIZ[0].correct
                ? "✅ Correct!"
                : "❌ Incorrect."}{" "}
              {QUIZ[0].explanation}
            </Text>
          )}
        </View>
      )}

      {/* ---------------- MESSAGES ---------------- */}
      {section === "messages" && (
        <View style={{ flex: 1 }}>
          <TextInput
            label="New Message"
            value={message}
            onChangeText={setMessage}
            style={{ marginBottom: 8 }}
          />

          <Button
            mode="contained"
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
          >
            Post
          </Button>

          <ScrollView style={{ marginTop: 12 }}>
            {messages.map((m, i) => (
              <Card key={i} style={styles.card}>
                <Card.Content>
                  <Text>{m.text}</Text>
                  <Text style={{ fontSize: 12 }}>{m.time}</Text>
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 12,
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  card: {
    marginBottom: 12,
  },
});