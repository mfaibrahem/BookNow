import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { formatPrice } from "../lib/utils";
import { Property } from "../types";

export default function FeaturedCard({ property }: { property: Property }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push(`/(root)/property/${property.id}`)}
      className="me-4 w-64 bg-white relative rounded-xl overflow-hidden"
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
        style={{ width: "100%", height: 120 }}
        resizeMode="cover"
      />
      <View className="absolute top-2 inset-s-2 bg-primary px-2 py-1 rounded-full">
        <Text className="text-xs text-white font-semibold">
          {property.type}
        </Text>
      </View>

      {/* sold badge */}
      {property.is_sold && (
        <View className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded-full">
          <Text className="text-xs text-white font-semibold">Sold</Text>
        </View>
      )}

      <View className="p-3">
        <Text className="text-sm text-gray-500">{property.city}</Text>
        <Text className="text-lg font-semibold">{property.title}</Text>

        <View className="flex-row justify-between items-center gap-3 mt-1">
          <Text className="text-primary font-bold">
            {formatPrice(property.price)}
          </Text>

          <View className="flex-row gap-2">
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
