import * as React from "react";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import DrillsList from "./DrillsList";
import EquipmentList from "./EquipmentList";
import PracticePlansList from "./PracticePlansList";

export default function Dugout() {
  const [activeTab, setActiveTab] = useState("drills");

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ 
        flexDirection: "row", 
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0"
      }}>
        <TouchableOpacity 
          onPress={() => setActiveTab("drills")}
          style={{ 
            flex: 1, 
            paddingVertical: 12, 
            borderBottomWidth: 3,
            borderBottomColor: activeTab === "drills" ? "#007AFF" : "transparent"
          }}
        >
          <Text style={{ 
            textAlign: "center", 
            fontWeight: "600",
            color: activeTab === "drills" ? "#007AFF" : "#999"
          }}>
            Drills
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setActiveTab("practice")}
          style={{ 
            flex: 1, 
            paddingVertical: 12,
            borderBottomWidth: 3,
            borderBottomColor: activeTab === "practice" ? "#007AFF" : "transparent"
          }}
        >
          <Text style={{ 
            textAlign: "center", 
            fontWeight: "600",
            color: activeTab === "practice" ? "#007AFF" : "#999"
          }}>
            Practice
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setActiveTab("equipment")}
          style={{ 
            flex: 1, 
            paddingVertical: 12,
            borderBottomWidth: 3,
            borderBottomColor: activeTab === "equipment" ? "#007AFF" : "transparent"
          }}
        >
          <Text style={{ 
            textAlign: "center", 
            fontWeight: "600",
            color: activeTab === "equipment" ? "#007AFF" : "#999"
          }}>
            Equipment
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {activeTab === "drills" && <DrillsList />}
        {activeTab === "practice" && <PracticePlansList />}
        {activeTab === "equipment" && <EquipmentList />}
      </View>
    </View>
  );
}