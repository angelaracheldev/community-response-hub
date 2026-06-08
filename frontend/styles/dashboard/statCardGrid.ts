import { StyleSheet } from 'react-native';

export const statCardGridStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  cell: {
    flexGrow: 1,
    minWidth: 150,
    paddingHorizontal: 6,
    marginBottom: 12,
  },
});
