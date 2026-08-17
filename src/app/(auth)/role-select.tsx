import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';

type UserRole = 'Customer' | 'Driver';

export default function RoleSelectScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  /*
   * ThemeContext exposes:
   * - colors
   * - isDark
   *
   * It does NOT expose a "theme" object.
   */
  const { colors } = useTheme();

  const secondaryTextColor = colors.text;

  const [selectedRole, setSelectedRole] =
    useState<UserRole>('Customer');

  const handleContinue = (): void => {
    /*
     * The selected role is passed to sign-up.tsx through
     * Expo Router params.
     *
     * We intentionally do NOT call setRole() here because
     * AuthContext does not expose a setRole function.
     */
    router.push({
      pathname: '/(auth)/sign-up',
      params: {
        initialRole: selectedRole,
      },
    });
  };

  const handleSignIn = (): void => {
    router.push('/(auth)/sign-in');
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* =========================
            LOGO / HEADER
        ========================== */}
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
            {t(
              'auth.chooseProfile',
              'Choose Your Profile'
            )}
          </Text>

         <Text
  style={[
    styles.subtitle,
    {
      color: secondaryTextColor,
      opacity: 0.7,
    },
  ]}
>
            {t(
              'auth.chooseProfileDescription',
              'How would you like to use Spleaz today? Select a role to continue.'
            )}
          </Text>
        </View>

        {/* =========================
            ROLE CARDS
        ========================== */}
        <View style={styles.cardsContainer}>
          {/* CUSTOMER */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setSelectedRole('Customer')}
            accessibilityRole="button"
            accessibilityState={{
              selected: selectedRole === 'Customer',
            }}
            accessibilityLabel="Select Customer role"
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor:
                  selectedRole === 'Customer'
                    ? colors.primary
                    : colors.border,
                borderWidth:
                  selectedRole === 'Customer' ? 2 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.iconWrapper,
                {
                  backgroundColor:
                    selectedRole === 'Customer'
                      ? `${colors.primary}20`
                      : colors.background,
                },
              ]}
            >
              <Text
                style={styles.roleEmoji}
                accessibilityLabel="Customer"
              >
                👤
              </Text>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.headerRow}>
                <Text
                  style={[
                    styles.roleTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {t('roles.customer', 'Customer')}
                </Text>

                <View
                  style={[
                    styles.radioCircle,
                    {
                      borderColor:
                        selectedRole === 'Customer'
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                >
                  {selectedRole === 'Customer' && (
                    <View
                      style={[
                        styles.radioDot,
                        {
                          backgroundColor:
                            colors.primary,
                        },
                      ]}
                    />
                  )}
                </View>
              </View>

              <Text
                style={[
                  styles.roleDescription,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {t(
                  'roles.customerDescription',
                  'Book rides easily, request parcel deliveries, and enjoy reliable rides around town.'
                )}
              </Text>
            </View>
          </TouchableOpacity>

          {/* DRIVER */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setSelectedRole('Driver')}
            accessibilityRole="button"
            accessibilityState={{
              selected: selectedRole === 'Driver',
            }}
            accessibilityLabel="Select Driver role"
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor:
                  selectedRole === 'Driver'
                    ? colors.primary
                    : colors.border,
                borderWidth:
                  selectedRole === 'Driver' ? 2 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.iconWrapper,
                {
                  backgroundColor:
                    selectedRole === 'Driver'
                      ? `${colors.primary}20`
                      : colors.background,
                },
              ]}
            >
              <Text
                style={styles.roleEmoji}
                accessibilityLabel="Driver"
              >
                🚘
              </Text>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.headerRow}>
                <Text
                  style={[
                    styles.roleTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {t('roles.driver', 'Driver')}
                </Text>

                <View
                  style={[
                    styles.radioCircle,
                    {
                      borderColor:
                        selectedRole === 'Driver'
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                >
                  {selectedRole === 'Driver' && (
                    <View
                      style={[
                        styles.radioDot,
                        {
                          backgroundColor:
                            colors.primary,
                        },
                      ]}
                    />
                  )}
                </View>
              </View>

              <Text
                style={[
                  styles.roleDescription,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {t(
                  'roles.driverDescription',
                  'Drive and earn money on your schedule. Accept trips and delivery requests seamlessly.'
                )}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* =========================
            CONTINUE BUTTON
        ========================== */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleContinue}
          accessibilityRole="button"
          accessibilityLabel={`Continue as ${selectedRole}`}
          style={[
            styles.continueButton,
            {
              backgroundColor: colors.primary,
            },
          ]}
        >
          <Text style={styles.continueButtonText}>
            {t(
              'auth.continueAs',
              `Continue as ${selectedRole}`
            )}
          </Text>
        </TouchableOpacity>

        {/* =========================
            SIGN-IN LINK
        ========================== */}
        <TouchableOpacity
          style={styles.signInLink}
          onPress={handleSignIn}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
        >
          <Text
            style={{
              color: colors.text,
            }}
          >
            {t(
              'auth.alreadyHaveAccount',
              'Already have an account?'
            )}{' '}
            <Text
              style={{
                color: colors.primary,
                fontWeight: '700',
              }}
            >
              {t('auth.signIn', 'Sign In')}
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// =====================================
// STYLES
// =====================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'center',
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },

  logo: {
    width: 110,
    height: 110,
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 20,
  },

  cardsContainer: {
    gap: 16,
    marginBottom: 32,
  },

  card: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',

    elevation: 1,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },

  iconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  roleEmoji: {
    fontSize: 26,
  },

  cardContent: {
    flex: 1,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  roleTitle: {
    fontSize: 17,
    fontWeight: '700',
  },

  roleDescription: {
    fontSize: 12,
    lineHeight: 17,
  },

  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  continueButton: {
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

  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  signInLink: {
    marginTop: 20,
    alignItems: 'center',
  },
});