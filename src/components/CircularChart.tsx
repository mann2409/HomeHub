import React from "react";
import { View, Text } from "react-native";
import { PolarChart, Pie } from "victory-native";
import { ExpenseCategory } from "../types";
import useSettingsStore from "../state/settingsStore";

interface CircularChartProps {
  data: Record<ExpenseCategory, number>;
  totalAmount: number;
}

export default function CircularChart({ data, totalAmount }: CircularChartProps) {
  const { categoryColors } = useSettingsStore();

  // Filter out categories with zero amounts and prepare data for chart
  const chartData = Object.entries(data)
    .filter(([_, amount]) => amount > 0)
    .map(([category, amount]) => ({
      value: amount,
      color: categoryColors.expenseCategories[category as ExpenseCategory],
      label: category,
    }));

  if (chartData.length === 0) {
    return (
      <View className="items-center justify-center h-48">
        <Text className="text-gray-500">No expense data</Text>
      </View>
    );
  }

  return (
    <View className="items-center">
      <View className="relative">
        <View style={{ width: 200, height: 200 }}>
          <PolarChart
            data={chartData}
            labelKey="label"
            valueKey="value"
            colorKey="color"
          >
            <Pie.Chart innerRadius={60} />
          </PolarChart>
        </View>
        
        {/* Center text showing total */}
        <View className="absolute inset-0 items-center justify-center">
          <Text className="text-2xl font-bold text-gray-100">
            ${totalAmount.toFixed(0)}
          </Text>
          <Text className="text-sm text-gray-300">
            Total
          </Text>
        </View>
      </View>

      {/* Legend */}
      <View className="mt-4 flex-row flex-wrap justify-center">
        {chartData.map((item, index) => (
          <View key={index} className="flex-row items-center mx-2 mb-2">
            <View
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: item.color }}
            />
            <Text className="text-xs text-gray-600 capitalize">
              {item.label}: ${item.value.toFixed(0)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}