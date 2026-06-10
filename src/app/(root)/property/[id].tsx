import { useSaveProperty } from "@/src/hooks/useSaveProperty";
import useSupabase from "@/src/hooks/useSupabase";
import { formatPrice } from "@/src/lib/utils";
import useUserStore from "@/src/store/userStore";
import { Property } from "@/src/types";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ImageView from "react-native-image-viewing";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function PropertyDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const { userId } = useAuth();
  const router = useRouter();
  const isAdmin = useUserStore((state) => state.isAdmin);

  const [property, setProperty] = useState<null | Property>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  const authSupabase = useSupabase();

  // const mapUrl = `https://www.google.com/maps/search/?api=1&query=${property?.latitude},${property?.longitude}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${property?.longitude! - 0.05}%2C${property?.latitude! - 0.05}%2C${property?.longitude! + 0.05}%2C${property?.latitude! + 0.05}&layer=mapnik&marker=${property?.latitude}%2C${property?.longitude}`;
  const fetchProperty = async () => {
    setIsLoading(true);
    const { data, error } = await authSupabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.log("Error fetching property:", error);
    } else {
      setProperty(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    const width = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(x / width);
    setActiveIndex(index);
  };

  const { toggleSave, isLoadingSave, isSaved } = useSaveProperty(id);

  const handleMarkSold = async () => {
    Alert.alert(
      "Mark as Sold",
      "Are you sure you want to mark this property as sold?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Mark as Sold",
          style: "destructive",
          onPress: async () => {
            const { error } = await authSupabase
              .from("properties")
              .update({ is_sold: true })
              .eq("id", property?.id);

            if (error) {
              console.log("Error marking as sold:", error);
            } else {
              fetchProperty();
            }
          },
        },
      ],
    );
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Property",
      "Are you sure you want to delete this property? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await authSupabase
              .from("properties")
              .delete()
              .eq("id", property?.id);

            if (error) {
              console.log("Error deleting property:", error);
            } else {
              router.back();
            }
          },
        },
      ],
    );
  };

  const isLongDescription =
    property?.description && property.description.length > 150;
  const displayDesc =
    expanded || !isLongDescription
      ? property?.description
      : property?.description.slice(0, 150) + "..." || "";

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!property) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg font-semibold">Property not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <View className={property.is_sold ? "opacity-50" : ""}>
            <FlatList
              data={property.images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, index) => index.toString()}
              onScroll={onScroll}
              scrollEventThrottle={16}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    onPress={() => setImageViewerVisible(true)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: item }}
                      // className="w-screen h-64"
                      style={{ width, height: 300 }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                );
              }}
            />
          </View>
          {/* Image count badge */}
          <View
            className="absolute bottom-3 inset-e-4 px-2 py-1 rounded-full"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <Text className="text-white text-sm">
              {activeIndex + 1}/{property.images.length}
            </Text>
          </View>

          <SafeAreaView
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            <View className="flex-row items-center justify-between pt-2 px-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 p-2 rounded-full bg-white/80 items-center justify-center"
                style={{
                  elevation: 3,
                }}
              >
                <Ionicons name="arrow-back" size={20} color="#333" />
              </TouchableOpacity>

              {/* Save button */}
              <TouchableOpacity
                onPress={() => toggleSave(property.id)}
                disabled={isLoadingSave}
                className="w-10 h-10 p-2 rounded-full bg-white/80 items-center justify-center"
                style={{
                  elevation: 3,
                }}
              >
                <Ionicons
                  name={isSaved ? "heart" : "heart-outline"}
                  color={isSaved ? "#e0245e" : "#333"}
                  size={20}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Details content */}
        <View
          className={`${property.is_sold ? "opacity-50" : ""} px-5 pt-4 pb-8`}
        >
          <View className="flex-row gap-2 mb-3 flex-wrap">
            {/* property type */}
            <View className="bg-gray-200 px-2 py-1 rounded-full">
              <Text className="text-sm text-gray-800">{property.type}</Text>
            </View>

            {/* Is Featured */}
            {property.is_featured && (
              <View className="bg-yellow-100 px-2 py-1 rounded-full">
                <Text className="text-sm text-yellow-600">Featured</Text>
              </View>
            )}

            {/* Is Sold */}
            {property.is_sold && (
              <View className="bg-red-100 px-2 py-1 rounded-full">
                <Text className="text-sm text-red-600">Sold</Text>
              </View>
            )}
          </View>

          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {property.title}
          </Text>
          <Text className="text-xl text-primary font-bold mb-4">
            {formatPrice(property.price)}
          </Text>

          <View className="flex-row items-center gap-6 mt-4 justify-evenly flex-wrap">
            <SpecItem
              icon="bed-outline"
              label="Beds"
              value={property.bedrooms}
            />
            <SpecItem
              icon="water-outline"
              label="Baths"
              value={property.bathrooms}
            />
            <SpecItem
              icon="resize-outline"
              label="Area"
              value={`${property.area_sqft} ft²`}
            />
            <SpecItem icon="home-outline" label="Type" value={property.type} />
          </View>

          <Text className="text-gray-900 text-base font-bold leading-6 mt-6 mb-2">
            Description
          </Text>
          <Text
            className={`text-gray-500 ${expanded ? "" : "line-clamp-3"}`}
            onPress={() => setExpanded(!expanded)}
          >
            {displayDesc}
          </Text>
          {isLongDescription && (
            <TouchableOpacity
              onPress={() => setExpanded(!expanded)}
              className="mt-1"
            >
              <Text className="text-primary font-semibold">
                {expanded ? "Read less" : "Read more"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Location */}
          <View className="mt-5 mb-4">
            <Text className="text-gray-900 text-base font-bold leading-6">
              Location
            </Text>

            {/* Render address */}
            <Text className="text-gray-500">
              {property.address}, {property.city}
            </Text>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                router.push({
                  pathname: "/(root)/property/map",
                  params: {
                    latitude: property.latitude,
                    longitude: property.longitude,
                    title: property.title,
                    address: `${property.address}, ${property.city}`,
                  },
                });
              }}
              className="rounded-2xl overflow-hidden mt-3"
              style={{
                overflow: "hidden",
                height: 200,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <WebView
                source={{ uri: mapUrl }}
                scrollEnabled={false}
                pointerEvents="none"
              />

              {/* Tab to expand */}
              <View className="absolute bottom-3 inset-e-0 bg-black items-center justify-center py-2 px-3 rounded-full flex-row gap-1">
                <Ionicons name="expand" size={12} color="#fff" />
                <Text className="text-white text-xs">View Fullscreen</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Contact throw whatsapp */}
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 bg-green-500 px-3 py-4 rounded-2xl"
            onPress={() => {
              // const phone = property.contact_phone.replace(/\D/g, ""); // Remove non-digit characters
              const phone = "201092794103";
              const message = `Hello, I'm interested in the property "${property.title}". Is it still available?`;
              const url = `https://wa.me/${phone}?text=${encodeURIComponent(
                message,
              )}`;
              Linking.openURL(url);
            }}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text className="text-white font-semibold">
              Contact via WhatsApp
            </Text>
          </TouchableOpacity>

          {/* mark as sold if admin */}
          <View className="mb-6 flex-row items-center justify-between gap-4 mt-6">
            {isAdmin && !property.is_sold && (
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center gap-2 bg-amber-100 px-3 py-4 rounded-2xl"
                onPress={handleMarkSold}
              >
                <Ionicons
                  name="checkmark-done"
                  size={14}
                  className="text-amber-500"
                />
                <Text className="text-amber-500 font-semibold">
                  Mark as Sold
                </Text>
              </TouchableOpacity>
            )}
            {isAdmin && (
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center gap-2 bg-red-500 px-3 py-4 rounded-2xl"
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={14} color="#fff" />
                <Text className="text-white font-semibold">
                  Delete Property
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <ImageView
        images={property.images.map((uri) => ({ uri }))}
        imageIndex={activeIndex}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />
    </View>
  );
}

function SpecItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
}) {
  return (
    <View className="items-center gap-1">
      <Ionicons name={icon} size={16} color="#555" />
      <Text className="font-bold">{value}</Text>
      <Text className="text-gray-500 text-sm leading-6 mb-1">{label}</Text>
    </View>
  );
}
