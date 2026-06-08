import { StyleSheet } from 'react-native';

export const notificationBellStyles = StyleSheet.create({
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBtnActive: {
    backgroundColor: '#F3F4F6',
  },
  bellWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    fontSize: 20,
    opacity: 0.85,
  },
});
