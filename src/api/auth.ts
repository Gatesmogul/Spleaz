import apiClient from './client';

export type UserRole = 'RIDER' | 'DRIVER' | 'ADMIN';
export interface UserProfile { id:string; fullName:string; email:string; phoneNumber:string; role:UserRole; country?:string; state?:string; city?:string; avatarUrl?:string; createdAt:string; }
export interface SignUpPayload { fullName:string; email:string; phoneNumber:string; password:string; role:UserRole; country:string; state:string; city:string; vehicle?:{ make:string; model:string; year:number; licensePlate:string; color:string; }; }
export interface SignInPayload { email:string; password:string; }
export interface AuthResponse { success:boolean; message:string; data:{ user:UserProfile; token:string }; }
export interface BasicResponse { success:boolean; message:string; }

const normalizeRole = (role: UserRole) => role === 'RIDER' ? 'customer' : role === 'DRIVER' ? 'driver' : 'admin';

export const authApi = {
  signUp: async (payload: SignUpPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phoneNumber,
      password: payload.password,
      role: normalizeRole(payload.role),
      country: payload.country,
      state: payload.state,
      city: payload.city,
      vehicle: payload.vehicle,
    });
    return response.data;
  },
  signIn: async (payload: SignInPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', payload);
    return response.data;
  },
  getProfile: async (token?: string): Promise<UserProfile> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await apiClient.get<{success:boolean;data:UserProfile}>('/auth/me', { headers });
    return response.data.data;
  },
  updateProfile: async (payload: Partial<SignUpPayload>): Promise<UserProfile> => {
    const response = await apiClient.put<{success:boolean;data:UserProfile}>('/auth/profile', payload);
    return response.data.data;
  },
  forgotPassword: async (payload:{email:string}): Promise<BasicResponse> => {
    const response = await apiClient.post<BasicResponse>('/auth/forgot-password', payload); return response.data;
  },
  resetPassword: async (payload:{token:string;newPassword:string}): Promise<BasicResponse> => {
    const response = await apiClient.post<BasicResponse>('/auth/reset-password', payload); return response.data;
  },
  signOut: async (): Promise<BasicResponse> => ({ success:true, message:'Signed out successfully.' }),
};
export default authApi;
