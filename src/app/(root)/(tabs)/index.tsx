import FeaturedCard from "@/src/components/featured-card";
import PropertyCard from "@/src/components/property-card";
import { supabase } from "@/src/lib/supabase";
import { Property } from "@/src/types";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();

  const [featured, setFeatured] = useState<Property[]>([]);
  console.log("🚀 ~ HomeScreen ~ featured:", featured);
  const [recommended, setRecommended] = useState<Property[]>([]);
  console.log("🚀 ~ HomeScreen ~ recommended:", recommended);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const { data: featuredData, error: featuredError } = await supabase
        .from("properties")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false });

      if (featuredError) {
        console.error("Error fetching featured properties:", featuredError);
      } else {
        setFeatured(featuredData);
      }

      const { data: recommendedData, error: recommendedError } = await supabase
        .from("properties")
        .select("*")
        .eq("is_featured", false)
        .order("created_at", { ascending: false });

      if (recommendedError) {
        console.error(
          "Error fetching recommended properties:",
          recommendedError,
        );
      } else {
        setRecommended(recommendedData);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchProperties();
  // }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProperties();
    }, []),
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <FlatList
        data={recommended}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 0 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-5">
              <Image
                source={require("@/assets/images/logo.png")}
                style={{ width: 90, height: 36 }}
                resizeMode="contain"
              />

              <View className="items-end">
                <Text className="text-sm text-gray-500">
                  Welcome back, {user?.firstName || "User"}!
                </Text>
              </View>
            </View>

            {/* Search Bar */}
            <TouchableOpacity
              onPress={() => router.push("/(root)/(tabs)/search")}
              className="flex-row mx-5 mb-6 items-center bg-white rounded-2xl px-3 py-2 gap-2"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Ionicons name="search-outline" size={20} color="#888" />
              <View className="flex-row items-center bg-white rounded-lg py-2 me-5">
                <Text className="text-gray-500">Search properties...</Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  router.push("/(root)/(tabs)/search?openFilters=true")
                }
                className="ms-auto p-2 bg-primary rounded-xl"
              >
                <Ionicons name="options" size={18} color="white" />
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Featured Properties */}
            <View className="mb-6 ps-5">
              <Text className="text-lg font-bold mb-5">
                Featured Properties
              </Text>
              {isLoading ? (
                <ActivityIndicator
                  size="small"
                  color="var(--color-primary)"
                  className="py-10"
                />
              ) : (
                <FlatList
                  data={featured}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => <FeaturedCard property={item} />}
                />
              )}
            </View>

            {/* Recommended header */}
            <Text className="text-lg font-bold ms-5 mb-2">
              Recommended for you
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          return <PropertyCard property={item} showSave />;
        }}
        ListEmptyComponent={
          !isLoading ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-500">No properties found.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
