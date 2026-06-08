export function getContentMaxWidth(screenWidth: number): number {
  if (screenWidth >= 1200) return 960;
  if (screenWidth >= 768) return 720;
  return Math.min(screenWidth, 450);
}
