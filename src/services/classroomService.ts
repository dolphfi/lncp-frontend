import axios, { AxiosInstance } from 'axios';
import { config } from '../config/environment';
import authService from './authService';

export interface Classroom {
  id: string;
  name: string;
  level?: string;
  description?: string;
  rooms?: Room[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Room {
  id: string;
  name: string;
  capacity?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

function authHeaders() {
  const token = authService.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const api: AxiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.API_TIMEOUT || 15000,
});

export const classroomService = {
  async addClassroom(data: { name: string; description?: string; rooms?: Array<{ name: string; capacity: number }> }): Promise<Classroom> {
    const body: any = { name: data.name };
    if (data.description) body.description = data.description;
    if (data.rooms && data.rooms.length) body.rooms = data.rooms.map(r => ({ name: r.name, capacity: r.capacity }));
    const res = await api.post('/classroom/add-classroom', body, { headers: { ...authHeaders() } });
    return res.data;
  },

  async getAll(page = 1, limit = 10): Promise<Paginated<Classroom>> {
    const res = await api.get('/classroom/all-classroom', {
      headers: { ...authHeaders() },
      params: { page, limit },
    });
    const payload = res.data;
    // Expecting shape: { data: Classroom[], meta: { total, page, limit } }
    return {
      items: payload?.data ?? [],
      total: payload?.meta?.total ?? (payload?.data?.length ?? 0),
      page: payload?.meta?.page ?? page,
      limit: payload?.meta?.limit ?? limit,
    };
  },

  async getById(id: string): Promise<Classroom> {
    const res = await api.get(`/classroom/${id}`, { headers: { ...authHeaders() } });
    return res.data;
  },

  async updateClassroom(id: string, data: Partial<{ name: string; level: string; description: string }>): Promise<Classroom> {
    const res = await api.patch(`/classroom/${id}`, data, { headers: { ...authHeaders() } });
    return res.data;
  },

  async deleteClassroom(id: string): Promise<{ message: string }> {
    const res = await api.delete(`/classroom/${id}`, { headers: { ...authHeaders() } });
    return res.data;
  },

  async getDetails(id: string): Promise<Classroom> {
    const res = await api.get(`/classroom/${id}/details`, { headers: { ...authHeaders() } });
    return res.data;
  },

  async addRoom(classroomId: string, data: { name: string; capacity: number }): Promise<Classroom> {
    const res = await api.post(`/classroom/${classroomId}/add-room`, data, { headers: { ...authHeaders() } });
    return res.data;
  },

  async updateRoom(classroomId: string, roomId: string, data: Partial<{ name: string; capacity: number }>): Promise<Classroom> {
    const res = await api.patch(`/classroom/${classroomId}/room/${roomId}`, data, { headers: { ...authHeaders() } });
    return res.data;
  },

  async deleteRoom(classroomId: string, roomId: string): Promise<Classroom> {
    const res = await api.delete(`/classroom/${classroomId}/room/${roomId}`, { headers: { ...authHeaders() } });
    return res.data;
  },
};

export default classroomService;
