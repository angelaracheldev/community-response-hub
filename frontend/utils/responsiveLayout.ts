import { Platform } from 'react-native';

export function getContentMaxWidth(screenWidth: number): number {
  if (screenWidth >= 1200) return 960;
  if (screenWidth >= 768) return 720;
  return Math.min(screenWidth, 450);
}

export function getScrollBottomPadding(screenWidth: number): number {
  if (Platform.OS === 'web' && screenWidth > 450) return 140;
  return 88;
}
