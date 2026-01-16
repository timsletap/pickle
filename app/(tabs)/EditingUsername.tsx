import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { TextInput } from "react-native-paper";

export default function EditingUsername() {
  const [editingUsername, setEditingUsername] = useState<string>("");
  const [editFocused, setEditFocused] = useState<boolean>(false);

  return (
    <View style={styles.fieldWrap}>
      {(editFocused || editingUsername) ? <Text style={styles.floatingLabel}>Username</Text> : null}
      <TextInput
        value={editingUsername}
        onChangeText={setEditingUsername}
          autoCapitalize="none"
          mode="outlined"
          outlineColor={'rgba(0,255,65,0.06)'}
          activeOutlineColor={'#00ff41'}
          textColor="#fff"
          style={[styles.editUser, editFocused ? styles.editUserFocused : null]}
          onFocus={() => setEditFocused(true)}
          onBlur={() => setEditFocused(false)}
        />
      </View>
    );
}

const styles = StyleSheet.create({
editUser: {
    marginBottom: 4,
    width: 200,
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#fff",
  },
  fieldWrap: {
    marginVertical: 8,
  },
  floatingLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginBottom: 6,
    marginLeft: 6,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  editUserFocused: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 12,
    shadowColor: "#00ff41",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
});