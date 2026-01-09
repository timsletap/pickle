import React, { useEffect, useState } from "react";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { FlatList, Linking, Text, TouchableOpacity, View } from "react-native";
import { API_BASE_URL } from "../../config/api";

interface Equipment {
  id: number;
  name: string;
  description: string;
  price: number;
  where_to_buy: string;
  link: string;
}

export default function EquipmentList() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/equipment`);
      const data = await response.json();
      setEquipment(data);
    } catch (error) {
      console.error("Error fetching equipment:", error);
    } finally {
      setLoading(false);
    }
  };

  const openLink = (url: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: "#e0e0e0" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Equipment Deals</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Loading...</Text>
        </View>
      ) : equipment.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 16, color: "#999" }}>No equipment deals available</Text>
        </View>
      ) : (
        <FlatList
          data={equipment}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: "#e0e0e0" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 5 }}>{item.name}</Text>
                  <Text style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>{item.description}</Text>
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: "#007AFF", marginBottom: 5 }}>
                    ${item.price}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#999" }}>{item.where_to_buy}</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => openLink(item.link)}
                  style={{ padding: 10 }}
                >
                  <MaterialCommunityIcons name="open-in-new" size={24} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}