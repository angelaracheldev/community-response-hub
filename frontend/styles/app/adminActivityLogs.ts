import { StyleSheet } from 'react-native';

export const adminActivityLogsStyles = StyleSheet.create({
  filtersDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  filterInputDesktop: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  colWhen: { width: 140 },
  colAction: { width: 120 },
  colBy: { width: 120 },
  colDesc: { flex: 1, minWidth: 100 },
});
