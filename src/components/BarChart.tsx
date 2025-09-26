import React from "react";
import { View, Text } from "react-native";
import { CartesianChart, Bar, CartesianAxis } from "victory-native";

interface BarChartProps {
  data: Record<string, number>;
  title?: string;
}

export default function BarChart({ data, title }: BarChartProps) {
  // Prepare data for chart
  const chartData = Object.entries(data).map(([label, amount]) => ({
    label,
    amount: amount,
  }));

  if (chartData.length === 0) {
    return (
      <View className="items-center justify-center h-32">
        <Text className="text-gray-500">No data available</Text>
      </View>
    );
  }

  return (
    <View>
      {title && (
        <Text className="text-sm font-medium text-gray-700 mb-2">
          {title}
        </Text>
      )}
      
      <View style={{ height: 160 }}>
        <CartesianChart
          data={chartData}
          xKey="label"
          yKeys={["amount"]}
        >
          {({ points, chartBounds }) => (
            <>
              <Bar
                points={points.amount}
                chartBounds={chartBounds}
                roundedCorners={{ topLeft: 4, topRight: 4 }}
              />
              <CartesianAxis
                tickCount={7}
                lineColor="#334155"
                labelColor="#CBD5E1"
                formatXLabel={(v) => String(v)}
                formatYLabel={(v) => String(v)}
              />
            </>
          )}
        </CartesianChart>
      </View>
    </View>
  );
}