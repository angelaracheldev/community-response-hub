import { useWindowDimensions } from 'react-native';

export type DashboardLayout = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  showSidebar: boolean;
  showMobileMenu: boolean;
  useCompactList: boolean;
  statColumns: number;
  chartColumns: number;
  listColumns: number;
  contentPadding: number;
  contentMaxWidth: number | undefined;
};

export function useDashboardLayout(): DashboardLayout {
  const { width } = useWindowDimensions();

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  return {
    isMobile,
    isTablet,
    isDesktop,
    showSidebar: isDesktop,
    showMobileMenu: !isDesktop,
    useCompactList: !isDesktop,
    statColumns: isMobile ? 2 : 4,
    chartColumns: isMobile ? 1 : 2,
    listColumns: isDesktop ? 2 : 1,
    contentPadding: isMobile ? 16 : 24,
    contentMaxWidth: isDesktop ? 1200 : undefined,
  };
}
