import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useState } from "react";
import { FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { API_BASE_URL } from "../../config/api";

export default function PracticePlansList() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [planName, setPlanName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [drillModalVisible, setDrillModalVisible] = useState(false);
  const [availableDrills, setAvailableDrills] = useState<any[]>([]);
  const [drillFilter, setDrillFilter] = useState("");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const userId = 1;

  useEffect(() => {
    fetchPlans();
    fetchFavorites();
  }, []);

  useEffect(() => {
    if (drillModalVisible) {
      fetchAvailableDrills();
    }
  }, [drillFilter, drillModalVisible]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/practice-plans/user/${userId}`, {
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching plans:", error);
      alert("Failed to load practice plans. Please check your connection and try again.");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/practice-plans/favorites?user_id=${userId}`, {
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const ids = Array.isArray(data) ? data.map((p: any) => p.id).filter(id => id != null) : [];
      setFavorites(new Set(ids));
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const toggleFavorite = async (planId: number) => {
    const isFavorited = favorites.has(planId);

    // Optimistically update UI
    if (isFavorited) {
      setFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(planId);
        return newSet;
      });
    } else {
      setFavorites(prev => new Set(prev).add(planId));
    }

    try {
      if (isFavorited) {
        const response = await fetch(`${API_BASE_URL}/api/practice-plans/${planId}/favorite?user_id=${userId}`, {
          method: "DELETE",
          signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/api/practice-plans/${planId}/favorite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
          signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Revert optimistic update on error
      if (isFavorited) {
        setFavorites(prev => new Set(prev).add(planId));
      } else {
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(planId);
          return newSet;
        });
      }
      alert("Failed to update favorite. Please try again.");
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
        body: JSON.stringify({ user_id: userId, name: planName }),
        signal: AbortSignal.timeout(10000)
      });

      setPlanName("");
      setModalVisible(false);
      fetchPlans();
      alert("Practice plan created successfully!");
    } catch (error) {
      console.error("Error creating plan:", error);
      alert("Failed to create practice plan. Please try again.");
    }
  };

  const viewPlanDetails = async (planId: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/practice-plans/${planId}`, {
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSelectedPlan(data);
    } catch (error) {
      console.error("Error fetching plan details:", error);
      alert("Failed to load plan details. Please try again.");
    }
  };

  const fetchAvailableDrills = async () => {
    try {
      const url = drillFilter
        ? `${API_BASE_URL}/api/drills?skill_focus=${drillFilter}`
        : `${API_BASE_URL}/api/drills`;
      const response = await fetch(url, {
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAvailableDrills(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching drills:", error);
      alert("Failed to load drills. Please try again.");
      setAvailableDrills([]);
    }
  };

  const addDrillToPlan = async (drillId: number) => {
    if (!selectedPlan) return;

    const orderNumber = selectedPlan.drills ? selectedPlan.drills.length + 1 : 1;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/practice-plans/${selectedPlan.id}/drills/${drillId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_number: orderNumber }),
          signal: AbortSignal.timeout(10000)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Close modal and refresh plan details
      setDrillModalVisible(false);
      await viewPlanDetails(selectedPlan.id);

      // Show success feedback
      alert("Drill added successfully! ✓");
    } catch (error) {
      console.error("Error adding drill to plan:", error);
      alert("Failed to add drill. Please try again.");
    }
  };

  const openDrillSelector = () => {
    fetchAvailableDrills();
    setDrillModalVisible(true);
  };

  const filteredPlans = showFavoritesOnly ? plans.filter(p => favorites.has(p.id)) : plans;

  if (selectedPlan) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
        <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(0, 168, 120, 0.1)" }}>
          <TouchableOpacity onPress={() => setSelectedPlan(null)}>
            <Text style={{ fontSize: 16, color: "#00a878", fontWeight: "600" }}>← Back</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}>{selectedPlan.name}</Text>
            <TouchableOpacity
              onPress={openDrillSelector}
              style={{
                backgroundColor: "#00a878",
                padding: 10,
                borderRadius: 12,
                shadowColor: "#00a878",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 6
              }}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={selectedPlan.drills}
          keyExtractor={(item) => item.id.toString()}
          style={{ backgroundColor: "#0a0a0a" }}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item, index }) => (
            <View style={{
              padding: 16,
              marginBottom: 12,
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "rgba(0, 168, 120, 0.15)",
              flexDirection: "row"
            }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", marginRight: 15, color: "#00a878" }}>
                {index + 1}.
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 5, color: "#fff" }}>{item.title}</Text>
                <Text style={{ fontSize: 12, color: "#00a878", textTransform: "uppercase", fontWeight: "600" }}>{item.skill_focus}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: "center" }}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={60} color="rgba(0, 168, 120, 0.2)" />
              <Text style={{ fontSize: 16, color: "#666", marginTop: 16, marginBottom: 10 }}>No drills added yet</Text>
              <TouchableOpacity
                onPress={openDrillSelector}
                style={{
                  backgroundColor: "#00a878",
                  padding: 12,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  shadowColor: "#00a878",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8
                }}
              >
                <Text style={{ color: "#000", fontWeight: "700" }}>Add Your First Drill</Text>
              </TouchableOpacity>
            </View>
          }
        />

        <Modal visible={drillModalVisible} animationType="slide">
          <View style={{ flex: 1, backgroundColor: "#000" }}>
            <View style={{
              padding: 20,
              paddingTop: 60,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(0, 168, 120, 0.2)",
              backgroundColor: "#0a0a0a"
            }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                <View>
                  <Text style={{ fontSize: 14, color: "#00a878", fontWeight: "600", letterSpacing: 1, marginBottom: 4 }}>SELECT</Text>
                  <Text style={{ fontSize: 28, fontWeight: "900", color: "#fff" }}>Add Drill</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setDrillModalVisible(false)}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    padding: 10,
                    borderRadius: 12
                  }}
                >
                  <MaterialCommunityIcons name="close" size={28} color="#00a878" />
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
                <TouchableOpacity
                  onPress={() => setDrillFilter("")}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 18,
                    marginHorizontal: 4,
                    backgroundColor: drillFilter === "" ? "#00a878" : "rgba(0, 168, 120, 0.1)",
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: drillFilter === "" ? "#00a878" : "rgba(0, 168, 120, 0.3)"
                  }}
                >
                  <Text style={{ color: drillFilter === "" ? "#000" : "#00a878", fontWeight: "700", fontSize: 13 }}>ALL</Text>
                </TouchableOpacity>
                {["hitting", "fielding", "pitching", "baserunning"].map((skill) => (
                  <TouchableOpacity
                    key={skill}
                    onPress={() => setDrillFilter(skill)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 18,
                      marginHorizontal: 4,
                      backgroundColor: drillFilter === skill ? "#00a878" : "rgba(0, 168, 120, 0.1)",
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: drillFilter === skill ? "#00a878" : "rgba(0, 168, 120, 0.3)"
                    }}
                  >
                    <Text style={{ color: drillFilter === skill ? "#000" : "#00a878", textTransform: "uppercase", fontWeight: "700", fontSize: 13 }}>
                      {skill}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <FlatList
              data={availableDrills}
              keyExtractor={(item) => item.id.toString()}
              style={{ flex: 1, backgroundColor: "#0a0a0a" }}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => addDrillToPlan(item.id)}
                  style={{
                    padding: 16,
                    marginBottom: 12,
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "rgba(0, 168, 120, 0.15)"
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 5, color: "#fff" }}>{item.title}</Text>
                  <Text style={{ fontSize: 13, color: "#999", marginBottom: 5 }}>{item.description}</Text>
                  <View style={{
                    backgroundColor: "rgba(0, 168, 120, 0.1)",
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                    borderRadius: 8,
                    alignSelf: "flex-start",
                    borderWidth: 1,
                    borderColor: "rgba(0, 168, 120, 0.3)"
                  }}>
                    <Text style={{ fontSize: 11, color: "#00a878", textTransform: "uppercase", fontWeight: "700" }}>{item.skill_focus}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
      <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(0, 168, 120, 0.1)" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
          <View>
            <Text style={{ fontSize: 14, color: "#00a878", fontWeight: "600", letterSpacing: 1, marginBottom: 4 }}>TRAINING</Text>
            <Text style={{ fontSize: 28, fontWeight: "900", color: "#fff" }}>Practice Plans</Text>
          </View>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{
              backgroundColor: "#00a878",
              padding: 12,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              shadowColor: "#00a878",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 6
            }}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#000" />
            <Text style={{ color: "#000", fontWeight: "700", marginLeft: 6 }}>Create Plan</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 18,
            backgroundColor: showFavoritesOnly ? "#00a878" : "rgba(0, 168, 120, 0.1)",
            borderRadius: 20,
            borderWidth: 1,
            borderColor: showFavoritesOnly ? "#00a878" : "rgba(0, 168, 120, 0.3)",
            alignSelf: "flex-start"
          }}
        >
          <Text style={{ color: showFavoritesOnly ? "#000" : "#00a878", fontWeight: "700", fontSize: 13 }}>
            {showFavoritesOnly ? "★ FAVORITES" : "☆ SHOW FAVORITES"}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#0a0a0a", padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: 2, borderColor: "rgba(0, 168, 120, 0.3)" }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 15, color: "#fff" }}>Create Practice Plan</Text>

            <TextInput
              placeholder="Enter plan name..."
              placeholderTextColor="#666"
              value={planName}
              onChangeText={setPlanName}
              style={{
                borderWidth: 1,
                borderColor: "rgba(0, 168, 120, 0.3)",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                color: "#fff",
                padding: 14,
                borderRadius: 12,
                marginBottom: 15,
                fontSize: 16
              }}
            />

            <TouchableOpacity
              onPress={createPlan}
              style={{
                backgroundColor: "#00a878",
                padding: 14,
                borderRadius: 12,
                marginBottom: 10,
                shadowColor: "#00a878",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8
              }}
            >
              <Text style={{ color: "#000", fontWeight: "700", textAlign: "center", fontSize: 16 }}>Create</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setPlanName("");
              }}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                padding: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "rgba(0, 168, 120, 0.3)"
              }}
            >
              <Text style={{ color: "#00a878", fontWeight: "700", textAlign: "center", fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0a0a0a" }}>
          <MaterialCommunityIcons name="loading" size={40} color="#00a878" />
          <Text style={{ color: "#00a878", marginTop: 12, fontSize: 16, fontWeight: "600" }}>Loading plans...</Text>
        </View>
      ) : filteredPlans.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={60} color="rgba(0, 168, 120, 0.2)" />
          <Text style={{ fontSize: 18, color: "#666", marginTop: 16, textAlign: "center" }}>
            {showFavoritesOnly ? "No favorite plans yet" : "No practice plans yet"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPlans}
          keyExtractor={(item) => item.id.toString()}
          style={{ backgroundColor: "#0a0a0a" }}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={{
              marginBottom: 12,
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "rgba(0, 168, 120, 0.15)",
              overflow: "hidden",
              shadowColor: "#00a878",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8
            }}>
              <View style={{ padding: 16 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <TouchableOpacity
                    onPress={() => viewPlanDetails(item.id)}
                    style={{ flex: 1, marginRight: 12 }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 5, color: "#fff" }}>{item.name}</Text>
                    <Text style={{ fontSize: 12, color: "#666" }}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => toggleFavorite(item.id)}
                    style={{
                      backgroundColor: favorites.has(item.id) ? "rgba(255, 193, 7, 0.2)" : "rgba(255, 193, 7, 0.1)",
                      padding: 10,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: favorites.has(item.id) ? "rgba(255, 193, 7, 0.5)" : "rgba(255, 193, 7, 0.3)"
                    }}
                  >
                    <Text style={{ fontSize: 22, color: "#FFC107" }}>{favorites.has(item.id) ? "★" : "☆"}</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={() => viewPlanDetails(item.id)}
                  style={{
                    backgroundColor: "#00a878",
                    padding: 12,
                    borderRadius: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 12
                  }}
                >
                  <MaterialCommunityIcons name="clipboard-text-outline" size={18} color="#000" />
                  <Text style={{ color: "#000", fontWeight: "800", marginLeft: 8, fontSize: 15 }}>View Plan</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
