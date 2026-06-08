import { StyleSheet } from 'react-native';

export const authRegisterStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingRight: 16,
    marginBottom: 24,
  },
  backButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    marginBottom: 32,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4f46e5',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  formContainer: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  },
  summaryCard: {
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4338ca',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  inputErrorBorder: {
    borderColor: '#ef4444',
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    color: '#ef4444',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  toggleButton: {
    paddingHorizontal: 16,
  },
  toggleText: {
    color: '#4f46e5',
    fontWeight: '600',
    fontSize: 14,
  },
  uploadButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: '600',
  },
  preview: {
    marginTop: 12,
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#4f46e5',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#4f46e5',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    boxShadow: '0px 4px 6px -1px rgba(79, 70, 229, 0.2)',
  },
  disabledButton: {
    backgroundColor: '#a5b4fc',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4f46e5',
  },
});
