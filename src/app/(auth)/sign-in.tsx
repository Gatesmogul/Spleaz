import authApi from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';
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

type UserRole = 'Customer' | 'Driver';

type BackendRole = 'customer' | 'driver' | 'admin';

export default function SignInScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Customer');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  /**
   * Convert the frontend role to the exact role
   * used by the backend/database.
   */
  const getBackendRole = (selectedRole: UserRole): 'customer' | 'driver' => {
    return selectedRole === 'Driver' ? 'driver' : 'customer';
  };

  const handleSignIn = async (): Promise<void> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      Alert.alert(
        t('common.error', 'Error'),
        t(
          'auth.enterEmailAndPassword',
          'Please enter both your registered email and password.'
        )
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.signIn({
        email: normalizedEmail,
        password,
      });

      /**
       * Backend response:
       *
       * data: {
       *   user: {...},
       *   token: "..."
       * }
       */
      const user = response.data.user;

      if (!user) {
        throw new Error('User information was not returned by the server.');
      }

      /**
       * Backend stores:
       * customer
       * driver
       * admin
       *
       * We normalize the response to lowercase.
       */
      const backendRole = String(user.role || '')
        .trim()
        .toLowerCase() as BackendRole;

      /**
       * The selected frontend role must match
       * the role stored in the backend.
       */
      const expectedRole = getBackendRole(role);

      if (backendRole !== expectedRole) {
        const registeredRole =
          backendRole === 'driver'
            ? 'Driver'
            : backendRole === 'customer'
              ? 'Customer'
              : 'Admin';

        Alert.alert(
          t('common.error', 'Error'),
          `This account is registered as ${registeredRole}. Please select ${registeredRole} to continue.`
        );

        return;
      }

      /**
       * Keep the role format consistent with the rest
       * of the application.
       *
       * IMPORTANT:
       * RIDER has been removed.
       */
      const normalizedUser = {
        id: String(user.id),
        name: user.fullName || '',
        email: user.email || normalizedEmail,
        phoneNumber: user.phoneNumber || '',
        role: backendRole,
        avatarUrl: user.avatarUrl || '',
        country: user.country || '',
        state: user.state || '',
        city: user.city || '',
        isVerified: user.isVerified !== false,
      };

      /**
       * Save authentication information.
       */
      await login(response.data.token, normalizedUser);

      /**
       * Send the user to the correct dashboard.
       */
      if (backendRole === 'driver') {
        router.replace('/(driver)/(drawer)');
      } else {
        router.replace('/(customer)/(drawer)');
      }
    } catch (error: any) {
      console.error('Spleaz sign-in error:', error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        t(
          'auth.invalidCredentials',
          'Incorrect email or password.'
        );

      Alert.alert(
        t('common.error', 'Error'),
        message
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (): Promise<void> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      Alert.alert(
        t('auth.emailRequiredTitle', 'Email Required'),
        t(
          'auth.emailRequiredForReset',
          'Please enter your registered email address first.'
        )
      );
      return;
    }

    setIsResettingPassword(true);

    try {
      await authApi.forgotPassword({
        email: normalizedEmail,
      });

      Alert.alert(
        t('auth.resetSentTitle', 'Password Reset'),
        t(
          'auth.resetSentMsg',
          'If the account exists, password reset instructions have been generated.'
        )
      );
    } catch (error: any) {
      console.error(
        'Spleaz forgot password error:',
        error
      );

      Alert.alert(
        t('common.error', 'Error'),
        error?.response?.data?.message ||
          'Unable to start password reset.'
      );
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleRegister = (): void => {
    router.push('/(auth)/sign-up');
  };

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
        {/* =====================================
            LOGO + HEADER
        ====================================== */}

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
            Sign In to Spleaz
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textMuted,
              },
            ]}
          >
            Welcome back! Please enter your details.
          </Text>
        </View>

        {/* =====================================
            EMAIL
        ====================================== */}

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
          placeholder="Enter registered email"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
        />

        {/* =====================================
            ROLE
        ====================================== */}

        <Text
          style={[
            styles.label,
            styles.roleLabel,
            {
              color: colors.text,
            },
          ]}
        >
          Select Role{' '}
          <Text style={styles.required}>*</Text>
        </Text>

        <View style={styles.roleContainer}>
          {/* CUSTOMER */}

          <TouchableOpacity
            activeOpacity={0.8}
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
            disabled={isLoading}
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

          {/* DRIVER */}

          <TouchableOpacity
            activeOpacity={0.8}
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
        </View>

        {/* =====================================
            PASSWORD
        ====================================== */}

        <Text
          style={[
            styles.label,
            {
              color: colors.text,
            },
          ]}
        >
          Password{' '}
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
            placeholder="Enter password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            textContentType="password"
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.eyeButton}
            onPress={() =>
              setShowPassword(
                previous => !previous
              )
            }
            disabled={isLoading}
          >
            <Text
              style={[
                styles.eyeText,
                {
                  color: colors.primary,
                },
              ]}
            >
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* =====================================
            FORGOT PASSWORD
        ====================================== */}

        <View style={styles.forgotPasswordRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleForgotPassword}
            disabled={
              isResettingPassword || isLoading
            }
          >
            <Text
              style={[
                styles.forgotPasswordText,
                {
                  color: colors.primary,
                },
              ]}
            >
              {isResettingPassword
                ? 'Sending Link...'
                : 'Forgot Password?'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* =====================================
            SIGN IN BUTTON
        ====================================== */}

        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.signInButton,
            {
              backgroundColor: colors.primary,
              opacity: isLoading ? 0.7 : 1,
            },
          ]}
          onPress={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.signInButtonText}>
              Sign In
            </Text>
          )}
        </TouchableOpacity>

        {/* =====================================
            SIGN UP
        ====================================== */}

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.signUpRedirect}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text
            style={{
              color: colors.textMuted,
            }}
          >
            Don't have an account?{' '}

            <Text
              style={{
                color: colors.primary,
                fontWeight: '700',
              }}
            >
              Sign Up
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
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 50,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },

  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },

  roleLabel: {
    marginTop: 16,
  },

  required: {
    color: '#E53935',
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
  },

  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
    marginBottom: 16,
  },

  roleCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
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

  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },

  passwordInput: {
    flex: 1,
    paddingRight: 75,
  },

  eyeButton: {
    position: 'absolute',
    right: 14,
    padding: 6,
  },

  eyeText: {
    fontWeight: '600',
  },

  forgotPasswordRow: {
    alignItems: 'flex-end',
    marginTop: 10,
    marginBottom: 24,
  },

  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '600',
  },

  signInButton: {
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

  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  signUpRedirect: {
    marginTop: 24,
    alignItems: 'center',
  },
});
