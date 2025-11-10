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

// New endpoint types
export interface TotalAdoptionsResponse {
  total: number;
  series: Array<{
    month: string;
    count: number;
  }>;
  min: {
    month: string;
    count: number;
  } | null;
  max: {
    month: string;
    count: number;
  } | null;
}

export interface CatsStatusResponse {
  available: number;
  booked: number;
  available_breakdown: {
    kittens: number;
    adults: number;
    seniors: number;
  };
  series: {
    available: Array<{
      month: string;
      count: number;
    }>;
    booked: Array<{
      month: string;
      count: number;
    }>;
  };
  min: {
    month: string;
    count: number;
  } | null;
  max: {
    month: string;
    count: number;
  } | null;
}

export interface IncomingCatsResponse {
  rescued_this_month: number;
  surrendered_this_month: number;
  series: {
    rescued: Array<{
      month: string;
      count: number;
    }>;
    surrendered: Array<{
      month: string;
      count: number;
    }>;
    total: Array<{
      month: string;
      count: number;
    }>;
  };
  min: {
    month: string;
    count: number;
  } | null;
  max: {
    month: string;
    count: number;
  } | null;
}

export interface NeuteredCatsResponse {
  neutered_this_month: number;
  spayed_this_month: number;
  series: {
    neutered: Array<{
      month: string;
      count: number;
    }>;
    spayed: Array<{
      month: string;
      count: number;
    }>;
    total: Array<{
      month: string;
      count: number;
    }>;
  };
  min: {
    month: string;
    count: number;
  } | null;
  max: {
    month: string;
    count: number;
  } | null;
}

export interface CampaignResponse {
  campaign_goal: number;
  current_donated: number;
  start_date: string;
  end_date: string | null;
}
