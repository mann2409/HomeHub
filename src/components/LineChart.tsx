import React from "react";
import { View, Text } from "react-native";
import Svg, { Path, Circle, Line } from "react-native-svg";

interface LineChartProps {
  data: Record<string, number>;
  title?: string;
  height?: number;
  color?: string;
}

export default function LineChart({ 
  data, 
  title, 
  height = 120, 
  color = "#3B82F6" 
}: LineChartProps) {
  console.log("LineChart data:", data);

  const entries = Object.entries(data);
  
  if (entries.length === 0) {
    return (
      <View className="items-center justify-center bg-white/5 rounded-xl" style={{ height }}>
        <Text className="text-white/60">No spending data yet</Text>
      </View>
    );
  }

  // Find max and min values for scaling
  const values = entries.map(([_, value]) => value);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const valueRange = maxValue - minValue || 1;

  // Chart dimensions
  const chartWidth = 280;
  const chartHeight = height - 40; // Account for labels
  const padding = 20;
  const innerWidth = chartWidth - (padding * 2);
  const innerHeight = chartHeight - (padding * 2);

  // Calculate points
  const points = entries.map(([_, value], index) => {
    const x = padding + (index / (entries.length - 1)) * innerWidth;
    const y = padding + innerHeight - ((value - minValue) / valueRange) * innerHeight;
    return { x, y, value };
  });

  // Create path for line
  const pathData = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');

  // Create path for area under line
  const areaData = `${pathData} L ${points[points.length - 1].x} ${padding + innerHeight} L ${padding} ${padding + innerHeight} Z`;

  return (
    <View>
      {title && (
        <Text className="text-sm font-medium text-white mb-2">
          {title}
        </Text>
      )}
      
      <View className="bg-white/5 rounded-xl p-4">
        {/* Chart Area */}
        <View style={{ height: chartHeight }}>
          <Svg width={chartWidth} height={chartHeight}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const y = padding + ratio * innerHeight;
              return (
                <Line
                  key={index}
                  x1={padding}
                  y1={y}
                  x2={padding + innerWidth}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="1"
                />
              );
            })}
            
            {/* Area under line */}
            <Path
              d={areaData}
              fill={`${color}20`} // 20% opacity
              stroke="none"
            />
            
            {/* Main line */}
            <Path
              d={pathData}
              stroke={color}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {points.map((point, index) => (
              <Circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={color}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            ))}
          </Svg>
        </View>
        
        {/* X-axis Labels */}
        <View className="flex-row justify-between mt-2">
          {entries.map(([label], index) => (
            <View key={index} className="flex-1 items-center">
              <Text className="text-[10px] text-white/70" numberOfLines={1}>
                {label}
              </Text>
            </View>
          ))}
        </View>
        
        {/* Y-axis Labels */}
        <View className="absolute left-0 top-0" style={{ height: chartHeight, width: padding }}>
          {[1, 0.75, 0.5, 0.25, 0].map((ratio, index) => {
            const value = minValue + ratio * valueRange;
            const y = padding + ratio * innerHeight;
            return (
              <Text
                key={index}
                className="text-[10px] text-white/70 absolute"
                style={{ 
                  top: y - 6, 
                  left: 0,
                  transform: [{ translateX: -25 }]
                }}
              >
                ${value.toFixed(0)}
              </Text>
            );
          })}
        </View>
      </View>
    </View>
  );
}
