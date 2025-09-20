import axios from 'axios';
import { API_CONFIG } from '../../config/api';
import authService from '../authService';
import type { Course, AddCourseApiPayload, CoursesResponse } from '../../types/course';

const courseApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

courseApi.interceptors.request.use((config) => {
  const token = authService.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const courseService = {
  async createCourse(payload: AddCourseApiPayload): Promise<Course> {
    try {
      const response = await courseApi.post('/courses/add-course', payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur création cours');
    }
  },

  async getAllCourses(page = 1, limit = 10): Promise<CoursesResponse> {
    try {
      const response = await courseApi.get('/courses/all-courses', {
        params: {
          page,
          limit
        }
      });

      return {
        data: response.data.data || response.data,
        pagination: response.data.pagination || { page, limit, total: 0, totalPages: 0 }
      };
    } catch (error: any) {
      throw new Error('Erreur récupération cours');
    }
  },

  async getCourseById(id: string): Promise<Course> {
    const response = await courseApi.get(`/courses/${id}`);
    return response.data;
  },

  async updateCourse(id: string, payload: Partial<AddCourseApiPayload>): Promise<Course> {
    const response = await courseApi.patch(`/courses/${id}`, payload);
    return response.data;
  },

  async deleteCourse(id: string): Promise<void> {
    await courseApi.delete(`/courses/${id}`);
  },

  // Définir/mettre à jour la disponibilité d'un cours
  async setAvailability(availabilityData: {
    courseId: string;
    roomId: string;
    trimestre: string;
    statut: string;
  }): Promise<any> {
    try {
      const response = await courseApi.post('/courses/set-disponibility', availabilityData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur mise à jour disponibilité');
    }
  }
};
