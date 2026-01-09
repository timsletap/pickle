import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { API_BASE_URL } from "../../config/api";

export default function PracticePlansList() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [planName, setPlanName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const userId = 1;

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/practice-plans/user/${userId}`);
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async () => {
    if (!planName.trim()) {
      alert("Please enter a plan name");
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/api/practice-plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, name: planName })
      });
      
      setPlanName("");
      setModalVisible(false);
      fetchPlans();
    } catch (error) {
      console.error("Error creating plan:", error);
    }
  };

  const viewPlanDetails = async (planId: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/practice-plans/${planId}`);
      const data = await response.json();
      setSelectedPlan(data);
    } catch (error) {
      console.error("Error fetching plan details:", error);
    }
  };

  if (selectedPlan) {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: "#e0e0e0" }}>
          <TouchableOpacity onPress={() => setSelectedPlan(null)}>
            <Text style={{ fontSize: 16, color: "#007AFF", fontWeight: "600" }}>← Back</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginTop: 10 }}>{selectedPlan.name}</Text>
        </View>

        <FlatList
          data={selectedPlan.drills}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <View style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: "#e0e0e0", flexDirection: "row" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", marginRight: 15, color: "#007AFF" }}>
                {index + 1}.
              </Text>
              <View>
                <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 5 }}>{item.title}</Text>
                <Text style={{ fontSize: 12, color: "#007AFF" }}>{item.skill_focus}</Text>
              </View>
            </View>
          )}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: "#e0e0e0" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 15 }}>Practice Plans</Text>
        
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          style={{ 
            backgroundColor: "#007AFF", 
            paddingVertical: 12, 
            paddingHorizontal: 15, 
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 8 }}>Create New Plan</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 15 }}>Create Practice Plan</Text>
            
            <TextInput
              placeholder="Enter plan name..."
              value={planName}
              onChangeText={setPlanName}
              style={{ 
                borderWidth: 1, 
                borderColor: "#ccc", 
                padding: 12, 
                borderRadius: 8, 
                marginBottom: 15,
                fontSize: 16
              }}
            />
            
            <TouchableOpacity 
              onPress={createPlan}
              style={{ backgroundColor: "#007AFF", padding: 12, borderRadius: 8, marginBottom: 10 }}
            >
              <Text style={{ color: "#fff", fontWeight: "600", textAlign: "center", fontSize: 16 }}>Create</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => {
                setModalVisible(false);
                setPlanName("");
              }}
              style={{ backgroundColor: "#f0f0f0", padding: 12, borderRadius: 8 }}
            >
              <Text style={{ color: "#000", fontWeight: "600", textAlign: "center", fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Loading...</Text>
        </View>
      ) : plans.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 16, color: "#999" }}>No practice plans yet</Text>
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => viewPlanDetails(item.id)}
              style={{ 
                padding: 15, 
                borderBottomWidth: 1, 
                borderBottomColor: "#e0e0e0",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <View>
                <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 5 }}>{item.name}</Text>
                <Text style={{ fontSize: 12, color: "#999" }}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}