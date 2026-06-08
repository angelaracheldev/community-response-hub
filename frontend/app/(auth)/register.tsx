import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE } from '../../utils/apiConfig';
import { connectSocket } from '../../hooks/useSocket';
import { extractAccessToken, setAuthToken } from '../../utils/sessionAuth';
import { buildVerificationFormData } from '../../utils/verificationUpload';
import { authRegisterStyles as styles } from '../../styles/auth/register';
import {
  FieldErrors,
  StructuredAddress,
  formatStructuredAddress,
  hasFieldErrors,
  parseFullName,
  validateRegisterStep1,
  validateRegisterStep2,
  validateRegisterStep3,
} from '../../utils/validation';

type IdFile = ImagePicker.ImagePickerAsset;
type RegisterStep = 1 | 2 | 3;

const EMPTY_ADDRESS: StructuredAddress = {
  street: '',
  subdivision: '',
  city: '',
  province: '',
  postalCode: '',
};


const STEP_SUBTITLES: Record<RegisterStep, string> = {
  1: 'Enter your account details to get started.',
  2: 'Add your phone number and residential address.',
  3: 'Upload a valid ID that shows your address. An admin will review it.',
};

function apiErrorMessage(
  data: { message?: string; errors?: { msg?: string }[] },
  fallback: string
): string {
  if (data.message) return data.message;
  if (data.errors?.length) return data.errors[0].msg ?? fallback;
  return fallback;
}

