import api from '../api';
import {
  ApiResponse,
  TotalAdoptionsResponse,
  CatsStatusResponse,
  IncomingCatsResponse,
  NeuteredCatsResponse,
  CampaignResponse,
} from '../../types';

export const statsService = {
  /**
   * Get total adoptions with optional date filtering
   * @param startDate Optional start date (YYYY-MM-DD)
   * @param endDate Optional end date (YYYY-MM-DD)
   */
  getTotalAdoptions: async (
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<TotalAdoptionsResponse>> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const queryString = params.toString();
    const url = `/total_adoptions${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<ApiResponse<TotalAdoptionsResponse>>(url);
    return response.data;
  },

  /**
   * Get current cat status counts with monthly breakdown
   */
  getCatsStatus: async (): Promise<ApiResponse<CatsStatusResponse>> => {
    const response = await api.get<ApiResponse<CatsStatusResponse>>('/cats_status');
    return response.data;
  },

  /**
   * Get incoming cats (rescues and surrenders) this month
   */
  getIncomingCats: async (): Promise<ApiResponse<IncomingCatsResponse>> => {
    const response = await api.get<ApiResponse<IncomingCatsResponse>>('/incoming_cats');
    return response.data;
  },

  /**
   * Get neutered and spayed cats this month
   */
  getNeuteredCats: async (): Promise<ApiResponse<NeuteredCatsResponse>> => {
    const response = await api.get<ApiResponse<NeuteredCatsResponse>>('/neutered_cats');
    return response.data;
  },

  /**
   * Get active fundraising campaign information
   */
  getCampaign: async (): Promise<ApiResponse<CampaignResponse | null>> => {
    const response = await api.get<ApiResponse<CampaignResponse | null>>('/campaign');
    return response.data;
  },
};
