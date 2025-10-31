export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: 'super_admin' | 'clinic_staff' | 'public';
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

export interface DashboardMetrics {
  adoptions: {
    thisMonth: number;
    thisYear: number;
    min: {
      count: number;
      month: string;
    } | null;
    max: {
      count: number;
      month: string;
    } | null;
  };
  cats: {
    totalAvailable: number;
    totalBooked: number;
    kittens: number;
    seniors: number;
  };
  incomingCats: {
    thisMonth: number;
    min: any;
    max: any;
  } | null;
  medicalProcedures: {
    neuteredThisMonth: number;
    spayedThisMonth: number;
    min: any;
    max: any;
  } | null;
  fundraising: {
    title: string;
    currentAmount: number;
    targetAmount: number;
    currency: string;
    progress: number;
  } | null;
}

export interface AdoptionHistory {
  month: string;
  count: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    stack?: string;
  };
}
