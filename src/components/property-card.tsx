import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSaveProperty } from "../hooks/useSaveProperty";
import { formatPrice } from "../lib/utils";
import { Property } from "../types";

export default function PropertyCard({
  property,
  onUnsave,
  showSave = false,
}: {
  property: Property;
  onUnsave?: () => void;
  showSave?: boolean;
}) {
  const router = useRouter();

  const { isSaved, isLoadingSave, toggleSave } = useSaveProperty(
    property.id,
    onUnsave,
  );
  return (
    <TouchableOpacity
      onPress={() => router.push(`/(root)/property/${property.id}`)}
      className="flex-row mx-5 mb-3 bg-white p-0 rounded-xl overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 4,
        opacity: property.is_sold ? 0.6 : 1,
      }}
    >
      <Image
        source={{ uri: property.images[0] }}
        className="w-32 h-32"
        resizeMode="cover"
      />

      {/* sold badge */}
      {property.is_sold && (
        <View className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded-full">
          <Text className="text-xs text-white font-semibold">Sold</Text>
        </View>
      )}

      {/* Side content */}
      <View className="flex-1 justify-between">
        <View className="flex-row justify-between gap-3 p-3">
          <View className="flex-1">
            <Text className="text-sm text-gray-500">{property.city}</Text>
            <Text className="text-lg font-semibold">{property.title}</Text>
          </View>

          {/* save button */}
          {showSave && (
            <TouchableOpacity
              onPress={() => toggleSave(property.id)}
              disabled={isLoadingSave}
              className="bg-white p-2 rounded-full ms-auto"
            >
              <Ionicons
                name={isSaved ? "heart" : "heart-outline"}
                size={20}
                color={isSaved ? "#EF4444" : "#888"}
              />
            </TouchableOpacity>
          )}
        </View>
        {/* Price bedrooms and bathrooms */}
        <View className="flex-row justify-between items-center gap-3 px-3 mb-3 mt-2">
          <Text className="text-primary font-bold">
            {formatPrice(property.price)}
          </Text>

          <View className="flex-row items-center gap-2">
            {/* bedrooms */}
            <View className="flex-row items-center mt-2">
              <Ionicons name="bed-outline" size={16} color="#888" />
              <Text className="text-sm text-gray-500 ms-1">
                {property.bedrooms}
              </Text>
            </View>

            {/* bathrooms */}
            <View className="flex-row items-center mt-2">
              <Ionicons name="water-outline" size={16} color="#888" />
              <Text className="text-sm text-gray-500 ms-1">
                {property.bathrooms}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
