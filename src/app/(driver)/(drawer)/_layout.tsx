import React from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';

import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';

import { useTheme } from '@/contexts/ThemeContext';

function CustomDriverDrawerContent(
  props: DrawerContentComponentProps
) {
  const router = useRouter();
  const { theme } = useTheme();

  const [isOnline, setIsOnline] = React.useState<boolean>(true);

  // ============================================================
  // DRIVER PROFILE
  // ============================================================

  const driverProfile = {
    name: 'Kafayat Adeleke',
    rating: 4.92,
    vehicleInfo: 'Toyota Camry • KJA-882-AB',
    photoUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = (): void => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out from your driver account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            router.replace('/sign-in');
          },
        },
      ]
    );
  };

  // ============================================================
  // DRAWER CONTENT
  // ============================================================

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ======================================================
            DRIVER PROFILE
        ====================================================== */}

        <View
          style={[
            styles.profileCard,
            {
              borderBottomColor: theme.colors.border,
            },
          ]}
        >
          <Image
            source={{
              uri: driverProfile.photoUrl,
            }}
            style={styles.avatar}
          />

          <View style={styles.profileInfo}>
            <Text
              style={[
                styles.driverName,
                {
                  color: theme.colors.text,
                },
              ]}
              numberOfLines={1}
            >
              {driverProfile.name}
            </Text>

            <Text
              style={[
                styles.vehicleText,
                {
                  color: theme.colors.subtext,
                },
              ]}
              numberOfLines={1}
            >
              {driverProfile.vehicleInfo}
            </Text>

            <View style={styles.ratingBadge}>
              <Text style={styles.ratingStar}>★</Text>

              <Text
                style={[
                  styles.ratingNumber,
                  {
                    color: theme.colors.text,
                  },
                ]}
              >
                {driverProfile.rating.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* ======================================================
            ONLINE STATUS
        ====================================================== */}

        <View
          style={[
            styles.statusRow,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.statusLabelContainer}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isOnline
                    ? '#4CAF50'
                    : '#E53935',
                },
              ]}
            />

            <Text
              style={[
                styles.statusText,
                {
                  color: theme.colors.text,
                },
              ]}
            >
              {isOnline
                ? 'Active Online'
                : 'Offline Mode'}
            </Text>
          </View>

          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{
              false: '#767577',
              true: `${theme.colors.primary}80`,
            }}
            thumbColor={
              isOnline
                ? theme.colors.primary
                : '#F4F3F4'
            }
          />
        </View>

        {/* ======================================================
            DRAWER ROUTES
        ====================================================== */}

        <View style={styles.drawerItemsSection}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* ========================================================
          FOOTER
      ======================================================== */}

      <View
        style={[
          styles.footer,
          {
            borderTopColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Text style={styles.logoutIcon}>🚪</Text>

          <Text
            style={[
              styles.logoutText,
              {
                color: '#E53935',
              },
            ]}
          >
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================================
// DRIVER DRAWER LAYOUT
// ============================================================

export default function DriverDrawerLayout() {
  const { theme } = useTheme();

  return (
    <Drawer
      drawerContent={(props) => (
        <CustomDriverDrawerContent {...props} />
      )}
      screenOptions={{
        headerShown: false,

        drawerActiveTintColor:
          theme.colors.primary,

        drawerInactiveTintColor:
          theme.colors.text,

        drawerLabelStyle: {
          fontSize: 14,
          fontWeight: '700',
          marginLeft: -10,
        },

        drawerItemStyle: {
          borderRadius: 12,
          paddingHorizontal: 12,
          marginVertical: 4,
        },

        drawerStyle: {
          backgroundColor: theme.colors.surface,
        },
      }}
    >
      {/* ======================================================
          MAIN DASHBOARD
      ====================================================== */}

      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Live Dashboard',

          drawerIcon: ({ color }) => (
            <Text
              style={[
                styles.drawerIcon,
                {
                  color,
                },
              ]}
            >
              🚘
            </Text>
          ),
        }}
      />

      {/* ======================================================
          COMPLETED TRIPS
      ====================================================== */}

      <Drawer.Screen
        name="completed"
        options={{
          drawerLabel: 'Completed Trips',

          drawerIcon: ({ color }) => (
            <Text
              style={[
                styles.drawerIcon,
                {
                  color,
                },
              ]}
            >
              📜
            </Text>
          ),
        }}
      />
    </Drawer>
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
    paddingTop: 10,
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    gap: 12,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },

  profileInfo: {
    flex: 1,
  },

  driverName: {
    fontSize: 16,
    fontWeight: '800',
  },

  vehicleText: {
    fontSize: 11,
    marginTop: 2,
  },

  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },

  ratingStar: {
    color: '#FFB300',
    fontSize: 12,
  },

  ratingNumber: {
    fontSize: 12,
    fontWeight: '700',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },

  statusLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },

  drawerItemsSection: {
    paddingHorizontal: 8,
  },

  drawerIcon: {
    fontSize: 18,
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },

  logoutIcon: {
    fontSize: 18,
  },

  logoutText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
