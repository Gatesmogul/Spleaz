import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

// ============================================================
// AVAILABLE LANGUAGES
// ============================================================

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'yo', name: 'Yoruba', native: 'Yorùbá' },
  { code: 'ha', name: 'Hausa', native: 'Hausa' },
  { code: 'ig', name: 'Igbo', native: 'Asụsụ Igbo' },
];

export default function CustomerProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  // ==========================================================
  // THEME
  // ==========================================================

  const { colors, isDark, setThemeMode } = useTheme();

  // ==========================================================
  // LANGUAGE
  // ==========================================================

  const { currentLanguage, changeLanguage } = useLanguage();

  // ==========================================================
  // AUTH
  // ==========================================================

  const { user, logout, updateUserProfile } = useAuth();

  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [isEditing, setIsEditing] = useState(false);

  const [firstName, setFirstName] = useState(
    user?.name?.split(' ')[0] || 'Adebayo'
  );

  const [lastName, setLastName] = useState(
    user?.name?.split(' ')[1] || 'Ogunlesi'
  );

  const [email, setEmail] = useState(
    user?.email || 'adebayo.o@example.com'
  );

  const [phone, setPhone] = useState(
    user?.phoneNumber || '+234 801 234 5678'
  );

  const [profilePhoto, setProfilePhoto] = useState(
    user?.avatarUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'
  );

  // ==========================================================
  // PREFERENCES
  // ==========================================================

  const [pushNotifications, setPushNotifications] = useState(true);

  const [isLanguageModalVisible, setIsLanguageModalVisible] =
    useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // ==========================================================
  // LANGUAGE DISPLAY
  // ==========================================================

  const selectedLangObj =
    LANGUAGES.find((language) => language.code === currentLanguage) ||
    LANGUAGES[0];

  // ==========================================================
  // SAVE PROFILE
  // ==========================================================

  const handleSaveProfile = () => {
    setIsLoading(true);

    void updateUserProfile({
      name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      email: email.trim(),
      phoneNumber: phone.trim(),
      avatarUrl: profilePhoto,
    });
    setIsLoading(false);
    setIsEditing(false);

      Alert.alert(
        t('common.success', 'Success'),
        t(
          'profile.updateSuccess',
          'Your profile details have been successfully updated.'
        )
      );
  };

  // ==========================================================
  // TOGGLE DARK MODE
  // ==========================================================

  const handleToggleTheme = async (value: boolean) => {
    try {
      await setThemeMode(value ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to change theme:', error);
    }
  };

  // ==========================================================
  // SIGN OUT
  // ==========================================================

  const handleSignOut = () => {
    Alert.alert(
      t('auth.signOutTitle', 'Sign Out'),
      t(
        'auth.signOutConfirm',
        'Are you sure you want to log out of Spleaz?'
      ),
      [
        {
          text: t('common.cancel', 'Cancel'),
          style: 'cancel',
        },
        {
          text: t('auth.signOut', 'Sign Out'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();

              router.replace('/(auth)/sign-in');
            } catch (error) {
              console.error('Sign out error:', error);

              Alert.alert(
                t('common.error', 'Error'),
                t(
                  'auth.signOutError',
                  'Unable to sign out. Please try again.'
                )
              );
            }
          },
        },
      ]
    );
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ==================================================
            PROFILE HEADER
        =================================================== */}

        <View style={styles.headerCard}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: profilePhoto }}
              style={styles.avatar}
            />

            <TouchableOpacity
              style={[
                styles.cameraBadge,
                {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() =>
                Alert.alert(
                  'Change Photo',
                  'Select an option to update your profile picture.',
                  [
                    {
                      text: 'Take Photo',
                      onPress: () => {},
                    },
                    {
                      text: 'Choose from Gallery',
                      onPress: () => {},
                    },
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                  ]
                )
              }
              activeOpacity={0.8}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 12,
                }}
              >
                📷
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.profileName,
              {
                color: colors.text,
              },
            ]}
          >
            {firstName} {lastName}
          </Text>

          <Text
            style={[
              styles.profileEmail,
              {
                color: colors.subtext,
              },
            ]}
          >
            {email}
          </Text>

          {!isEditing ? (
            <TouchableOpacity
              style={[
                styles.editButton,
                {
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setIsEditing(true)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.editButtonText,
                  {
                    color: colors.primary,
                  },
                ]}
              >
                Edit Profile
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: colors.primary,
                  opacity: isLoading ? 0.7 : 1,
                },
              ]}
              onPress={handleSaveProfile}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator
                  color="#FFFFFF"
                  size="small"
                />
              ) : (
                <Text style={styles.saveButtonText}>
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* ==================================================
            PERSONAL DETAILS
        =================================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.subtext,
            },
          ]}
        >
          PERSONAL DETAILS
        </Text>

        <View
          style={[
            styles.cardGroup,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* First Name */}

          <View style={styles.inputRow}>
            <Text
              style={[
                styles.inputLabel,
                {
                  color: colors.subtext,
                },
              ]}
            >
              First Name
            </Text>

            <TextInput
              style={[
                styles.inputVal,
                {
                  color: colors.text,
                },
              ]}
              value={firstName}
              onChangeText={setFirstName}
              editable={isEditing}
              placeholderTextColor={colors.subtext}
            />
          </View>

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
              },
            ]}
          />

          {/* Last Name */}

          <View style={styles.inputRow}>
            <Text
              style={[
                styles.inputLabel,
                {
                  color: colors.subtext,
                },
              ]}
            >
              Last Name
            </Text>

            <TextInput
              style={[
                styles.inputVal,
                {
                  color: colors.text,
                },
              ]}
              value={lastName}
              onChangeText={setLastName}
              editable={isEditing}
              placeholderTextColor={colors.subtext}
            />
          </View>

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
              },
            ]}
          />

          {/* Email */}

          <View style={styles.inputRow}>
            <Text
              style={[
                styles.inputLabel,
                {
                  color: colors.subtext,
                },
              ]}
            >
              Email
            </Text>

            <TextInput
              style={[
                styles.inputVal,
                {
                  color: colors.text,
                },
              ]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={isEditing}
              placeholderTextColor={colors.subtext}
            />
          </View>

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
              },
            ]}
          />

          {/* Phone */}

          <View style={styles.inputRow}>
            <Text
              style={[
                styles.inputLabel,
                {
                  color: colors.subtext,
                },
              ]}
            >
              Phone
            </Text>

            <TextInput
              style={[
                styles.inputVal,
                {
                  color: colors.text,
                },
              ]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={isEditing}
              placeholderTextColor={colors.subtext}
            />
          </View>
        </View>

        {/* ==================================================
            PREFERENCES
        =================================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.subtext,
            },
          ]}
        >
          PREFERENCES
        </Text>

        <View
          style={[
            styles.cardGroup,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* LANGUAGE */}

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setIsLanguageModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🌐</Text>

              <Text
                style={[
                  styles.settingText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                App Language
              </Text>
            </View>

            <View style={styles.settingRight}>
              <Text
                style={[
                  styles.settingSub,
                  {
                    color: colors.primary,
                  },
                ]}
              >
                {selectedLangObj.native}
              </Text>

              <Text
                style={{
                  color: colors.subtext,
                  fontSize: 16,
                }}
              >
                ›
              </Text>
            </View>
          </TouchableOpacity>

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
              },
            ]}
          />

          {/* DARK MODE */}

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🌙</Text>

              <Text
                style={[
                  styles.settingText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Dark Theme
              </Text>
            </View>

            <Switch
              value={isDark}
              onValueChange={handleToggleTheme}
              trackColor={{
                false: '#D1D1D6',
                true: colors.primary,
              }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
              },
            ]}
          />

          {/* PUSH NOTIFICATIONS */}

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🔔</Text>

              <Text
                style={[
                  styles.settingText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Push Notifications
              </Text>
            </View>

            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{
                false: '#D1D1D6',
                true: colors.primary,
              }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* ==================================================
            SIGN OUT
        =================================================== */}

        <TouchableOpacity
          style={[
            styles.signOutBtn,
            {
              borderColor: '#E53935',
            },
          ]}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutText}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ====================================================
          LANGUAGE MODAL
      ===================================================== */}

      <Modal
        visible={isLanguageModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() =>
          setIsLanguageModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor: colors.surface,
              },
            ]}
          >
            {/* Modal Header */}

            <View
              style={[
                styles.modalHeader,
                {
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Select Language
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setIsLanguageModalVisible(false)
                }
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    color: colors.subtext,
                    fontSize: 18,
                    fontWeight: '700',
                  }}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            {/* Language List */}

            <ScrollView
              style={styles.languageList}
              showsVerticalScrollIndicator={false}
            >
              {LANGUAGES.map((lang) => {
                const isSelected =
                  currentLanguage === lang.code;

                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.langOption,
                      {
                        borderBottomColor: colors.border,
                        backgroundColor: isSelected
                          ? `${colors.primary}10`
                          : 'transparent',
                      },
                    ]}
                    onPress={() => {
                      void changeLanguage(lang.code as import('@/contexts/LanguageContext').SupportedLanguage);
                      setIsLanguageModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View>
                      <Text
                        style={[
                          styles.langName,
                          {
                            color: isSelected
                              ? colors.primary
                              : colors.text,
                            fontWeight: isSelected
                              ? '700'
                              : '500',
                          },
                        ]}
                      >
                        {lang.native}
                      </Text>

                      <Text
                        style={[
                          styles.langSub,
                          {
                            color: colors.subtext,
                          },
                        ]}
                      >
                        {lang.name}
                      </Text>
                    </View>

                    {isSelected && (
                      <Text
                        style={{
                          color: colors.primary,
                          fontWeight: '800',
                        }}
                      >
                        ✓
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  headerCard: {
    alignItems: 'center',
    marginBottom: 24,
  },

  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },

  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  profileName: {
    fontSize: 20,
    fontWeight: '800',
  },

  profileEmail: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 14,
  },

  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1.5,
  },

  editButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },

  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    minWidth: 130,
    alignItems: 'center',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },

  cardGroup: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
    overflow: 'hidden',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 48,
  },

  inputLabel: {
    width: 90,
    fontSize: 13,
    fontWeight: '600',
  },

  inputVal: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 8,
  },

  divider: {
    height: 1,
    width: '100%',
  },

  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 52,
  },

  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  settingIcon: {
    fontSize: 18,
  },

  settingText: {
    fontSize: 14,
    fontWeight: '600',
  },

  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  settingSub: {
    fontSize: 13,
    fontWeight: '600',
  },

  signOutBtn: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

  signOutText: {
    color: '#E53935',
    fontSize: 15,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 14,
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },

  languageList: {
    marginTop: 10,
  },

  langOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderRadius: 8,
  },

  langName: {
    fontSize: 15,
  },

  langSub: {
    fontSize: 12,
    marginTop: 2,
  },
});