export default function RegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState<RegisterStep>(1);
  const [isLoading, setIsLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState<StructuredAddress>(EMPTY_ADDRESS);
  const [idFile, setIdFile] = useState<IdFile | null>(null);
  const [addressConfirmed, setAddressConfirmed] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});

  const formattedAddress = formatStructuredAddress(address);

  const clearError = (key: string) => {
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const updateAddress = (key: keyof StructuredAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [key]: value }));
    clearError(key);
  };

  const handleBack = () => {
    setErrors({});
    if (step === 1) {
      router.push('/');
      return;
    }
    setStep((step - 1) as RegisterStep);
  };

  const handleNext = () => {
    if (step === 1) {
      const stepErrors = validateRegisterStep1({ fullName, email, password, confirmPassword });
      setErrors(stepErrors);
      if (!hasFieldErrors(stepErrors)) setStep(2);
      return;
    }

    if (step === 2) {
      const stepErrors = validateRegisterStep2({ phone, address });
      setErrors(stepErrors);
      if (!hasFieldErrors(stepErrors)) setStep(3);
    }
  };

  const pickIdFile = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Permission to access photos is required to upload your ID.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      setIdFile(result.assets[0]);
      clearError('idFile');
    }
  };

  const handleRegister = async () => {
    const stepErrors = validateRegisterStep3({
      hasIdFile: Boolean(idFile),
      addressConfirmed,
    });
    setErrors(stepErrors);
    if (hasFieldErrors(stepErrors) || !idFile) return;

    const { firstName, lastName } = parseFullName(fullName);
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim().replace(/\s/g, '');

    setIsLoading(true);

    try {
      const registerRes = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email: normalizedEmail,
          password,
          phoneNumber: normalizedPhone,
          address: formattedAddress,
        }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        alert(apiErrorMessage(registerData, 'Registration failed. Please try again.'));
        return;
      }

      const accessToken = extractAccessToken(registerData);
      if (accessToken) {
        await setAuthToken(accessToken);
        await connectSocket();

        try {
          const verificationFile = {
  uri: idFile.uri,
  name: idFile.fileName ?? 'id.jpg',
  type: idFile.mimeType ?? 'image/jpeg',
  size: idFile.fileSize ?? 0,
};
          const formData = await buildVerificationFormData(formattedAddress, verificationFile);
          await fetch(`${API_BASE}/users/me/verification`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
          });
        } catch (verificationError) {
          console.warn('Verification request failed:', verificationError);
        }
      }

      router.replace('/(resident)/home?registered=1');
    } catch (error) {
      console.error('Registration error:', error);
      alert('Could not reach the server. Check your connection and that the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = (key: string) => [styles.input, errors[key] ? styles.inputError : null];

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Text style={[styles.backButtonText, isLoading && { opacity: 0.5 }]}>
              {step === 1 ? '← Back to Home' : '← Back'}
            </Text>
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Text style={styles.stepLabel}>Step {step} of 3</Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>{STEP_SUBTITLES[step]}</Text>
          </View>

          <View style={styles.formContainer}>
            {step === 1 && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={inputStyle('fullName')}
                    placeholder="Juan Dela Cruz"
                    placeholderTextColor="#9ca3af"
                    value={fullName}
                    onChangeText={(v) => {
                      setFullName(v);
                      clearError('fullName');
                    }}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                  {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={inputStyle('email')}
                    placeholder="you@example.com"
                    placeholderTextColor="#9ca3af"
                    value={email}
                    onChangeText={(v) => {
                      setEmail(v);
                      clearError('email');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                  {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={[styles.passwordContainer, errors.password && styles.inputErrorBorder]}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="••••••••"
                      placeholderTextColor="#9ca3af"
                      value={password}
                      onChangeText={(v) => {
                        setPassword(v);
                        clearError('password');
                      }}
                      secureTextEntry={secureText}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      onPress={() => setSecureText(!secureText)}
                      style={styles.toggleButton}
                      disabled={isLoading}
                    >
                      <Text style={styles.toggleText}>{secureText ? 'Show' : 'Hide'}</Text>
                    </TouchableOpacity>
                  </View>
                  {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View
                    style={[styles.passwordContainer, errors.confirmPassword && styles.inputErrorBorder]}
                  >
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="••••••••"
                      placeholderTextColor="#9ca3af"
                      value={confirmPassword}
                      onChangeText={(v) => {
                        setConfirmPassword(v);
                        clearError('confirmPassword');
                      }}
                      secureTextEntry={secureConfirm}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      onPress={() => setSecureConfirm(!secureConfirm)}
                      style={styles.toggleButton}
                      disabled={isLoading}
                    >
                      <Text style={styles.toggleText}>{secureConfirm ? 'Show' : 'Hide'}</Text>
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword ? (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  ) : null}
                </View>

                <TouchableOpacity style={styles.button} onPress={handleNext} disabled={isLoading}>
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              </>
            )}

            {step === 2 && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={inputStyle('phone')}
                    placeholder="09171234567"
                    placeholderTextColor="#9ca3af"
                    value={phone}
                    onChangeText={(v) => {
                      setPhone(v);
                      clearError('phone');
                    }}
                    keyboardType="phone-pad"
                    editable={!isLoading}
                  />
                  {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
                </View>

                <Text style={styles.sectionLabel}>Residential Address</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Street / House No.</Text>
                  <TextInput
                    style={inputStyle('street')}
                    placeholder="123 Maple Street"
                    placeholderTextColor="#9ca3af"
                    value={address.street}
                    onChangeText={(v) => updateAddress('street', v)}
                    editable={!isLoading}
                  />
                  {errors.street ? <Text style={styles.errorText}>{errors.street}</Text> : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Subdivision / Barangay</Text>
                  <TextInput
                    style={inputStyle('subdivision')}
                    placeholder="Greenfield Subdivision"
                    placeholderTextColor="#9ca3af"
                    value={address.subdivision}
                    onChangeText={(v) => updateAddress('subdivision', v)}
                    editable={!isLoading}
                  />
                  {errors.subdivision ? (
                    <Text style={styles.errorText}>{errors.subdivision}</Text>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>City</Text>
                  <TextInput
                    style={inputStyle('city')}
                    placeholder="Marikina"
                    placeholderTextColor="#9ca3af"
                    value={address.city}
                    onChangeText={(v) => updateAddress('city', v)}
                    editable={!isLoading}
                  />
                  {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Province</Text>
                  <TextInput
                    style={inputStyle('province')}
                    placeholder="Metro Manila"
                    placeholderTextColor="#9ca3af"
                    value={address.province}
                    onChangeText={(v) => updateAddress('province', v)}
                    editable={!isLoading}
                  />
                  {errors.province ? <Text style={styles.errorText}>{errors.province}</Text> : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Postal Code</Text>
                  <TextInput
                    style={inputStyle('postalCode')}
                    placeholder="1800"
                    placeholderTextColor="#9ca3af"
                    value={address.postalCode}
                    onChangeText={(v) => updateAddress('postalCode', v)}
                    keyboardType="number-pad"
                    maxLength={4}
                    editable={!isLoading}
                  />
                  {errors.postalCode ? (
                    <Text style={styles.errorText}>{errors.postalCode}</Text>
                  ) : null}
                </View>

                <TouchableOpacity style={styles.button} onPress={handleNext} disabled={isLoading}>
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              </>
            )}

            {step === 3 && (
              <>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>Address on file</Text>
                  <Text style={styles.summaryText}>{formattedAddress}</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Valid ID (with address)</Text>
                  <Text style={styles.hint}>
                    Upload a government-issued ID that clearly shows the address above.
                  </Text>
                  <TouchableOpacity
                    style={[styles.uploadButton, errors.idFile && styles.inputErrorBorder]}
                    onPress={pickIdFile}
                    disabled={isLoading}
                  >
                    <Text style={styles.uploadButtonText}>
                      {idFile ? 'Change ID photo' : 'Upload ID photo'}
                    </Text>
                  </TouchableOpacity>
                  {idFile?.uri ? (
                    <Image source={{ uri: idFile.uri }} style={styles.preview} resizeMode="cover" />
                  ) : null}
                  {errors.idFile ? <Text style={styles.errorText}>{errors.idFile}</Text> : null}
                </View>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => {
                    setAddressConfirmed((v) => !v);
                    clearError('addressConfirmed');
                  }}
                  disabled={isLoading}
                >
                  <View style={[styles.checkbox, addressConfirmed && styles.checkboxChecked]}>
                    {addressConfirmed ? <Text style={styles.checkmark}>✓</Text> : null}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    I confirm my ID shows the residential address I entered.
                  </Text>
                </TouchableOpacity>
                {errors.addressConfirmed ? (
                  <Text style={styles.errorText}>{errors.addressConfirmed}</Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.disabledButton]}
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text style={styles.buttonText}> Creating account...</Text>
                    </View>
                  ) : (
                    <Text style={styles.buttonText}>Sign Up</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity disabled={isLoading}>
                <Text style={[styles.linkText, isLoading && { opacity: 0.5 }]}>Log In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


