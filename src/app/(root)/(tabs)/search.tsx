import FilterModal from "@/src/components/filter-modal";
import PropertyCard from "@/src/components/property-card";
import { supabase } from "@/src/lib/supabase";
import { formatPrice } from "@/src/lib/utils";
import { useFilterStore } from "@/src/store/filterStore";
import { Property } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function Search() {
  const [results, setResults] = useState<Property[]>([]);
  console.log("🚀 ~ Search ~ results:", results);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const insets = useSafeAreaInsets();
  const listBottomPadding = Platform.OS === "ios" ? insets.bottom + 100 : 24;

  const { openFilters } = useLocalSearchParams<{ openFilters?: string }>();

  useEffect(() => {
    if (openFilters === "true") {
      setShowFilters(true);
    }
  }, [openFilters]);

  const search = useFilterStore((state) => state.search);
  const setSearch = useFilterStore((state) => state.setSearch);
  const type = useFilterStore((state) => state.type);
  const setType = useFilterStore((state) => state.setType);
  const minPrice = useFilterStore((state) => state.minPrice);
  const setMinPrice = useFilterStore((state) => state.setMinPrice);
  const maxPrice = useFilterStore((state) => state.maxPrice);
  const setMaxPrice = useFilterStore((state) => state.setMaxPrice);
  const bedrooms = useFilterStore((state) => state.bedrooms);
  const setBedrooms = useFilterStore((state) => state.setBedrooms);

  const resetFilters = useFilterStore((state) => state.resetFilters);

  const activeFiltersCount = [
    type ? 1 : 0,
    minPrice ? 1 : 0,
    maxPrice ? 1 : 0,
    bedrooms ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const fetchResults = async () => {
    setIsLoading(true);
    let query = supabase.from("properties").select("*");

    if (search) {
      query = query.or(`title.ilike.%${search}%,city.ilike.%${search}%`);
    }
    if (type) {
      query = query.eq("type", type);
    }
    if (minPrice) {
      query = query.gte("price", minPrice);
    }
    if (maxPrice) {
      query = query.lte("price", maxPrice);
    }
    if (bedrooms) {
      query = query.eq("bedrooms", bedrooms);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    setResults(data || []);
    setIsLoading(false);
  };
  useEffect(() => {
    fetchResults();
  }, [search, type, minPrice, maxPrice, bedrooms]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-3">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          Find Property
        </Text>

        <View className="flex-row items-center gap-3">
          <View
            className="flex-row items-center bg-white rounded-2xl px-4 py-1 gap-2 flex-1"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Ionicons name="search-outline" size={18} color="#888" />
            <TextInput
              placeholder="Search properties..."
              className="py-3 text-gray-800"
              placeholderTextColor="#888"
              value={search}
              onChangeText={(text) => setSearch(text)}
            />

            {search.length > 0 && (
              <Ionicons
                name="close-circle"
                size={18}
                color="#888"
                onPress={() => setSearch("")}
              />
            )}
          </View>

          {/* Filter button */}
          <TouchableOpacity
            className={`w-12 h-12 rounded-2xl items-center justify-center ${activeFiltersCount > 0 ? "bg-primary" : "bg-white"}`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons
              name="options-outline"
              size={18}
              color={activeFiltersCount > 0 ? "#fff" : "#888"}
            />
            {activeFiltersCount > 0 && (
              <View className="absolute -top-1 -inset-e-1 bg-red-500 w-5 h-5 rounded-full items-center justify-center">
                <Text className="text-xs text-white font-bold">
                  {activeFiltersCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Filter chips */}
        {activeFiltersCount > 0 && (
          <View className="flex-row items-center gap-2 mt-3">
            <Text className="text-sm text-gray-600">
              {activeFiltersCount} active filter
              {activeFiltersCount > 1 ? "s" : ""}
            </Text>
            <TouchableOpacity onPress={resetFilters}>
              <Text className="text-sm text-primary">Clear</Text>
            </TouchableOpacity>
          </View>
        )}
        {activeFiltersCount > 0 && (
          <View className="flex-row items-center gap-2 mt-3">
            {type && (
              <View className="flex-row items-center bg-primary/10 rounded-full px-3 py-1">
                <Text className="text-sm text-primary">{type}</Text>
                <TouchableOpacity
                  onPress={() => setType(null)}
                  className="ms-1 p-1 rounded-full"
                >
                  <Ionicons name="close" size={12} color="#888" />
                </TouchableOpacity>
              </View>
            )}
            {(minPrice !== null || maxPrice !== null) && (
              <View className="flex-row items-center bg-primary/10 rounded-full px-3 py-1">
                <Ionicons
                  name="pricetag-outline"
                  size={14}
                  color="#888"
                  className="me-1"
                />
                <Text className="text-sm text-primary">
                  {minPrice !== null && maxPrice !== null
                    ? formatPrice(minPrice) + " - " + formatPrice(maxPrice)
                    : minPrice !== null
                      ? "From " + formatPrice(minPrice)
                      : maxPrice !== null && `Up to ${formatPrice(maxPrice)}`}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setMinPrice(null);
                    setMaxPrice(null);
                  }}
                  className="ms-1 p-1 rounded-full"
                >
                  <Ionicons name="close" size={12} color="#888" />
                </TouchableOpacity>
              </View>
            )}

            {!!bedrooms && (
              <View className="flex-row items-center bg-primary/10 rounded-full px-3 py-1">
                <Ionicons
                  name="bed-outline"
                  size={14}
                  color="#888"
                  className="me-1"
                />
                <Text className="text-sm text-primary">{bedrooms} Bed</Text>
                <TouchableOpacity
                  onPress={() => setBedrooms(0)}
                  className="ms-1 p-1 rounded-full"
                >
                  <Ionicons name="close" size={12} color="#888" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 0 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Text className="text-lg font-bold ms-5 mb-2">
              {isLoading ? "Searching..." : `${results.length} results found`}
            </Text>
            {isLoading && (
              <View className="mt-8 items-center justify-center">
                <ActivityIndicator
                  className="ms-2"
                  size="small"
                  color="#888"
                  animating={isLoading}
                />
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => {
          return <PropertyCard property={item} />;
        }}
        ListFooterComponent={<View style={{ height: listBottomPadding }} />}
        ListEmptyComponent={
          !isLoading ? (
            <View className="flex-1 items-center justify-center mt-9">
              <Text className="text-gray-500 mb-4">No properties found.</Text>
              <Text className="text-gray-500">
                Try adjusting your search or filters.
              </Text>
            </View>
          ) : null
        }
      />

      {/* Filter modal  */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </SafeAreaView>
  );
}
