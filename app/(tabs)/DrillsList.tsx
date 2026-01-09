import React, { useEffect, useState } from "react";
import { FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { API_BASE_URL } from "../../config/api";

export default function DrillsList() {
  const [drills, setDrills] = useState([]);
  const [skillFilter, setSkillFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const userId = 1;

  useEffect(() => {
    fetchDrills();
  }, [skillFilter]);

  const fetchDrills = async () => {
    try {
      setLoading(true);
      const url = skillFilter 
        ? `${API_BASE_URL}/api/drills?skill_focus=${skillFilter}`
        : `${API_BASE_URL}/api/drills`;
      
      const response = await fetch(url);
      const data = await response.json();
      setDrills(data);
    } catch (error) {
      console.error("Error fetching drills:", error);
    } finally {
      setLoading(false);
    }
  };

  const favoriteDrill = async (drillId: any) => {
    try {
      await fetch(
        `${API_BASE_URL}/api/drills/${drillId}/favorite`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId })
        }
      );
    } catch (error) {
      console.error("Error favoriting drill:", error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: "#e0e0e0" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>Drills</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: "row" }}>
          <TouchableOpacity 
            onPress={() => setSkillFilter(skillFilter === "hitting" ? "" : "hitting")}
            style={{ 
              paddingVertical: 8, 
              paddingHorizontal: 15, 
              marginRight: 10,
              backgroundColor: skillFilter === "hitting" ? "#007AFF" : "#f0f0f0",
              borderRadius: 20
            }}
          >
            <Text style={{ color: skillFilter === "hitting" ? "#fff" : "#000" }}>Hitting</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setSkillFilter(skillFilter === "fielding" ? "" : "fielding")}
            style={{ 
              paddingVertical: 8, 
              paddingHorizontal: 15, 
              marginRight: 10,
              backgroundColor: skillFilter === "fielding" ? "#007AFF" : "#f0f0f0",
              borderRadius: 20
            }}
          >
            <Text style={{ color: skillFilter === "fielding" ? "#fff" : "#000" }}>Fielding</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setSkillFilter(skillFilter === "pitching" ? "" : "pitching")}
            style={{ 
              paddingVertical: 8, 
              paddingHorizontal: 15,
              backgroundColor: skillFilter === "pitching" ? "#007AFF" : "#f0f0f0",
              borderRadius: 20
            }}
          >
            <Text style={{ color: skillFilter === "pitching" ? "#fff" : "#000" }}>Pitching</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={drills}
          keyExtractor={(item: { id: { toString: () => any; }; }) => item.id.toString()}
          renderItem={({ item }: { item: any }) => (
            <View style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: "#e0e0e0" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 5 }}>{item.title}</Text>
                  <Text style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>{item.description}</Text>
                  <Text style={{ fontSize: 12, color: "#007AFF", fontWeight: "600" }}>
                    Skill: {item.skill_focus}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => favoriteDrill(item.id)} style={{ marginLeft: 10 }}>
                    <Text style={{ fontSize: 24, color: "#FF9500" }}>★</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}