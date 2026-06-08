import { StyleSheet } from 'react-native';

export const appShellStyles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
  },
  sidebarColumn: {
    alignSelf: 'stretch',
    backgroundColor: '#0F172A',
  },
  mainSafe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  main: {
    flex: 1,
    position: 'relative',
  },
  content: {},
  contentFlex: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  drawer: {
    width: 260,
    height: '100%',
    backgroundColor: '#0F172A',
  },
});
