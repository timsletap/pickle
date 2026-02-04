import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Dimensions, FlatList, Image, LayoutAnimation, Linking, Modal, Platform, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, UIManager, View } from "react-native";
import { API_BASE_URL } from "../../config/api";

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Drill {
  id: number;
  title: string;
  description: string;
  skill_focus: string;
  video_url: string;
  created_at: string;
  created_by: number;
}

interface YouTubeVideo {
  video_id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel_title: string;
}

export default function DrillsList() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [skillFilter, setSkillFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [youtubeSearchQuery, setYoutubeSearchQuery] = useState("");
  const [youtubeResults, setYoutubeResults] = useState<YouTubeVideo[]>([]);
  const [searchingYoutube, setSearchingYoutube] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [drillSkillFocus, setDrillSkillFocus] = useState("");
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const userId = 1;
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetchDrills();
    fetchFavorites();

    // Cleanup abort controller on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [skillFilter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchDrills(), fetchFavorites()]);
    setRefreshing(false);
  }, [skillFilter]);

  const fetchDrills = async () => {
    try {
      setLoading(true);
      const url = skillFilter
        ? `${API_BASE_URL}/api/drills?skill_focus=${encodeURIComponent(skillFilter)}`
        : `${API_BASE_URL}/api/drills`;

      const response = await fetch(url, {
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDrills(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching drills:", error);
      alert("Failed to load drills. Please check your connection and try again.");
      setDrills([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/drills/favorites?user_id=${userId}`, {
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const ids = Array.isArray(data) ? data.map((d: any) => d.id).filter(id => id != null) : [];
      setFavorites(new Set(ids));
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const toggleFavorite = async (drillId: any) => {
    if (!drillId) {
      alert("Invalid drill");
      return;
    }

    const isFavorited = favorites.has(drillId);

    // Optimistically update UI
    if (isFavorited) {
      setFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(drillId);
        return newSet;
      });
    } else {
      setFavorites(prev => new Set(prev).add(drillId));
    }

    try {
      if (isFavorited) {
        const response = await fetch(`${API_BASE_URL}/api/drills/${drillId}/favorite?user_id=${userId}`, {
          method: "DELETE",
          signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } else {
        const response = await fetch(
          `${API_BASE_URL}/api/drills/${drillId}/favorite`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId }),
            signal: AbortSignal.timeout(10000)
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Revert optimistic update on error
      if (isFavorited) {
        setFavorites(prev => new Set(prev).add(drillId));
      } else {
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(drillId);
          return newSet;
        });
      }
      alert("Failed to update favorite. Please try again.");
    }
  };

  const searchYoutube = async () => {
    if (!youtubeSearchQuery.trim()) {
      alert("Please enter a search query");
      return;
    }

    try {
      setSearchingYoutube(true);
      setYoutubeResults([]);
      const response = await fetch(
        `${API_BASE_URL}/api/drills/search/youtube?query=${encodeURIComponent(youtubeSearchQuery)}`,
        {
          signal: AbortSignal.timeout(15000)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const results = Array.isArray(data) ? data : [];

      if (results.length === 0) {
        alert("No videos found. Try a different search term.");
      }

      setYoutubeResults(results);
    } catch (error) {
      console.error("Error searching YouTube:", error);
      if (error instanceof Error && error.message.includes("configured")) {
        alert("YouTube API not configured. Please check your API key.");
      } else if (error instanceof Error && error.name === "TimeoutError") {
        alert("Search request timed out. Please try again.");
      } else {
        alert("Error searching YouTube. Make sure the backend is running and try again.");
      }
      setYoutubeResults([]);
    } finally {
      setSearchingYoutube(false);
    }
  };

  const createDrillFromVideo = async () => {
    if (!selectedVideo) {
      alert("No video selected");
      return;
    }

    if (!drillSkillFocus) {
      alert("Please select a skill focus");
      return;
    }

    if (!selectedVideo.video_id) {
      alert("Invalid video data");
      return;
    }

    const validSkills = ["hitting", "fielding", "pitching", "baserunning"];
    if (!validSkills.includes(drillSkillFocus)) {
      alert("Invalid skill focus");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/drills/create-from-youtube`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_id: selectedVideo.video_id,
          title: selectedVideo.title?.substring(0, 255) || "Untitled Drill",
          description: selectedVideo.description?.substring(0, 1000) || "",
          skill_focus: drillSkillFocus,
          user_id: userId
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSearchModalVisible(false);
      setSelectedVideo(null);
      setYoutubeResults([]);
      setYoutubeSearchQuery("");
      setDrillSkillFocus("");
      fetchDrills();
      alert("Drill created successfully!");
    } catch (error) {
      console.error("Error creating drill:", error);
      alert("Failed to create drill. Please try again.");
    }
  };

  const openVideoURL = async (url: string) => {
    if (!url) {
      alert("No video URL available.");
      return;
    }

    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      // On web, open YouTube directly in new tab for better experience
      if (Platform.OS === 'web') {
        window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
      } else {
        // Open in-app video player for mobile
        setCurrentVideoUrl(`https://www.youtube.com/embed/${videoId}`);
        setVideoModalVisible(true);
      }
    } else {
      // Fallback to external browser
      try {
        if (Platform.OS === 'web') {
          window.open(url, '_blank');
        } else {
          const supported = await Linking.canOpenURL(url);
          if (supported) {
            await Linking.openURL(url);
          } else {
            alert("Unable to open this video.");
          }
        }
      } catch (error) {
        console.error("Error opening video:", error);
        alert("Failed to open video. Please try again.");
      }
    }
  };

  const getYouTubeVideoId = (url: string) => {
    if (!url || typeof url !== 'string') return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  const performDeleteDrill = async (drillId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/drills/${drillId}`, {
        method: "DELETE",
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Animate the removal
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      // Remove from local state
      setDrills(prev => prev.filter(d => d.id !== drillId));
      setFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(drillId);
        return newSet;
      });
      alert("Drill deleted successfully!");
    } catch (error) {
      console.error("Error deleting drill:", error);
      alert("Failed to delete drill. Please try again.");
    }
  };

  const deleteDrill = async (drillId: number, drillTitle: string) => {
    // Use window.confirm for web, Alert.alert for mobile
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to delete "${drillTitle}"?`);
      if (confirmed) {
        await performDeleteDrill(drillId);
      }
    } else {
      Alert.alert(
        "Delete Drill",
        `Are you sure you want to delete "${drillTitle}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => performDeleteDrill(drillId)
          }
        ]
      );
    }
  };

  const filteredDrills = showFavoritesOnly ? drills.filter((d: any) => favorites.has(d.id)) : drills;

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
      <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(0, 168, 120, 0.1)" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
          <View>
            <Text style={{ fontSize: 14, color: "#00a878", fontWeight: "600", letterSpacing: 1, marginBottom: 4 }}>TRAINING</Text>
            <Text style={{ fontSize: 28, fontWeight: "900", color: "#fff" }}>Drills</Text>
          </View>
          <TouchableOpacity
            onPress={() => setSearchModalVisible(true)}
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
            <MaterialCommunityIcons name="youtube" size={20} color="#000" />
            <Text style={{ color: "#000", fontWeight: "700", marginLeft: 6 }}>Add Drill</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
          <TouchableOpacity
            onPress={() => setSkillFilter("")}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 18,
              marginHorizontal: 4,
              backgroundColor: skillFilter === "" ? "#00a878" : "rgba(0, 168, 120, 0.1)",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: skillFilter === "" ? "#00a878" : "rgba(0, 168, 120, 0.3)"
            }}
          >
            <Text style={{ color: skillFilter === "" ? "#000" : "#00a878", fontWeight: "700", fontSize: 13 }}>ALL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSkillFilter(skillFilter === "hitting" ? "" : "hitting")}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 18,
              marginHorizontal: 4,
              backgroundColor: skillFilter === "hitting" ? "#00a878" : "rgba(0, 168, 120, 0.1)",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: skillFilter === "hitting" ? "#00a878" : "rgba(0, 168, 120, 0.3)"
            }}
          >
            <Text style={{ color: skillFilter === "hitting" ? "#000" : "#00a878", fontWeight: "700", fontSize: 13 }}>HITTING</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSkillFilter(skillFilter === "fielding" ? "" : "fielding")}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 18,
              marginHorizontal: 4,
              backgroundColor: skillFilter === "fielding" ? "#00a878" : "rgba(0, 168, 120, 0.1)",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: skillFilter === "fielding" ? "#00a878" : "rgba(0, 168, 120, 0.3)"
            }}
          >
            <Text style={{ color: skillFilter === "fielding" ? "#000" : "#00a878", fontWeight: "700", fontSize: 13 }}>FIELDING</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSkillFilter(skillFilter === "pitching" ? "" : "pitching")}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 18,
              marginHorizontal: 4,
              backgroundColor: skillFilter === "pitching" ? "#00a878" : "rgba(0, 168, 120, 0.1)",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: skillFilter === "pitching" ? "#00a878" : "rgba(0, 168, 120, 0.3)"
            }}
          >
            <Text style={{ color: skillFilter === "pitching" ? "#000" : "#00a878", fontWeight: "700", fontSize: 13 }}>PITCHING</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSkillFilter(skillFilter === "baserunning" ? "" : "baserunning")}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 18,
              marginHorizontal: 4,
              backgroundColor: skillFilter === "baserunning" ? "#00a878" : "rgba(0, 168, 120, 0.1)",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: skillFilter === "baserunning" ? "#00a878" : "rgba(0, 168, 120, 0.3)"
            }}
          >
            <Text style={{ color: skillFilter === "baserunning" ? "#000" : "#00a878", fontWeight: "700", fontSize: 13 }}>BASERUNNING</Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 18,
            marginTop: 12,
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

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0a0a0a" }}>
          <MaterialCommunityIcons name="loading" size={40} color="#00a878" />
          <Text style={{ color: "#00a878", marginTop: 12, fontSize: 16, fontWeight: "600" }}>Loading drills...</Text>
        </View>
      ) : filteredDrills.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <MaterialCommunityIcons name="run" size={60} color="rgba(0, 168, 120, 0.2)" />
          <Text style={{ fontSize: 18, color: "#666", marginTop: 16, textAlign: "center" }}>
            {showFavoritesOnly ? "No favorite drills yet" : "No drills yet"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredDrills}
          keyExtractor={(item: { id: { toString: () => any; }; }) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00a878"
              colors={["#00a878"]}
            />
          }
          renderItem={({ item }: { item: any }) => {
            const videoId = getYouTubeVideoId(item.video_url);
            const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

            return (
              <View style={{
                marginBottom: 16,
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
                {thumbnailUrl && !imageErrors.has(thumbnailUrl) && (
                  <TouchableOpacity
                    onPress={() => openVideoURL(item.video_url)}
                    style={{ position: "relative" }}
                  >
                    <Image
                      source={{ uri: thumbnailUrl }}
                      style={{ width: "100%", height: 200, backgroundColor: "#000" }}
                      resizeMode="cover"
                      onError={() => setImageErrors(prev => new Set(prev).add(thumbnailUrl))}
                    />
                    <View style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "rgba(0, 0, 0, 0.3)"
                    }}>
                      <View style={{
                        backgroundColor: "rgba(255, 0, 0, 0.9)",
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        justifyContent: "center",
                        alignItems: "center",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.5,
                        shadowRadius: 4
                      }}>
                        <MaterialCommunityIcons name="play" size={32} color="#fff" style={{ marginLeft: 4 }} />
                      </View>
                    </View>
                    <View style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                      flexDirection: "row",
                      alignItems: "center"
                    }}>
                      <MaterialCommunityIcons name="youtube" size={16} color="#FF0000" />
                      <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600", marginLeft: 4 }}>VIDEO</Text>
                    </View>
                  </TouchableOpacity>
                )}

                <View style={{ padding: 18 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={{ fontSize: 18, fontWeight: "800", marginBottom: 6, color: "#fff" }}>{item.title}</Text>
                      <Text style={{ fontSize: 14, color: "#999", marginBottom: 10, lineHeight: 20 }}>{item.description}</Text>
                      <View style={{
                        backgroundColor: "rgba(0, 168, 120, 0.1)",
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        alignSelf: "flex-start",
                        borderWidth: 1,
                        borderColor: "rgba(0, 168, 120, 0.3)"
                      }}>
                        <Text style={{ fontSize: 11, color: "#00a878", fontWeight: "700", letterSpacing: 1 }}>
                          {item.skill_focus?.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: "column", alignItems: "center" }}>
                      <TouchableOpacity
                        onPress={() => toggleFavorite(item.id)}
                        style={{
                          backgroundColor: favorites.has(item.id) ? "rgba(255, 193, 7, 0.2)" : "rgba(255, 193, 7, 0.1)",
                          padding: 10,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: favorites.has(item.id) ? "rgba(255, 193, 7, 0.5)" : "rgba(255, 193, 7, 0.3)",
                          marginBottom: 8
                        }}
                      >
                        <Text style={{ fontSize: 22, color: "#FFC107" }}>{favorites.has(item.id) ? "★" : "☆"}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => deleteDrill(item.id, item.title)}
                        style={{
                          backgroundColor: "rgba(255, 59, 48, 0.1)",
                          padding: 10,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: "rgba(255, 59, 48, 0.3)"
                        }}
                      >
                        <MaterialCommunityIcons name="trash-can-outline" size={22} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {item.video_url && (
                    <TouchableOpacity
                      onPress={() => openVideoURL(item.video_url)}
                      style={{
                        backgroundColor: "#FF0000",
                        padding: 14,
                        borderRadius: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        shadowColor: "#FF0000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 6
                      }}
                    >
                      <MaterialCommunityIcons name="youtube" size={20} color="#fff" />
                      <Text style={{ color: "#fff", fontWeight: "800", marginLeft: 8, fontSize: 15 }}>Watch on YouTube</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}

      <Modal visible={searchModalVisible} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <View style={{
            padding: 20,
            paddingTop: 60,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(0, 168, 120, 0.2)",
            backgroundColor: "#0a0a0a"
          }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text style={{ fontSize: 14, color: "#00a878", fontWeight: "600", letterSpacing: 1, marginBottom: 4 }}>YOUTUBE</Text>
                <Text style={{ fontSize: 28, fontWeight: "900", color: "#fff" }}>Search Drills</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setSearchModalVisible(false);
                  setYoutubeResults([]);
                  setSelectedVideo(null);
                  setYoutubeSearchQuery("");
                }}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  padding: 10,
                  borderRadius: 12
                }}
              >
                <MaterialCommunityIcons name="close" size={28} color="#00a878" />
              </TouchableOpacity>
            </View>

            {!selectedVideo && (
              <View style={{ marginTop: 15 }}>
                <TextInput
                  placeholder="Search for drills (e.g., 'hitting tee work')"
                  placeholderTextColor="#666"
                  value={youtubeSearchQuery}
                  onChangeText={setYoutubeSearchQuery}
                  style={{
                    borderWidth: 1,
                    borderColor: "rgba(0, 168, 120, 0.3)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "#fff",
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 12,
                    fontSize: 16
                  }}
                />
                <TouchableOpacity
                  onPress={searchYoutube}
                  disabled={searchingYoutube}
                  style={{
                    backgroundColor: "#00a878",
                    padding: 14,
                    borderRadius: 12,
                    shadowColor: "#00a878",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8
                  }}
                >
                  <Text style={{ color: "#000", fontWeight: "700", textAlign: "center", fontSize: 16 }}>
                    {searchingYoutube ? "Searching..." : "Search YouTube"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {selectedVideo ? (
            <ScrollView style={{ flex: 1, backgroundColor: "#0a0a0a", padding: 20 }}>
              {selectedVideo.thumbnail && !imageErrors.has(selectedVideo.thumbnail) && (
                <View style={{ position: "relative", marginBottom: 16 }}>
                  <Image
                    source={{ uri: selectedVideo.thumbnail }}
                    style={{ width: "100%", height: 200, borderRadius: 12, backgroundColor: "#000" }}
                    resizeMode="cover"
                    onError={() => setImageErrors(prev => new Set(prev).add(selectedVideo.thumbnail))}
                  />
                <View style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 12
                }}>
                  <View style={{
                    backgroundColor: "rgba(255, 0, 0, 0.9)",
                    width: 70,
                    height: 70,
                    borderRadius: 35,
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.5,
                    shadowRadius: 8
                  }}>
                    <MaterialCommunityIcons name="youtube" size={40} color="#fff" />
                  </View>
                </View>
                </View>
              )}

              <Text style={{ fontSize: 24, fontWeight: "900", marginBottom: 12, color: "#fff" }}>{selectedVideo.title || "Untitled Video"}</Text>
              <Text style={{ fontSize: 14, color: "#999", marginBottom: 20, lineHeight: 22 }}>
                {selectedVideo.description ? selectedVideo.description.substring(0, 200) + "..." : "No description available"}
              </Text>

              <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 12, color: "#00a878", letterSpacing: 1 }}>SELECT SKILL FOCUS:</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 30 }}>
                {["hitting", "fielding", "pitching", "baserunning"].map((skill) => (
                  <TouchableOpacity
                    key={skill}
                    onPress={() => setDrillSkillFocus(skill)}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 22,
                      marginRight: 10,
                      marginBottom: 10,
                      backgroundColor: drillSkillFocus === skill ? "#00a878" : "rgba(0, 168, 120, 0.1)",
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: drillSkillFocus === skill ? "#00a878" : "rgba(0, 168, 120, 0.3)"
                    }}
                  >
                    <Text style={{
                      color: drillSkillFocus === skill ? "#000" : "#00a878",
                      textTransform: "uppercase",
                      fontWeight: "700",
                      fontSize: 13
                    }}>
                      {skill}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={createDrillFromVideo}
                style={{
                  backgroundColor: "#00a878",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 12,
                  shadowColor: "#00a878",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8
                }}
              >
                <Text style={{ color: "#000", fontWeight: "800", textAlign: "center", fontSize: 16 }}>
                  Add This Drill
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedVideo(null)}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(0, 168, 120, 0.3)"
                }}
              >
                <Text style={{ color: "#00a878", fontWeight: "700", textAlign: "center", fontSize: 16 }}>
                  Back to Results
                </Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <FlatList
              data={youtubeResults}
              keyExtractor={(item) => item.video_id}
              style={{ flex: 1, backgroundColor: "#0a0a0a" }}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedVideo(item)}
                  style={{
                    marginBottom: 12,
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "rgba(0, 168, 120, 0.15)",
                    overflow: "hidden"
                  }}
                >
                  {item.thumbnail && !imageErrors.has(item.thumbnail) && (
                    <View style={{ position: "relative" }}>
                      <Image
                        source={{ uri: item.thumbnail }}
                        style={{ width: "100%", height: 180, backgroundColor: "#000" }}
                        resizeMode="cover"
                        onError={() => setImageErrors(prev => new Set(prev).add(item.thumbnail))}
                      />
                    <View style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "rgba(0, 0, 0, 0.2)"
                    }}>
                      <View style={{
                        backgroundColor: "rgba(255, 0, 0, 0.9)",
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        justifyContent: "center",
                        alignItems: "center"
                      }}>
                        <MaterialCommunityIcons name="play" size={28} color="#fff" style={{ marginLeft: 3 }} />
                      </View>
                    </View>
                    <View style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      paddingHorizontal: 6,
                      paddingVertical: 3,
                      borderRadius: 4,
                      flexDirection: "row",
                      alignItems: "center"
                    }}>
                      <MaterialCommunityIcons name="youtube" size={14} color="#FF0000" />
                    </View>
                    </View>
                  )}
                  <View style={{ padding: 14 }}>
                    <Text style={{ fontSize: 15, fontWeight: "800", marginBottom: 6, color: "#fff", lineHeight: 20 }}>
                      {item.title || "Untitled Video"}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#999", marginBottom: 6, lineHeight: 16 }} numberOfLines={2}>
                      {item.description ? item.description.substring(0, 120) + "..." : "No description"}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <MaterialCommunityIcons name="account-circle" size={14} color="#00a878" />
                      <Text style={{ fontSize: 11, color: "#00a878", fontWeight: "600", marginLeft: 4 }}>
                        {item.channel_title || "Unknown Channel"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={{ padding: 40, alignItems: "center" }}>
                  <MaterialCommunityIcons name="youtube" size={60} color="rgba(0, 168, 120, 0.2)" />
                  <Text style={{ fontSize: 16, color: "#666", marginTop: 16 }}>
                    {searchingYoutube ? "Searching YouTube..." : "Search for drills to get started"}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </Modal>

      {/* In-App Video Player Modal */}
      <Modal
        visible={videoModalVisible}
        animationType="slide"
        onRequestClose={() => {
          setVideoModalVisible(false);
          setCurrentVideoUrl(null);
        }}
      >
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 16,
            backgroundColor: "#0a0a0a",
            borderBottomWidth: 1,
            borderBottomColor: "rgba(0, 168, 120, 0.2)"
          }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#fff" }}>Drill Video</Text>
            <TouchableOpacity
              onPress={() => {
                setVideoModalVisible(false);
                setCurrentVideoUrl(null);
              }}
              style={{
                backgroundColor: "rgba(0, 168, 120, 0.1)",
                padding: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "rgba(0, 168, 120, 0.3)"
              }}
            >
              <MaterialCommunityIcons name="close" size={24} color="#00a878" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
            {currentVideoUrl && Platform.OS === 'web' ? (
              <iframe
                src={currentVideoUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : currentVideoUrl ? (
              <View style={{
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').width * (9/16),
                backgroundColor: '#000',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <TouchableOpacity
                  onPress={() => Linking.openURL(currentVideoUrl.replace('/embed/', '/watch?v='))}
                  style={{
                    backgroundColor: 'rgba(255, 0, 0, 0.9)',
                    padding: 20,
                    borderRadius: 50,
                    alignItems: 'center'
                  }}
                >
                  <MaterialCommunityIcons name="youtube" size={48} color="#fff" />
                  <Text style={{ color: '#fff', marginTop: 8, fontWeight: '700' }}>Open in YouTube</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}