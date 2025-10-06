import React from "react";
import { View, Text } from "react-native";

interface BarChartProps {
  data: Record<string, number>;
  title?: string;
}

export default function BarChart({ data, title }: BarChartProps) {
  console.log("BarChart data:", data);

  const entries = Object.entries(data);
  
  if (entries.length === 0) {
    return (
      <View className="items-center justify-center h-32 bg-white/5 rounded-xl">
        <Text className="text-white/60">No spending data yet</Text>
      </View>
    );
  }

  // Find max value for scaling
  const maxValue = Math.max(...entries.map(([_, value]) => value), 1);
  
  return (
    <View>
      {title && (
        <Text className="text-sm font-medium text-white mb-2">
          {title}
        </Text>
      )}
      
      <View className="bg-white/5 rounded-xl p-4">
        {/* Chart Area */}
        <View className="h-32 flex-row items-end justify-between mb-3">
          {entries.map(([label, value], index) => {
            const heightPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
            
            return (
              <View key={index} className="flex-1 items-center mx-0.5">
                {/* Value Label on top of bar */}
                {value > 0 && (
                  <Text className="text-[10px] text-white/80 font-medium mb-1">
                    ${value.toFixed(0)}
                  </Text>
                )}
                
                {/* Bar */}
                <View className="w-full items-center">
                  <View 
                    className="w-full rounded-t-lg"
                    style={{ 
                      height: heightPercentage > 0 ? `${heightPercentage}%` : 4,
                      backgroundColor: value > 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(255, 255, 255, 0.1)',
                      minHeight: value > 0 ? 16 : 4,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>
        
        {/* Base Line */}
        <View className="h-px bg-white/20 mb-2" />
        
        {/* X-axis Labels */}
        <View className="flex-row justify-between">
          {entries.map(([label], index) => (
            <View key={index} className="flex-1 items-center">
              <Text className="text-[10px] text-white/70" numberOfLines={1}>
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}