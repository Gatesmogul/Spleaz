import apiClient from './client';

export type UserRole =
  | 'RIDER'
  | 'DRIVER'
  | 'ADMIN';

export type Gender =
  | 'Male'
  | 'Female'
  | 'Other';

export interface VehiclePayload {
  type: string;
  color: string;
  licensePlate: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  country?: string;
  state?: string;
  city?: string;
  avatarUrl?: string;
  gender?: Gender;
  vehicle?: VehiclePayload;
  createdAt?: string;
  isVerified?: boolean;
}

export interface SignUpPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: UserRole;
  country: string;
  state: string;
  city: string;
  gender: Gender;
  vehicle?: VehiclePayload;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: UserProfile;
    token: string;
  };
}

export interface BasicResponse {
  success: boolean;
  message: string;
}

// ==========================================
// FRONTEND ROLE -> BACKEND ROLE
// ==========================================

const normalizeRole = (
  role: UserRole
): 'customer' | 'driver' | 'admin' => {
  switch (role) {
    case 'RIDER':
      return 'customer';

    case 'DRIVER':
      return 'driver';

    case 'ADMIN':
      return 'admin';

    default:
      return 'customer';
  }
};

// ==========================================
// AUTH API
// ==========================================

export const authApi = {
  // ----------------------------------------
  // SIGN UP
  // ----------------------------------------

  signUp: async (
    payload: SignUpPayload
  ): Promise<AuthResponse> => {
    const response =
      await apiClient.post<AuthResponse>(
        '/auth/register',
        {
          fullName: payload.fullName,
          email: payload.email,

          // Backend accepts "phone"
          phone: payload.phoneNumber,

          password: payload.password,

          // Converts:
          // RIDER  -> customer
          // DRIVER -> driver
          // ADMIN  -> admin
          role: normalizeRole(payload.role),

          country: payload.country,
          state: payload.state,
          city: payload.city,

          gender: payload.gender,

          // Only drivers should normally
          // send vehicle information.
          vehicle: payload.vehicle,
        }
      );

    return response.data;
  },

  // ----------------------------------------
  // SIGN IN
  // ----------------------------------------

  signIn: async (
    payload: SignInPayload
  ): Promise<AuthResponse> => {
    const response =
      await apiClient.post<AuthResponse>(
        '/auth/login',
        {
          email: payload.email,
          password: payload.password,
        }
      );

    return response.data;
  },

  // ----------------------------------------
  // GET CURRENT USER
  // ----------------------------------------

  getProfile: async (
    token?: string
  ): Promise<UserProfile> => {
    const headers = token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined;

    const response =
      await apiClient.get<{
        success: boolean;
        data: UserProfile;
      }>('/auth/me', {
        headers,
      });

    return response.data.data;
  },

  // ----------------------------------------
  // UPDATE PROFILE
  // ----------------------------------------

  updateProfile: async (
    payload: Partial<SignUpPayload>
  ): Promise<UserProfile> => {
    const response =
      await apiClient.put<{
        success: boolean;
        data: UserProfile;
      }>('/auth/profile', payload);

    return response.data.data;
  },

  // ----------------------------------------
  // FORGOT PASSWORD
  // ----------------------------------------

  forgotPassword: async (
    payload: {
      email: string;
    }
  ): Promise<BasicResponse> => {
    const response =
      await apiClient.post<BasicResponse>(
        '/auth/forgot-password',
        payload
      );

    return response.data;
  },

  // ----------------------------------------
  // RESET PASSWORD
  // ----------------------------------------

  resetPassword: async (
    payload: {
      token: string;
      newPassword: string;
    }
  ): Promise<BasicResponse> => {
    const response =
      await apiClient.post<BasicResponse>(
        '/auth/reset-password',
        payload
      );

    return response.data;
  },

  // ----------------------------------------
  // SIGN OUT
  // ----------------------------------------

  signOut: async (): Promise<BasicResponse> => {
    return {
      success: true,
      message: 'Signed out successfully.',
    };
  },
};

export default authApi;
