import React, { useEffect, useState } from "react";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { FlatList, Image, Linking, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { API_BASE_URL } from "../../config/api";

interface Equipment {
  id: number;
  name: string;
  description: string;
  price: number;
  where_to_buy: string;
  link: string;
  image_url?: string;
  rating?: number;
}

interface SearchResult {
  title: string;
  description: string;
  link: string;
  display_link: string;
  image_url?: string;
}

export default function EquipmentList() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [webSearchQuery, setWebSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [equipmentPrice, setEquipmentPrice] = useState("");
  const [equipmentRating, setEquipmentRating] = useState("");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const userId = 1;

  useEffect(() => {
    fetchEquipment();
    fetchFavorites();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/equipment`, {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEquipment(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      alert("Failed to load equipment. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/equipment/favorites?user_id=${userId}`, {
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const ids = Array.isArray(data) ? data.map((e: Equipment) => e.id).filter(id => id != null) : [];
      setFavorites(new Set(ids));
    } catch (error) {
      console.error("Error fetching favorites:", error);
      // Don't alert for favorites, just log the error
    }
  };

  const toggleFavorite = async (equipmentId: number) => {
    const isFavorited = favorites.has(equipmentId);

    // Optimistically update UI
    if (isFavorited) {
      setFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(equipmentId);
        return newSet;
      });
    } else {
      setFavorites(prev => new Set(prev).add(equipmentId));
    }

    try {
      if (isFavorited) {
        const response = await fetch(`${API_BASE_URL}/api/equipment/${equipmentId}/favorite?user_id=${userId}`, {
          method: "DELETE",
          signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/api/equipment/${equipmentId}/favorite`, {
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
        setFavorites(prev => new Set(prev).add(equipmentId));
      } else {
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(equipmentId);
          return newSet;
        });
      }
      alert("Failed to update favorite. Please try again.");
    }
  };

  const openLink = async (url: string) => {
    if (!url) {
      alert("No link available for this equipment.");
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        alert("Unable to open this link.");
      }
    } catch (error) {
      console.error("Error opening link:", error);
      alert("Failed to open link. Please try again.");
    }
  };

  const searchWeb = async () => {
    if (!webSearchQuery.trim()) {
      alert("Please enter a search query");
      return;
    }

    try {
      setSearching(true);
      setSearchResults([]);
      const response = await fetch(
        `${API_BASE_URL}/api/equipment/search/web?query=${encodeURIComponent(webSearchQuery)}`,
        {
          signal: AbortSignal.timeout(15000) // 15 second timeout for search
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const results = Array.isArray(data) ? data : [];

      if (results.length === 0) {
        alert("No results found. Try a different search term.");
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Error searching web:", error);
      if (error instanceof Error && error.message.includes("configured")) {
        alert("Google Custom Search API not configured. Please check your API keys.");
      } else if (error instanceof Error && error.name === "TimeoutError") {
        alert("Search request timed out. Please try again.");
      } else {
        alert("Error searching web. Make sure the backend is running and try again.");
      }
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const addEquipment = async () => {
    if (!selectedResult) {
      alert("No equipment selected");
      return;
    }

    if (!equipmentPrice.trim()) {
      alert("Please enter a price");
      return;
    }

    const price = parseFloat(equipmentPrice);
    if (isNaN(price) || price < 0) {
      alert("Please enter a valid positive price");
      return;
    }

    let rating = null;
    if (equipmentRating.trim()) {
      rating = parseFloat(equipmentRating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        alert("Rating must be between 0 and 5");
        return;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/equipment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedResult.title?.substring(0, 255) || "Unknown Item",
          description: selectedResult.description?.substring(0, 1000) || "",
          link: selectedResult.link || "",
          price: price,
          where_to_buy: selectedResult.display_link?.substring(0, 255) || "",
          image_url: selectedResult.image_url || null,
          rating: rating
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSearchModalVisible(false);
      setSelectedResult(null);
      setSearchResults([]);
      setWebSearchQuery("");
      setEquipmentPrice("");
      setEquipmentRating("");
      fetchEquipment();
      alert("Equipment added successfully!");
    } catch (error) {
      console.error("Error adding equipment:", error);
      alert("Failed to add equipment. Please try again.");
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating || rating < 0 || rating > 5) return null;
    const stars = [];
    const clampedRating = Math.max(0, Math.min(5, rating));
    const fullStars = Math.floor(clampedRating);
    const hasHalfStar = clampedRating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Text key={`star-${i}`} style={{ color: "#FFD700", fontSize: 14 }}>★</Text>);
    }
    if (hasHalfStar) {
      stars.push(<Text key="half-star" style={{ color: "#FFD700", fontSize: 14 }}>⯨</Text>);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Text key={`empty-${i}`} style={{ color: "#666", fontSize: 14 }}>★</Text>);
    }
    return <View style={{ flexDirection: "row", alignItems: "center" }}>{stars}</View>;
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
      <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(0, 255, 65, 0.1)" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <View>
            <Text style={{ fontSize: 14, color: "#00ff41", fontWeight: "600", letterSpacing: 1, marginBottom: 4 }}>BASEBALL</Text>
            <Text style={{ fontSize: 28, fontWeight: "900", color: "#fff" }}>Equipment Deals</Text>
          </View>
          <TouchableOpacity
            onPress={() => setSearchModalVisible(true)}
            style={{
              backgroundColor: "#00ff41",
              padding: 12,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              shadowColor: "#00ff41",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 6
            }}
          >
            <MaterialCommunityIcons name="magnify" size={20} color="#000" />
            <Text style={{ color: "#000", fontWeight: "700", marginLeft: 6 }}>Find Gear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0a0a0a" }}>
          <MaterialCommunityIcons name="loading" size={40} color="#00ff41" />
          <Text style={{ color: "#00ff41", marginTop: 12, fontSize: 16, fontWeight: "600" }}>Loading equipment...</Text>
        </View>
      ) : equipment.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <MaterialCommunityIcons name="baseball-bat" size={60} color="rgba(0, 255, 65, 0.2)" />
          <Text style={{ fontSize: 18, color: "#666", marginTop: 16, textAlign: "center" }}>No equipment deals yet</Text>
          <Text style={{ fontSize: 14, color: "#444", marginTop: 8, textAlign: "center" }}>Search for gear to get started!</Text>
        </View>
      ) : (
        <FlatList
          data={equipment}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={{
              marginBottom: 16,
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "rgba(0, 255, 65, 0.15)",
              overflow: "hidden",
              shadowColor: "#00ff41",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8
            }}>
              {item.image_url && !imageErrors.has(item.image_url) && (
                <Image
                  source={{ uri: item.image_url }}
                  style={{ width: "100%", height: 200, backgroundColor: "#000" }}
                  resizeMode="cover"
                  onError={() => setImageErrors(prev => new Set(prev).add(item.image_url!))}
                />
              )}
              <View style={{ padding: 16 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={{ fontSize: 18, fontWeight: "800", color: "#fff", marginBottom: 6 }}>{item.name}</Text>
                    {item.rating && (
                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                        {renderStars(item.rating)}
                        <Text style={{ color: "#FFD700", marginLeft: 8, fontSize: 14, fontWeight: "600" }}>
                          {item.rating.toFixed(1)}
                        </Text>
                      </View>
                    )}
                    <Text style={{ fontSize: 13, color: "#999", marginBottom: 10, lineHeight: 18 }}>{item.description}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                      <Text style={{ fontSize: 24, fontWeight: "900", color: "#00ff41" }}>${item.price.toFixed(2)}</Text>
                      <View style={{
                        backgroundColor: "rgba(0, 255, 65, 0.1)",
                        paddingVertical: 4,
                        paddingHorizontal: 10,
                        borderRadius: 8,
                        marginLeft: 12,
                        borderWidth: 1,
                        borderColor: "rgba(0, 255, 65, 0.3)"
                      }}>
                        <Text style={{ fontSize: 11, color: "#00ff41", fontWeight: "700" }}>{item.where_to_buy}</Text>
                      </View>
                    </View>
                  </View>
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
                  onPress={() => openLink(item.link)}
                  style={{
                    backgroundColor: "#00ff41",
                    padding: 14,
                    borderRadius: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <MaterialCommunityIcons name="cart" size={20} color="#000" />
                  <Text style={{ color: "#000", fontWeight: "800", marginLeft: 8, fontSize: 15 }}>View Deal</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={searchModalVisible} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <View style={{
            padding: 20,
            paddingTop: 60,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(0, 255, 65, 0.2)",
            backgroundColor: "#0a0a0a"
          }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text style={{ fontSize: 14, color: "#00ff41", fontWeight: "600", letterSpacing: 1, marginBottom: 4 }}>WEB SEARCH</Text>
                <Text style={{ fontSize: 28, fontWeight: "900", color: "#fff" }}>Find Equipment</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setSearchModalVisible(false);
                  setSearchResults([]);
                  setSelectedResult(null);
                  setWebSearchQuery("");
                  setEquipmentPrice("");
                  setEquipmentRating("");
                }}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  padding: 10,
                  borderRadius: 12
                }}
              >
                <MaterialCommunityIcons name="close" size={28} color="#00ff41" />
              </TouchableOpacity>
            </View>

            {!selectedResult && (
              <View style={{ marginTop: 15 }}>
                <TextInput
                  placeholder="Search for equipment (e.g., 'baseball bat')"
                  placeholderTextColor="#666"
                  value={webSearchQuery}
                  onChangeText={setWebSearchQuery}
                  style={{
                    borderWidth: 1,
                    borderColor: "rgba(0, 255, 65, 0.3)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "#fff",
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 12,
                    fontSize: 16
                  }}
                />
                <TouchableOpacity
                  onPress={searchWeb}
                  disabled={searching}
                  style={{
                    backgroundColor: "#00ff41",
                    padding: 14,
                    borderRadius: 12,
                    shadowColor: "#00ff41",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8
                  }}
                >
                  <Text style={{ color: "#000", fontWeight: "700", textAlign: "center", fontSize: 16 }}>
                    {searching ? "Searching..." : "Search Web"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {selectedResult ? (
            <ScrollView style={{ flex: 1, backgroundColor: "#0a0a0a", padding: 20 }}>
              {selectedResult.image_url && !imageErrors.has(selectedResult.image_url) && (
                <Image
                  source={{ uri: selectedResult.image_url }}
                  style={{ width: "100%", height: 200, borderRadius: 12, marginBottom: 16, backgroundColor: "#000" }}
                  resizeMode="cover"
                  onError={() => setImageErrors(prev => new Set(prev).add(selectedResult.image_url!))}
                />
              )}
              <Text style={{ fontSize: 24, fontWeight: "900", marginBottom: 12, color: "#fff" }}>{selectedResult.title}</Text>
              <Text style={{ fontSize: 14, color: "#999", marginBottom: 20, lineHeight: 22 }}>{selectedResult.description}</Text>

              <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 12, color: "#00ff41", letterSpacing: 1 }}>ENTER DETAILS:</Text>

              <TextInput
                placeholder="Price (e.g., 49.99)"
                placeholderTextColor="#666"
                value={equipmentPrice}
                onChangeText={setEquipmentPrice}
                keyboardType="decimal-pad"
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(0, 255, 65, 0.3)",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "#fff",
                  padding: 14,
                  borderRadius: 12,
                  marginBottom: 12,
                  fontSize: 16
                }}
              />

              <TextInput
                placeholder="Rating (optional, e.g., 4.5)"
                placeholderTextColor="#666"
                value={equipmentRating}
                onChangeText={setEquipmentRating}
                keyboardType="decimal-pad"
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(0, 255, 65, 0.3)",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "#fff",
                  padding: 14,
                  borderRadius: 12,
                  marginBottom: 30,
                  fontSize: 16
                }}
              />

              <TouchableOpacity
                onPress={addEquipment}
                style={{
                  backgroundColor: "#00ff41",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 12,
                  shadowColor: "#00ff41",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8
                }}
              >
                <Text style={{ color: "#000", fontWeight: "800", textAlign: "center", fontSize: 16 }}>
                  Add This Equipment
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedResult(null)}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(0, 255, 65, 0.3)"
                }}
              >
                <Text style={{ color: "#00ff41", fontWeight: "700", textAlign: "center", fontSize: 16 }}>
                  Back to Results
                </Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item, index) => `${item.link}-${index}`}
              style={{ flex: 1, backgroundColor: "#0a0a0a" }}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedResult(item)}
                  style={{
                    padding: 16,
                    marginBottom: 12,
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "rgba(0, 255, 65, 0.15)",
                    flexDirection: "row"
                  }}
                >
                  {item.image_url && !imageErrors.has(item.image_url) && (
                    <Image
                      source={{ uri: item.image_url }}
                      style={{ width: 80, height: 80, borderRadius: 8, marginRight: 12, backgroundColor: "#000" }}
                      resizeMode="cover"
                      onError={() => setImageErrors(prev => new Set(prev).add(item.image_url!))}
                    />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: "800", marginBottom: 6, color: "#fff" }}>{item.title}</Text>
                    <Text style={{ fontSize: 13, color: "#999", marginBottom: 6, lineHeight: 18 }}>
                      {item.description.substring(0, 80)}...
                    </Text>
                    <Text style={{ fontSize: 12, color: "#00ff41", fontWeight: "600" }}>{item.display_link}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={{ padding: 40, alignItems: "center" }}>
                  <MaterialCommunityIcons name="baseball-bat" size={60} color="rgba(0, 255, 65, 0.2)" />
                  <Text style={{ fontSize: 16, color: "#666", marginTop: 16 }}>
                    {searching ? "Searching the web..." : "Search for equipment to get started"}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </Modal>
    </View>
  );
}
