import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function MapScreen() {
  const { latitude, longitude, title, address } = useLocalSearchParams<{
    latitude: string;
    longitude: string;
    title: string;
    address: string;
  }>();

  const router = useRouter();

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.001}%2C${lat - 0.001}%2C${lng + 0.001}%2C${lat + 0.001}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 justify-center items-center bg-gray-200 rounded-full"
        >
          <Ionicons name="arrow-back" size={20} color="#333" />
        </TouchableOpacity>

        <View className="flex-1 mx-3">
          <Text
            className="text-gray-900 font-semibold text-sm"
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text className="text-gray-400 text-xs" numberOfLines={1}>
            {address}
          </Text>
        </View>
        {/* go to google maps */}
        <TouchableOpacity
          className="flex-row items-center gap-1 bg-blue-50 px-3 py-2 rounded-full"
          onPress={() => {
            Linking.openURL(
              `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
            );
          }}
        >
          <Ionicons name="navigate-outline" size={14} color="#007AFF" />
          <Text className="text-primary text-sm text-center">
            Open in Google Maps
          </Text>
        </TouchableOpacity>
      </View>

      <View
        className=" overflow-hidden mb-6 mt-3 w-full h-full"
        style={{
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        <WebView
          source={{ uri: mapUrl }}
          style={{ flex: 1, width: "100%", height: "100%" }}
          // scrollEnabled={false}
          // pointerEvents="none"
        />
      </View>
    </SafeAreaView>
  );
}
