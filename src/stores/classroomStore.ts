import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import classroomService, { Classroom, Room, Paginated } from '../services/classroomService';

interface ClassroomState {
  items: Classroom[];
  page: number;
  limit: number;
  total: number;
  current?: Classroom | null;
  loading: boolean;
  error?: string | null;

  // actions
  fetchAll: (page?: number, limit?: number) => Promise<void>;
  getById: (id: string) => Promise<void>;
  getDetails: (id: string) => Promise<void>;
  create: (payload: { name: string; description?: string; rooms?: Array<{ name: string; capacity: number }> }) => Promise<Classroom>;
  update: (id: string, payload: Partial<{ name: string; level: string; description: string }>) => Promise<Classroom>;
  remove: (id: string) => Promise<void>;

  addRoom: (classroomId: string, payload: { name: string; capacity: number }) => Promise<Classroom>;
  updateRoom: (classroomId: string, roomId: string, payload: Partial<{ name: string; capacity: number }>) => Promise<Classroom>;
  deleteRoom: (classroomId: string, roomId: string) => Promise<Classroom>;
}

export const useClassroomStore = create<ClassroomState>()(
  devtools(
    immer((set, get) => ({
      items: [],
      page: 1,
      limit: 10,
      total: 0,
      current: null,
      loading: false,
      error: null,

      async fetchAll(page = get().page, limit = get().limit) {
        set(state => { state.loading = true; state.error = null; });
        try {
          const res: Paginated<Classroom> = await classroomService.getAll(page, limit);
          set(state => {
            state.items = res.items || [];
            state.page = res.page || page;
            state.limit = res.limit || limit;
            state.total = res.total || res.items?.length || 0;
          });
        } catch (e: any) {
          set(state => { state.error = e?.message || 'Erreur lors du chargement des classes'; });
        } finally {
          set(state => { state.loading = false; });
        }
      },

      async getById(id: string) {
        set(s => { s.loading = true; s.error = null; });
        try {
          const cls = await classroomService.getById(id);
          set(s => { s.current = cls; });
        } catch (e: any) {
          set(s => { s.error = e?.message || 'Erreur lors du chargement de la classe'; });
        } finally { set(s => { s.loading = false; }); }
      },

      async getDetails(id: string) {
        set(s => { s.loading = true; s.error = null; });
        try {
          const cls = await classroomService.getDetails(id);
          set(s => { s.current = cls; });
        } catch (e: any) {
          set(s => { s.error = e?.message || 'Erreur lors du chargement des détails de la classe'; });
        } finally { set(s => { s.loading = false; }); }
      },

      async create(payload) {
        set(s => { s.loading = true; s.error = null; });
        try {
          const created = await classroomService.addClassroom(payload);
          set(s => { s.items.unshift(created); s.total += 1; });
          return created;
        } catch (e: any) {
          set(s => { s.error = e?.message || 'Erreur lors de la création de la classe'; });
          throw e;
        } finally { set(s => { s.loading = false; }); }
      },

      async update(id, payload) {
        set(s => { s.loading = true; s.error = null; });
        try {
          const updated = await classroomService.updateClassroom(id, payload);
          set(s => {
            const idx = s.items.findIndex(i => i.id === id);
            if (idx !== -1) s.items[idx] = updated;
            if (s.current?.id === id) s.current = updated;
          });
          return updated;
        } catch (e: any) {
          set(s => { s.error = e?.message || 'Erreur lors de la mise à jour de la classe'; });
          throw e;
        } finally { set(s => { s.loading = false; }); }
      },

      async remove(id) {
        set(s => { s.loading = true; s.error = null; });
        try {
          await classroomService.deleteClassroom(id);
          set(s => { s.items = s.items.filter(i => i.id !== id); s.total = Math.max(0, s.total - 1); });
        } catch (e: any) {
          set(s => { s.error = e?.message || 'Erreur lors de la suppression de la classe'; });
          throw e;
        } finally { set(s => { s.loading = false; }); }
      },

      async addRoom(classroomId, payload) {
        set(s => { s.loading = true; s.error = null; });
        try {
          const updated = await classroomService.addRoom(classroomId, payload);
          set(s => {
            const idx = s.items.findIndex(i => i.id === classroomId);
            if (idx !== -1) s.items[idx] = updated;
            if (s.current?.id === classroomId) s.current = updated;
          });
          return updated;
        } catch (e: any) {
          set(s => { s.error = e?.message || "Erreur lors de l'ajout de la salle"; });
          throw e;
        } finally { set(s => { s.loading = false; }); }
      },

      async updateRoom(classroomId, roomId, payload) {
        set(s => { s.loading = true; s.error = null; });
        try {
          const updated = await classroomService.updateRoom(classroomId, roomId, payload);
          set(s => {
            const idx = s.items.findIndex(i => i.id === classroomId);
            if (idx !== -1) s.items[idx] = updated;
            if (s.current?.id === classroomId) s.current = updated;
          });
          return updated;
        } catch (e: any) {
          set(s => { s.error = e?.message || 'Erreur lors de la mise à jour de la salle'; });
          throw e;
        } finally { set(s => { s.loading = false; }); }
      },

      async deleteRoom(classroomId, roomId) {
        set(s => { s.loading = true; s.error = null; });
        try {
          const updated = await classroomService.deleteRoom(classroomId, roomId);
          set(s => {
            const idx = s.items.findIndex(i => i.id === classroomId);
            if (idx !== -1) s.items[idx] = updated;
            if (s.current?.id === classroomId) s.current = updated;
          });
          return updated;
        } catch (e: any) {
          set(s => { s.error = e?.message || 'Erreur lors de la suppression de la salle'; });
          throw e;
        } finally { set(s => { s.loading = false; }); }
      },
    }))
  )
);

export default useClassroomStore;
