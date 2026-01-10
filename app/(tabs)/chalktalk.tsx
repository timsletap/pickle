import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

type Section = "chalk" | "rules" | "quiz" | "messages";

export default function ChalkTalk() {
  const [section, setSection] = useState<Section>("chalk");

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Chalk Talk
      </Text>

      {/* Navigation */}
      <View style={styles.nav}>
        <Button onPress={() => setSection("chalk")}>Chalk</Button>
        <Button onPress={() => setSection("rules")}>Rules</Button>
        <Button onPress={() => setSection("quiz")}>Quiz</Button>
        <Button onPress={() => setSection("messages")}>Messages</Button>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {section === "chalk" && <Text>🧑‍🏫 Draw plays here</Text>}
        {section === "rules" && <Text>📘 Rules education</Text>}
        {section === "quiz" && <Text>🧠 Quiz goes here</Text>}
        {section === "messages" && <Text>💬 Team messages / DMs</Text>}
      </View>
    </View>
  );
}

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
    marginBottom: 16,
  },
  content: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
});
