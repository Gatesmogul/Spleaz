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

type VehicleData = {
  type: string;
  color: string;
  licensePlate: string;
};

type SignUpPayload = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: 'customer' | 'driver';
  country: string;
  state: string;
  city: string;
  gender: Gender;
  vehicle?: VehicleData;
};

export default function SignUpScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const placeholderColor = isDark
    ? '#9CA3AF'
    : '#6B7280';

  // =========================================================
  // PERSONAL INFORMATION
  // =========================================================

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // =========================================================
  // LOCATION
  // =========================================================

  const [countryOfResidence, setCountryOfResidence] =
    useState('Nigeria');

  const [stateOfResidence, setStateOfResidence] =
    useState('Lagos');

  const [cityOfResidence, setCityOfResidence] =
    useState('');

  // =========================================================
  // ACCOUNT INFORMATION
  // =========================================================

  const [email, setEmail] = useState('');
  const [gender, setGender] =
    useState<Gender>('Male');

  const [password, setPassword] = useState('');

  // =========================================================
  // ROLE
  // =========================================================

  const [role, setRole] =
    useState<Role>('Customer');

  // =========================================================
  // DRIVER / VEHICLE INFORMATION
  // =========================================================

  const [vehicle, setVehicle] = useState('');
  const [carColor, setCarColor] = useState('');
  const [licensePlate, setLicensePlate] =
    useState('');

  // =========================================================
  // UI STATE
  // =========================================================

  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  // =========================================================
  // CONSTANTS
  // =========================================================

  const selectedCountryCode = '+234';

  // =========================================================
  // PASSWORD VALIDATION
  // =========================================================

  const validatePassword = (
    value: string
  ): boolean => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      value
    );
  };

  // =========================================================
  // ROLE CHANGE
  // =========================================================

  const handleRoleChange = (
    newRole: Role
  ): void => {
    setRole(newRole);

    // Clear driver information when switching
    // back to Customer.
    if (newRole === 'Customer') {
      setVehicle('');
      setCarColor('');
      setLicensePlate('');
    }
  };

  // =========================================================
  // PHONE NORMALIZATION
  // =========================================================
  //
  // Examples:
  //
  // 08012345678 -> +2348012345678
  // 8012345678  -> +2348012345678
  // +2348012345678 -> +2348012345678
  //
  // The backend accepts this through `phoneNumber`.
  // =========================================================

  const normalizePhoneNumber = (
    value: string
  ): string => {
    let cleaned = value
      .trim()
      .replace(/\s+/g, '')
      .replace(/-/g, '')
      .replace(/\(/g, '')
      .replace(/\)/g, '');

    if (cleaned.startsWith('+234')) {
      return cleaned;
    }

    if (cleaned.startsWith('234')) {
      return `+${cleaned}`;
    }

    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    return `${selectedCountryCode}${cleaned}`;
  };

  // =========================================================
  // SIGN UP
  // =========================================================

  const handleSignUp = async (): Promise<void> => {
    // -------------------------------------------------------
    // TRIMMED VALUES
    // -------------------------------------------------------

    const trimmedFirstName =
      firstName.trim();

    const trimmedLastName =
      lastName.trim();

    const trimmedEmail =
      email.trim().toLowerCase();

    const trimmedCountry =
      countryOfResidence.trim();

    const trimmedState =
      stateOfResidence.trim();

    const trimmedCity =
      cityOfResidence.trim();

    const cleanedPhone =
      phone
        .trim()
        .replace(/\s+/g, '')
        .replace(/-/g, '')
        .replace(/\(/g, '')
        .replace(/\)/g, '');

    // -------------------------------------------------------
    // BASIC VALIDATION
    // -------------------------------------------------------

    if (
      !trimmedFirstName ||
      !trimmedLastName ||
      !cleanedPhone ||
      !trimmedEmail ||
      !trimmedCountry ||
      !trimmedState ||
      !trimmedCity ||
      !password
    ) {
      Alert.alert(
        t(
          'common.error',
          'Error'
        ),
        t(
          'auth.fillAllFields',
          'Please fill in all required fields.'
        )
      );

      return;
    }

    // -------------------------------------------------------
    // EMAIL VALIDATION
    // -------------------------------------------------------

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        trimmedEmail
      )
    ) {
      Alert.alert(
        t(
          'common.error',
          'Error'
        ),
        t(
          'auth.invalidEmail',
          'Please enter a valid email address.'
        )
      );

      return;
    }

    // -------------------------------------------------------
    // PHONE VALIDATION
    // -------------------------------------------------------

    if (!/^\+?\d{7,15}$/.test(cleanedPhone)) {
      Alert.alert(
        t(
          'common.error',
          'Error'
        ),
        'Please enter a valid phone number.'
      );

      return;
    }

    // -------------------------------------------------------
    // PASSWORD VALIDATION
    // -------------------------------------------------------

    if (!validatePassword(password)) {
      Alert.alert(
        t(
          'auth.weakPasswordTitle',
          'Password Too Weak'
        ),
        t(
          'auth.weakPasswordMsg',
          'Password must contain at least 8 characters, including uppercase, lowercase, number and special character.'
        )
      );

      return;
    }

    // -------------------------------------------------------
    // DRIVER VALIDATION
    // -------------------------------------------------------

    if (role === 'Driver') {
      if (
        !vehicle.trim() ||
        !carColor.trim() ||
        !licensePlate.trim()
      ) {
        Alert.alert(
          t(
            'common.error',
            'Error'
          ),
          'Vehicle, car colour and license plate are required when registering as a Driver.'
        );

        return;
      }
    }

    // -------------------------------------------------------
    // PREVENT DOUBLE SUBMISSION
    // -------------------------------------------------------

    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      // =====================================================
      // BACKEND ROLE
      // =====================================================
      //
      // Customer -> customer
      // Driver   -> driver
      //
      // Admin is intentionally NOT available here.
      // =====================================================

      const backendRole:
        | 'customer'
        | 'driver' =
        role === 'Driver'
          ? 'driver'
          : 'customer';

      // =====================================================
      // FULL NAME
      // =====================================================

      const fullName =
        `${trimmedFirstName} ${trimmedLastName}`;

      // =====================================================
      // PHONE
      // =====================================================

      const normalizedPhone =
        normalizePhoneNumber(phone);

      // =====================================================
      // VEHICLE DATA
      // =====================================================
      //
      // The backend controller expects:
      //
      // vehicle: {
      //   type,
      //   color,
      //   licensePlate
      // }
      //
      // Customers do NOT receive a vehicle object.
      // =====================================================

      const vehicleData: VehicleData | undefined =
        role === 'Driver'
          ? {
              type: vehicle.trim(),
              color: carColor.trim(),
              licensePlate:
                licensePlate
                  .trim()
                  .toUpperCase(),
            }
          : undefined;

      // =====================================================
      // REQUEST PAYLOAD
      // =====================================================

      const payload: SignUpPayload = {
        fullName,
        email: trimmedEmail,
        phoneNumber: normalizedPhone,
        password,
        role: backendRole,
        country: trimmedCountry,
        state: trimmedState,
        city: trimmedCity,
        gender,
        ...(vehicleData
          ? {
              vehicle: vehicleData,
            }
          : {}),
      };

      console.log(
        '[Spleaz/Register] Sending registration request'
      );

      console.log(
        '[Spleaz/Register] Role:',
        payload.role
      );

      console.log(
        '[Spleaz/Register] Email:',
        payload.email
      );

      console.log(
        '[Spleaz/Register] Phone:',
        payload.phoneNumber
      );

      // =====================================================
      // API REQUEST
      // =====================================================

      const response =
        await authApi.signUp(payload);

      console.log(
        '[Spleaz/Register] Registration successful:',
        response?.data
      );

      // =====================================================
      // SUCCESS MESSAGE
      // =====================================================

      const successMessage =
        role === 'Driver'
          ? 'Your Driver account has been created successfully. You can now sign in.'
          : 'Your Customer account has been created successfully. You can now sign in.';

      Alert.alert(
        t(
          'auth.accountCreatedTitle',
          'Account Created'
        ),
        successMessage,
        [
          {
            text: t(
              'common.ok',
              'OK'
            ),
            onPress: () => {
              router.replace(
                '/(auth)/sign-in'
              );
            },
          },
        ]
      );
    } catch (error: unknown) {
      console.error(
        '[Spleaz/Register] Registration failed:',
        error
      );

      // Axios-style error handling without
      // using `any`.
      const apiError =
        error as {
          response?: {
            status?: number;
            data?: {
              message?: string;
              error?: string;
              success?: boolean;
            };
          };
          message?: string;
        };

      console.error(
        '[Spleaz/Register] Server response:',
        apiError?.response?.data
      );

      const status =
        apiError?.response?.status;

      const serverMessage =
        apiError?.response?.data?.message ||
        apiError?.response?.data?.error;

      // -----------------------------------------------------
      // SPECIFIC SERVER ERRORS
      // -----------------------------------------------------

      if (status === 409) {
        Alert.alert(
          'Account Already Exists',
          serverMessage ||
            'A user with this email or phone number already exists.'
        );

        return;
      }

      if (status === 400) {
        Alert.alert(
          t(
            'common.error',
            'Error'
          ),
          serverMessage ||
            'Please check your registration information and try again.'
        );

        return;
      }

      if (status === 500) {
        Alert.alert(
          'Server Error',
          'The server encountered an error while creating your account. Please try again shortly.'
        );

        return;
      }

      // -----------------------------------------------------
      // NETWORK / UNKNOWN ERROR
      // -----------------------------------------------------

      Alert.alert(
        t(
          'common.error',
          'Error'
        ),
        serverMessage ||
          apiError?.message ||
          'Registration failed. Please check your internet connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // COMMON INPUT STYLE
  // =========================================================

  const inputStyle = [
    styles.input,
    {
      backgroundColor:
        colors.surface,
      color: colors.text,
      borderColor:
        colors.border,
    },
  ];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <KeyboardAvoidingView
      style={
        styles.keyboardContainer
      }
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
            backgroundColor:
              colors.background,
          },
        ]}
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* =================================================
            LOGO / HEADER
        ================================================= */}

        <View
          style={styles.logoContainer}
        >
          <Image
            source={require('../../../assets/Spleaz_App_Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text
            style={[
              styles.title,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Sign Up With Spleaz
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color:
                  colors.textMuted,
              },
            ]}
          >
            Create your Spleaz account
          </Text>
        </View>

        {/* =================================================
            FIRST NAME / LAST NAME
        ================================================= */}

        <View style={styles.row}>
          <View
            style={styles.flexField}
          >
            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              First Name{' '}
              <Text
                style={styles.required}
              >
                *
              </Text>
            </Text>

            <TextInput
              style={inputStyle}
              placeholder="First Name"
              placeholderTextColor={
                placeholderColor
              }
              value={firstName}
              onChangeText={
                setFirstName
              }
              autoCapitalize="words"
              autoCorrect={false}
              editable={!isLoading}
              returnKeyType="next"
            />
          </View>

          <View
            style={styles.flexField}
          >
            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Last Name{' '}
              <Text
                style={styles.required}
              >
                *
              </Text>
            </Text>

            <TextInput
              style={inputStyle}
              placeholder="Last Name"
              placeholderTextColor={
                placeholderColor
              }
              value={lastName}
              onChangeText={
                setLastName
              }
              autoCapitalize="words"
              autoCorrect={false}
              editable={!isLoading}
              returnKeyType="next"
            />
          </View>
        </View>

        {/* =================================================
            PHONE NUMBER
        ================================================= */}

        <Text
          style={[
            styles.label,
            {
              color:
                colors.text,
            },
          ]}
        >
          Phone Number{' '}
          <Text
            style={styles.required}
          >
            *
          </Text>
        </Text>

        <View
          style={styles.phoneRow}
        >
          <View
            style={[
              styles.countryCodePicker,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.countryCodeText,
                {
                  color:
                    colors.text,
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
                backgroundColor:
                  colors.surface,
                color:
                  colors.text,
                borderColor:
                  colors.border,
              },
            ]}
            placeholder="08012345678"
            placeholderTextColor={
              placeholderColor
            }
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            autoCorrect={false}
            editable={!isLoading}
            returnKeyType="next"
          />
        </View>

        {/* =================================================
            COUNTRY / STATE
        ================================================= */}

        <View style={styles.row}>
          <View
            style={styles.flexField}
          >
            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Country{' '}
              <Text
                style={styles.required}
              >
                *
              </Text>
            </Text>

            <TextInput
              style={inputStyle}
              value={
                countryOfResidence
              }
              onChangeText={
                setCountryOfResidence
              }
              placeholder="Nigeria"
              placeholderTextColor={
                placeholderColor
              }
              autoCapitalize="words"
              editable={!isLoading}
            />
          </View>

          <View
            style={styles.flexField}
          >
            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              State/Province{' '}
              <Text
                style={styles.required}
              >
                *
              </Text>
            </Text>

            <TextInput
              style={inputStyle}
              value={
                stateOfResidence
              }
              onChangeText={
                setStateOfResidence
              }
              placeholder="Lagos"
              placeholderTextColor={
                placeholderColor
              }
              autoCapitalize="words"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* =================================================
            CITY / EMAIL
        ================================================= */}

        <View style={styles.row}>
          <View
            style={styles.flexField}
          >
            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              City{' '}
              <Text
                style={styles.required}
              >
                *
              </Text>
            </Text>

            <TextInput
              style={inputStyle}
              placeholder="e.g. Ikeja"
              placeholderTextColor={
                placeholderColor
              }
              value={
                cityOfResidence
              }
              onChangeText={
                setCityOfResidence
              }
              autoCapitalize="words"
              autoCorrect={false}
              editable={!isLoading}
              returnKeyType="next"
            />
          </View>

          <View
            style={styles.flexField}
          >
            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Email Address{' '}
              <Text
                style={styles.required}
              >
                *
              </Text>
            </Text>

            <TextInput
              style={inputStyle}
              placeholder="user@example.com"
              placeholderTextColor={
                placeholderColor
              }
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              returnKeyType="next"
            />
          </View>
        </View>

        {/* =================================================
            GENDER
        ================================================= */}

        <Text
          style={[
            styles.label,
            {
              color:
                colors.text,
            },
          ]}
        >
          Gender{' '}
          <Text
            style={styles.required}
          >
            *
          </Text>
        </Text>

        <View
          style={styles.optionRow}
        >
          {(
            [
              'Male',
              'Female',
              'Other',
            ] as const
          ).map((item) => {
            const selected =
              gender === item;

            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.chipOption,
                  {
                    borderColor:
                      selected
                        ? colors.primary
                        : colors.border,
                    backgroundColor:
                      selected
                        ? `${colors.primary}15`
                        : colors.surface,
                  },
                ]}
                onPress={() =>
                  setGender(item)
                }
                activeOpacity={0.8}
                disabled={
                  isLoading
                }
              >
                <Text
                  style={{
                    color:
                      selected
                        ? colors.primary
                        : colors.text,
                    fontWeight:
                      selected
                        ? '700'
                        : '500',
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* =================================================
            PASSWORD
        ================================================= */}

        <Text
          style={[
            styles.label,
            {
              color:
                colors.text,
            },
          ]}
        >
          Enter Password{' '}
          <Text
            style={styles.required}
          >
            *
          </Text>
        </Text>

        <View
          style={
            styles.passwordContainer
          }
        >
          <TextInput
            style={[
              ...inputStyle,
              styles.passwordInput,
            ]}
            placeholder="Password"
            placeholderTextColor={
              placeholderColor
            }
            secureTextEntry={
              !showPassword
            }
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
            returnKeyType="done"
          />

          <TouchableOpacity
            style={
              styles.eyeButton
            }
            onPress={() =>
              setShowPassword(
                (previous) =>
                  !previous
              )
            }
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Text
              style={{
                color:
                  colors.primary,
                fontWeight:
                  '600',
              }}
            >
              {showPassword
                ? 'Hide'
                : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={[
            styles.hintText,
            {
              color:
                colors.text,
            },
          ]}
        >
          Password must contain at
          least 8 characters with a
          capital letter, lowercase
          letter, number, and special
          character.
        </Text>

        {/* =================================================
            ROLE
        ================================================= */}

        <Text
          style={[
            styles.label,
            {
              color:
                colors.text,
              marginTop: 16,
            },
          ]}
        >
          Select A Role{' '}
          <Text
            style={styles.required}
          >
            *
          </Text>
        </Text>

        <View
          style={styles.roleContainer}
        >
          {/* =================================================
              CUSTOMER
          ================================================= */}

          <TouchableOpacity
            style={[
              styles.roleCard,
              {
                borderColor:
                  role ===
                  'Customer'
                    ? colors.primary
                    : colors.border,
                backgroundColor:
                  role ===
                  'Customer'
                    ? `${colors.primary}15`
                    : colors.surface,
              },
            ]}
            onPress={() =>
              handleRoleChange(
                'Customer'
              )
            }
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <View
              style={[
                styles.radioButton,
                {
                  borderColor:
                    role ===
                    'Customer'
                      ? colors.primary
                      : colors.border,
                },
              ]}
            >
              {role ===
                'Customer' && (
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
                  color:
                    colors.text,
                },
              ]}
            >
              Customer
            </Text>
          </TouchableOpacity>

          {/* =================================================
              DRIVER
          ================================================= */}

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
            onPress={() =>
              handleRoleChange(
                'Driver'
              )
            }
            activeOpacity={0.8}
            disabled={isLoading}
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
              {role ===
                'Driver' && (
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
                  color:
                    colors.text,
                },
              ]}
            >
              Driver
            </Text>
          </TouchableOpacity>
        </View>

        {/* =================================================
            DRIVER VEHICLE INFORMATION
        ================================================= */}

        {role === 'Driver' && (
          <View
            style={[
              styles.driverSection,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.driverSectionTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Driver Vehicle
              Information
            </Text>

            <Text
              style={[
                styles.driverSectionSubtitle,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              Please provide your
              vehicle details to
              register as a Spleaz
              Driver.
            </Text>

            {/* =================================================
                VEHICLE
            ================================================= */}

            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Vehicle{' '}
              <Text
                style={
                  styles.required
                }
              >
                *
              </Text>
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    colors.background,
                  color:
                    colors.text,
                  borderColor:
                    colors.border,
                },
              ]}
              placeholder="e.g. Toyota Corolla"
              placeholderTextColor={
                placeholderColor
              }
              value={vehicle}
              onChangeText={setVehicle}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!isLoading}
            />

            {/* =================================================
                CAR COLOUR
            ================================================= */}

            <Text
              style={[
                styles.label,
                styles.driverFieldLabel,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Car Colour{' '}
              <Text
                style={
                  styles.required
                }
              >
                *
              </Text>
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    colors.background,
                  color:
                    colors.text,
                  borderColor:
                    colors.border,
                },
              ]}
              placeholder="e.g. Black"
              placeholderTextColor={
                placeholderColor
              }
              value={carColor}
              onChangeText={
                setCarColor
              }
              autoCapitalize="words"
              autoCorrect={false}
              editable={!isLoading}
            />

            {/* =================================================
                LICENSE PLATE
            ================================================= */}

            <Text
              style={[
                styles.label,
                styles.driverFieldLabel,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              License Plate{' '}
              <Text
                style={
                  styles.required
                }
              >
                *
              </Text>
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    colors.background,
                  color:
                    colors.text,
                  borderColor:
                    colors.border,
                },
              ]}
              placeholder="e.g. ABC-123XY"
              placeholderTextColor={
                placeholderColor
              }
              value={
                licensePlate
              }
              onChangeText={
                setLicensePlate
              }
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!isLoading}
            />

            <Text
              style={[
                styles.vehicleHint,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              All vehicle information
              is required for Driver
              registration.
            </Text>
          </View>
        )}

        {/* =================================================
            SIGN UP BUTTON
        ================================================= */}

        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor:
                colors.primary,
              opacity:
                isLoading
                  ? 0.7
                  : 1,
            },
          ]}
          onPress={
            handleSignUp
          }
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={
                styles.submitButtonText
              }
            >
              Sign Up
            </Text>
          )}
        </TouchableOpacity>

        {/* =================================================
            SIGN IN REDIRECT
        ================================================= */}

        <TouchableOpacity
          style={
            styles.loginRedirect
          }
          onPress={() => {
            router.push(
              '/(auth)/sign-in'
            );
          }}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          <Text
            style={{
              color:
                placeholderColor,
            }}
          >
            Already have an
            account?{' '}

            <Text
              style={{
                color:
                  colors.primary,
                fontWeight:
                  '700',
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

// ===========================================================
// STYLES
// ===========================================================

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

  subtitle: {
    fontSize: 13,
    marginTop: 5,
    textAlign: 'center',
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

  // =========================================================
  // DRIVER SECTION
  // =========================================================

  driverSection: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },

  driverSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },

  driverSectionSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 16,
  },

  driverFieldLabel: {
    marginTop: 14,
  },

  vehicleHint: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 6,
  },

  // =========================================================
  // SUBMIT BUTTON
  // =========================================================

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

  // =========================================================
  // LOGIN REDIRECT
  // =========================================================

  loginRedirect: {
    marginTop: 20,
    alignItems: 'center',
  },
});
