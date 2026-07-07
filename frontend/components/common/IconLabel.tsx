import React, { ReactNode } from 'react';
import { StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { AppIcon, IconName } from './AppIcon';

type Props = {
  icon: IconName;
  iconSize?: number;
  iconColor?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function IconLabel({
  icon,
  iconSize = 18,
  iconColor = '#111827',
  children,
  style,
  textStyle,
}: Props) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, style]}>
      <AppIcon name={icon} size={iconSize} color={iconColor} />
      <Text style={textStyle}>{children}</Text>
    </View>
  );
}
