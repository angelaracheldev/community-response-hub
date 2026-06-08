import { StyleSheet } from 'react-native';
import { Platform } from 'react-native';

export const floatingQuickActionsBarStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  wrapperAbsolute: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignSelf: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.12)',
      } as object,
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
      },
    }),
  },
  action: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
    minWidth: 64,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
});
