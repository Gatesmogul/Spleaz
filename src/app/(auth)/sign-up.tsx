import authApi from '@/api/auth';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Gender = 'Male' | 'Female' | 'Other';
type Role = 'Customer' | 'Driver';

export default function SignUpScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const placeholderColor = isDark ? '#9CA3AF' : '#6B7280';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const [countryOfResidence, setCountryOfResidence] =
    useState('Nigeria');

  const [stateOfResidence, setStateOfResidence] =
    useState('Lagos');

  const [cityOfResidence, setCityOfResidence] = useState('');

  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('Customer');

  const selectedCountryCode = '+234';

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (value: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      value
    );

  const handleSignUp = async (): Promise<void> => {
    // ==========================================
    // VALIDATION
    // ==========================================

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !cityOfResidence.trim() ||
      !stateOfResidence.trim() ||
      !password
    ) {
      Alert.alert(
        t('common.error', 'Error'),
        t(
          'auth.fillAllFields',
          'Please fill in all required fields.'
        )
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert(
        t('common.error', 'Error'),
        t(
          'auth.invalidEmail',
          'Please enter a valid email address.'
        )
      );
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert(
        t('auth.weakPasswordTitle', 'Password Too Weak'),
        t(
          'auth.weakPasswordMsg',
          'Password must contain at least 8 characters, including uppercase, lowercase, number and special character.'
        )
      );
      return;
    }

    setIsLoading(true);

    try {
      // ==========================================
      // NORMALIZE ROLE TO MATCH BACKEND
      // ==========================================
      //
      // Frontend:
      //   Customer
      //   Driver
      //
      // Backend expects:
      //   customer
      //   driver
      //
      const backendRole =
        role === 'Driver' ? 'driver' : 'customer';

      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      const normalizedPhone = `${selectedCountryCode} ${phone
        .trim()
        .replace(/\s+/g, '')}`;

      // ==========================================
      // REGISTRATION REQUEST
      // ==========================================

      const response = await authApi.signUp({
        fullName,
        email: email.trim().toLowerCase(),
        phoneNumber: normalizedPhone,
        password,

        // FIXED:
        // Previously:
        // role: role === 'Driver' ? 'DRIVER' : 'RIDER'
        //
        // Now:
        // customer / driver
        role: backendRole,

        country: countryOfResidence.trim(),
        state: stateOfResidence.trim(),
        city: cityOfResidence.trim(),

        // The backend currently does not require gender,
        // but it can be sent if your authApi/backend types
        // support this field.
        gender,
      });

      console.log(
        '[Spleaz] Registration successful:',
        response?.data
      );

      Alert.alert(
        t('auth.accountCreatedTitle', 'Account Created'),
        t(
          'auth.accountCreatedMsg',
          'Your Spleaz account has been created successfully. You can now sign in.'
        ),
        [
          {
            text: t('common.ok', 'OK'),
            onPress: () =>
              router.replace('/(auth)/sign-in'),
          },
        ]
      );
    } catch (error: any) {
      console.error(
        '[Spleaz] Sign-up error:',
        error
      );

      console.error(
        '[Spleaz] Sign-up response:',
        error?.response?.data
      );

      const serverMessage =
        error?.response?.data?.message;

      Alert.alert(
        t('common.error', 'Error'),
        serverMessage ||
          'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {
            backgroundColor: colors.background,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ==================================
            LOGO
        =================================== */}

        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/Spleaz_App_Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
          >
            Sign Up With Spleaz
          </Text>
        </View>

        {/* ==================================
            FIRST NAME / LAST NAME
        =================================== */}

        <View style={styles.row}>
          <View style={styles.flexField}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                },
              ]}
            >
              First Name{' '}
              <Text style={styles.required}>*</Text>
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="First Name"
              placeholderTextColor={placeholderColor}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.flexField}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                },
              ]}
            >
              Last Name{' '}
              <Text style={styles.required}>*</Text>
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Last Name"
              placeholderTextColor={placeholderColor}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* ==================================
            PHONE
        =================================== */}

        <Text
          style={[
            styles.label,
            {
              color: colors.text,
            },
          ]}
        >
          Phone Number{' '}
          <Text style={styles.required}>*</Text>
        </Text>

        <View style={styles.phoneRow}>
          <View
            style={[
              styles.countryCodePicker,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.countryCodeText,
                {
                  color: colors.text,
                },
              ]}
            >
              {selectedCountryCode}
            </Text>
          </View>

          <TextInput
            style={[
              styles.phoneInput,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="08012345678"
            placeholderTextColor={placeholderColor}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            autoCorrect={false}
          />
        </View>

        {/* ==================================
            COUNTRY / STATE
        =================================== */}

        <View style={styles.row}>
          <View style={styles.flexField}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                },
              ]}
            >
              Country{' '}
              <Text style={styles.required}>*</Text>
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={countryOfResidence}
              onChangeText={setCountryOfResidence}
              placeholderTextColor={placeholderColor}
            />
          </View>

          <View style={styles.flexField}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                },
              ]}
            >
              State/Province{' '}
              <Text style={styles.required}>*</Text>
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={stateOfResidence}
              onChangeText={setStateOfResidence}
              placeholderTextColor={placeholderColor}
            />
          </View>
        </View>

        {/* ==================================
            CITY / EMAIL
        =================================== */}

        <View style={styles.row}>
          <View style={styles.flexField}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                },
              ]}
            >
              City{' '}
              <Text style={styles.required}>*</Text>
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g. Ikeja"
              placeholderTextColor={placeholderColor}
              value={cityOfResidence}
              onChangeText={setCityOfResidence}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.flexField}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                },
              ]}
            >
              Email Address{' '}
              <Text style={styles.required}>*</Text>
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="user@example.com"
              placeholderTextColor={placeholderColor}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        {/* ==================================
            GENDER
        =================================== */}

        <Text
          style={[
            styles.label,
            {
              color: colors.text,
            },
          ]}
        >
          Gender{' '}
          <Text style={styles.required}>*</Text>
        </Text>

        <View style={styles.optionRow}>
          {(['Male', 'Female', 'Other'] as const).map(
            (item) => {
              const selected = gender === item;

              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.chipOption,
                    {
                      borderColor: selected
                        ? colors.primary
                        : colors.border,
                      backgroundColor: selected
                        ? `${colors.primary}15`
                        : colors.surface,
                    },
                  ]}
                  onPress={() => setGender(item)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      color: selected
                        ? colors.primary
                        : colors.text,
                      fontWeight: selected
                        ? '700'
                        : '500',
                    }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </View>

        {/* ==================================
            PASSWORD
        =================================== */}

        <Text
          style={[
            styles.label,
            {
              color: colors.text,
            },
          ]}
        >
          Enter Password{' '}
          <Text style={styles.required}>*</Text>
        </Text>

        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.input,
              styles.passwordInput,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Password"
            placeholderTextColor={placeholderColor}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() =>
              setShowPassword(
                (previous) => !previous
              )
            }
            activeOpacity={0.7}
          >
            <Text
              style={{
                color: colors.primary,
                fontWeight: '600',
              }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={[
            styles.hintText,
            {
              color: colors.text,
              opacity: 0.7,
            },
          ]}
        >
          Password must contain a capital letter,
          lowercase letter, number, and special
          character.
        </Text>

        {/* ==================================
            ROLE
        =================================== */}

        <Text
          style={[
            styles.label,
            {
              color: colors.text,
              marginTop: 16,
            },
          ]}
        >
          Select A Role{' '}
          <Text style={styles.required}>*</Text>
        </Text>

        <View style={styles.roleContainer}>
          {/* DRIVER */}

          <TouchableOpacity
            style={[
              styles.roleCard,
              {
                borderColor:
                  role === 'Driver'
                    ? colors.primary
                    : colors.border,
                backgroundColor:
                  role === 'Driver'
                    ? `${colors.primary}15`
                    : colors.surface,
              },
            ]}
            onPress={() => setRole('Driver')}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.radioButton,
                {
                  borderColor:
                    role === 'Driver'
                      ? colors.primary
                      : colors.border,
                },
              ]}
            >
              {role === 'Driver' && (
                <View
                  style={[
                    styles.radioInner,
                    {
                      backgroundColor:
                        colors.primary,
                    },
                  ]}
                />
              )}
            </View>

            <Text
              style={[
                styles.roleText,
                {
                  color: colors.text,
                },
              ]}
            >
              Driver
            </Text>
          </TouchableOpacity>

          {/* CUSTOMER */}

          <TouchableOpacity
            style={[
              styles.roleCard,
              {
                borderColor:
                  role === 'Customer'
                    ? colors.primary
                    : colors.border,
                backgroundColor:
                  role === 'Customer'
                    ? `${colors.primary}15`
                    : colors.surface,
              },
            ]}
            onPress={() => setRole('Customer')}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.radioButton,
                {
                  borderColor:
                    role === 'Customer'
                      ? colors.primary
                      : colors.border,
                },
              ]}
            >
              {role === 'Customer' && (
                <View
                  style={[
                    styles.radioInner,
                    {
                      backgroundColor:
                        colors.primary,
                    },
                  ]}
                />
              )}
            </View>

            <Text
              style={[
                styles.roleText,
                {
                  color: colors.text,
                },
              ]}
            >
              Customer
            </Text>
          </TouchableOpacity>
        </View>

        {/* ==================================
            SIGN UP BUTTON
        =================================== */}

        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: colors.primary,
              opacity: isLoading ? 0.7 : 1,
            },
          ]}
          onPress={handleSignUp}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              Sign Up
            </Text>
          )}
        </TouchableOpacity>

        {/* ==================================
            SIGN IN REDIRECT
        =================================== */}

        <TouchableOpacity
          style={styles.loginRedirect}
          onPress={() => {
            router.push('/(auth)/sign-in');
          }}
          activeOpacity={0.7}
        >
          <Text
            style={{
              color: placeholderColor,
            }}
          >
            Already have an account?{' '}

            <Text
              style={{
                color: colors.primary,
                fontWeight: '700',
              }}
            >
              Log In
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },

  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 50,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },

  logo: {
    width: 110,
    height: 110,
    marginBottom: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  flexField: {
    flex: 1,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },

  required: {
    color: '#E53935',
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },

  phoneRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },

  countryCodePicker: {
    height: 48,
    width: 75,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  countryCodeText: {
    fontWeight: '600',
  },

  phoneInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },

  optionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },

  chipOption: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },

  passwordInput: {
    flex: 1,
    paddingRight: 70,
  },

  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 6,
  },

  hintText: {
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },

  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
    marginBottom: 24,
  },

  roleCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    gap: 10,
  },

  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  roleText: {
    fontSize: 15,
    fontWeight: '600',
  },

  submitButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  loginRedirect: {
    marginTop: 20,
    alignItems: 'center',
  },
});
