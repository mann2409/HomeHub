import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  text: string;
  x: number; // anchor x
  y: number; // anchor y
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export default function CalloutBubble({ text, x, y, placement = 'top' }: Props) {
  const bubbleStyle = { position:'absolute' as const };
  const arrowSize = 10;

  let bubblePos: any = {};
  let arrowPos: any = {};
  if (placement === 'top') {
    bubblePos = { left: x - 70, top: y - 56 };
    arrowPos = { left: x - 6, top: y - 12, borderTopColor: '#EF4444', transform: [{ rotate: '180deg' }] };
  } else if (placement === 'bottom') {
    bubblePos = { left: x - 70, top: y + 16 };
    arrowPos = { left: x - 6, top: y + 8 };
  } else if (placement === 'left') {
    bubblePos = { left: x - 160, top: y - 20 };
    arrowPos = { left: x - 12, top: y, transform: [{ rotate: '-90deg' }] };
  } else {
    bubblePos = { left: x + 16, top: y - 20 };
    arrowPos = { left: x + 8, top: y, transform: [{ rotate: '90deg' }] };
  }

  return (
    <>
      <View style={[bubbleStyle, bubblePos, { backgroundColor:'#EF4444', borderRadius:12, paddingVertical:8, paddingHorizontal:12, shadowColor:'#000', shadowOpacity:0.3, shadowRadius:10, shadowOffset:{width:0,height:6} }]}>
        <Text style={{ color:'#fff', fontWeight:'700' }}>{text}</Text>
      </View>
      <View style={[bubbleStyle, arrowPos, { width:0, height:0, borderLeftWidth:arrowSize, borderRightWidth:arrowSize, borderBottomWidth:arrowSize, borderStyle:'solid', backgroundColor:'transparent', borderLeftColor:'transparent', borderRightColor:'transparent', borderBottomColor:'#EF4444' }]} />
    </>
  );
}


