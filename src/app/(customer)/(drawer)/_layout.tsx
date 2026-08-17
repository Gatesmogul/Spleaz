import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList
} from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Custom Drawer Content Component
 * Renders user profile header, custom navigation items, and sign-out footer button.
 */
function CustomDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      t('auth.signOutTitle', 'Sign Out'),
      t('auth.signOutConfirm', 'Are you sure you want to log out of Spleaz?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('auth.signOut', 'Sign Out'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/sign-in');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.drawerContainer, { backgroundColor: theme.colors.surface }]}>
      {/* Drawer Profile Header */}
      <TouchableOpacity
        style={[styles.headerSection, { borderBottomColor: theme.colors.border }]}
        activeOpacity={0.8}
        onPress={() => router.push('/(customer)/(drawer)/profile')}
      >
        <Image
          source={{
            uri:
              user?.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
          }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.colors.text }]} numberOfLines={1}>
            {user?.name || 'Adebayo Ogunlesi'}
          </Text>
          <Text style={[styles.userEmail, { color: theme.colors.text }]} numberOfLines={1}>
            {user?.email || 'adebayo.o@example.com'}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: theme.colors.primary + '18' }]}>
            <Text style={[styles.roleText, { color: theme.colors.primary }]}>Customer</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Drawer Items List */}
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollList}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Drawer Footer / Sign Out Button */}
      <View style={[styles.footerSection, { borderTopColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutIcon}>🚪</Text>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/**
 * Customer Drawer Layout Navigator
 */
export default function CustomerDrawerLayout() {
  const { theme } = useTheme();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: theme.colors.surface,
          width: 290,
        },
        drawerActiveBackgroundColor: theme.colors.primary + '15',
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.text,
        drawerLabelStyle: {
          fontSize: 14,
          fontWeight: '700',
          marginLeft: -12,
        },
        drawerItemStyle: {
          borderRadius: 12,
          paddingHorizontal: 8,
          marginVertical: 4,
        },
      }}
    >
      {/* Discovery & Map Home Screen */}
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Discovery & Map',
          drawerIcon: ({ color }) => (
            <Text style={[styles.menuIcon, { color }]}>📍</Text>
          ),
        }}
      />

      {/* Profile & Settings Screen */}
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: 'Profile & Settings',
          drawerIcon: ({ color }) => (
            <Text style={[styles.menuIcon, { color }]}>👤</Text>
          ),
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scrollList: {
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  menuIcon: {
    fontSize: 18,
  },
  footerSection: {
    padding: 20,
    borderTopWidth: 1,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  signOutIcon: {
    fontSize: 18,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E53935',
  },
});