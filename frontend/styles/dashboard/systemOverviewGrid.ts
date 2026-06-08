import { StyleSheet } from 'react-native';

export const systemOverviewGridStyles = StyleSheet.create({
  wrapper: {
    marginTop: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  cell: {
    flexGrow: 1,
    minWidth: 140,
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  icon: {
    fontSize: 18,
    marginBottom: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
  },
});
