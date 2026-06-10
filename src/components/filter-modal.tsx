import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { PropertyType, useFilterStore } from "../store/filterStore";

const TYPES: { label: string; value: PropertyType }[] = [
  { label: "All", value: null },
  { label: "Apartment", value: "apartment" },
  { label: "House", value: "house" },
  { label: "Villa", value: "villa" },
  { label: "Studio", value: "studio" },
];

const BEDS = [
  { label: "Any", value: null },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4+", value: 4 },
];

const PRICE_PRESETS = [
  { label: "Under $50", min: null, max: 50 },
  { label: "$50 – $100", min: 50, max: 100 },
  { label: "$100 – $200", min: 100, max: 200 },
  { label: "Above $200", min: 200, max: null },
];

const chip = (active: boolean) =>
  `px-4 py-2 rounded-full border ${
    active ? "bg-primary border-primary" : "bg-white border-gray-200"
  }`;

const chipText = (active: boolean) =>
  `text-sm font-semibold ${active ? "text-white" : "text-gray-600"}`;

export default function FilterModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const type = useFilterStore((state) => state.type);
  const setType = useFilterStore((state) => state.setType);
  const minPrice = useFilterStore((state) => state.minPrice);
  const setMinPrice = useFilterStore((state) => state.setMinPrice);
  const maxPrice = useFilterStore((state) => state.maxPrice);
  const setMaxPrice = useFilterStore((state) => state.setMaxPrice);
  const bedrooms = useFilterStore((state) => state.bedrooms);
  const setBedrooms = useFilterStore((state) => state.setBedrooms);

  const resetFilters = useFilterStore((state) => state.resetFilters);

  const [minPriceValue, setMinPriceValue] = useState(
    minPrice ? String(minPrice) : "",
  );
  const [maxPriceValue, setMaxPriceValue] = useState(
    maxPrice ? String(maxPrice) : "",
  );

  const activeCount = [type, minPrice, maxPrice, bedrooms].filter(
    Boolean,
  ).length;

  const handleApply = () => {
    setMinPrice(minPriceValue ? parseInt(minPriceValue) : null);
    setMaxPrice(maxPriceValue ? parseInt(maxPriceValue) : null);
    onClose();
  };

  const handleReset = () => {
    setMinPriceValue("");
    setMaxPriceValue("");
    resetFilters();
    onClose();
  };

  const shadowStyle = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-gray-50">
        <View className="flex-row items-center justify-between px-5 pt-6 pb-4 bg-white border-b border-gray-100">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>

          <Text className="text-lg font-semibold text-gray-900">Filters</Text>

          <TouchableOpacity onPress={handleReset}>
            <Text className="text-sm text-primary">Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-base font-bold text-gray-500 mb-2">
            Property Type
          </Text>

          <View className="flex-row flex-wrap gap-3 mb-6">
            {TYPES.map((option) => {
              const active = type === option.value;
              return (
                <TouchableOpacity
                  key={option.value || "all"}
                  onPress={() => setType(option.value)}
                  className={chip(active)}
                  style={shadowStyle}
                >
                  <Text className={chipText(active)}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text className="text-base font-bold text-gray-500 mb-2">
            Bedrooms
          </Text>
          <View className="flex-row flex-wrap gap-3 mb-6">
            {BEDS.map((option) => {
              const active = bedrooms === option.value;
              return (
                <TouchableOpacity
                  key={option.value || "all"}
                  onPress={() => setBedrooms(option.value)}
                  className={chip(active)}
                  style={shadowStyle}
                >
                  <Text className={chipText(active)}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text className="text-base font-bold text-gray-500 mb-2">
            Price Range
          </Text>

          <View className="flex-row gap-3 mb-3">
            {[
              {
                label: "Min Price",
                value: minPriceValue,
                setter: setMinPriceValue,
                placeholder: "0",
              },
              {
                label: "Max Price",
                value: maxPriceValue,
                setter: setMaxPriceValue,
                placeholder: "Any",
              },
            ].map((option) => (
              <View key={option.label} className="flex-1">
                <Text className="text-xs text-gray-500 mb-1">
                  {option.label}
                </Text>
                <View
                  className="flex-row items-center bg-white rounded-lg px-3 py-2"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.06,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                >
                  <Text className="text-gray-500">$</Text>
                  <TextInput
                    placeholder={option.placeholder}
                    className="flex-1 py-0 text-gray-800"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    value={option.value}
                    onChangeText={(text) => option.setter(text)}
                  />
                </View>
              </View>
            ))}
          </View>

          <View className="flex-row flex-wrap gap-3 mb-6">
            {PRICE_PRESETS.map((option) => {
              const active = minPrice === option.min && maxPrice === option.max;
              return (
                <TouchableOpacity
                  key={option.label}
                  onPress={() => {
                    setMinPriceValue(option.min ? String(option.min) : "");
                    setMaxPriceValue(option.max ? String(option.max) : "");

                    setMinPrice(option.min);
                    setMaxPrice(option.max);
                  }}
                  className={`px-3 py-1.5 rounded-full border ${
                    active
                      ? "bg-primary/10 border-primary/40"
                      : "bg-white border-gray-200"
                  }`}
                  style={shadowStyle}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      active ? "text-primary" : "text-gray-600"
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Filter Button */}
        <View className="px-5 pt-4 pb-8 bg-white border-t border-gray-100">
          <TouchableOpacity
            onPress={handleApply}
            className="bg-primary rounded-2xl py-3 items-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-white font-semibold text-base">
              Apply Filters
              {activeCount > 0 && ` (${activeCount})`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
