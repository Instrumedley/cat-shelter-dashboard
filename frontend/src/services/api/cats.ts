import api from '../api';
import { ApiResponse } from '../../types';

export interface Cat {
  id: number;
  name: string;
  age: number;
  ageGroup: 'kitten' | 'adult' | 'senior';
  gender: 'male' | 'female';
  breed?: string;
  color?: string;
  status: 'available' | 'booked' | 'adopted' | 'deceased';
  description?: string;
  imageUrl?: string;
  entryDate: string;
  entryType: 'rescue' | 'surrender' | 'stray';
  isNeuteredOrSpayed: boolean;
  isBooked: boolean;
  isAdopted: boolean;
  medicalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCatData {
  name: string;
  age: number;
  ageGroup: 'kitten' | 'adult' | 'senior';
  gender: 'male' | 'female';
  breed?: string;
  color?: string;
  status?: 'available' | 'booked' | 'adopted' | 'deceased';
  description?: string;
  imageUrl?: string;
  entryDate: string;
  entryType: 'rescue' | 'surrender' | 'stray';
  isNeuteredOrSpayed?: boolean;
  isBooked?: boolean;
  isAdopted?: boolean;
  medicalNotes?: string;
}

export interface UpdateCatData extends Partial<CreateCatData> {}

export const catsService = {
  getAll: async (): Promise<Cat[]> => {
    const response = await api.get<ApiResponse<Cat[]>>('/cats');
    return response.data.data;
  },

  getById: async (id: number): Promise<Cat> => {
    const response = await api.get<ApiResponse<Cat>>(`/cats/${id}`);
    return response.data.data;
  },

  create: async (data: CreateCatData): Promise<Cat> => {
    const response = await api.post<ApiResponse<Cat>>('/cats', data);
    return response.data.data;
  },

  update: async (id: number, data: UpdateCatData): Promise<Cat> => {
    const response = await api.put<ApiResponse<Cat>>(`/cats/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/cats/${id}`);
  },
};

