import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Note, NoteCategory } from "../types";

interface NoteState {
  notes: Note[];
  userId: string | null;
  setUserId: (userId: string | null) => void;
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt" | "userId">) => void;
  updateNote: (id: string, updates: Partial<Omit<Note, "id" | "createdAt" | "updatedAt">>) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
  getNotesByCategory: (category: NoteCategory) => Note[];
  searchNotes: (query: string) => Note[];
  getPinnedNotes: () => Note[];
  getRecentNotes: (limit?: number) => Note[];
  clearUserData: () => void;
}

const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: [],
      userId: null,

      setUserId: (userId) => set({ userId }),

      addNote: (noteData) => {
        const { userId } = get();
        if (!userId) return;

        const newNote: Note = {
          ...noteData,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          notes: [newNote, ...state.notes],
        }));
      },

      updateNote: (id, updates) => {
        const { userId } = get();
        if (!userId) return;

        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id && note.userId === userId
              ? { ...note, ...updates, updatedAt: new Date() }
              : note
          ),
        }));
      },

      deleteNote: (id) => {
        const { userId } = get();
        if (!userId) return;

        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id || note.userId !== userId),
        }));
      },

      togglePin: (id) => {
        const { userId } = get();
        if (!userId) return;

        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id && note.userId === userId
              ? { ...note, pinned: !note.pinned, updatedAt: new Date() }
              : note
          ),
        }));
      },

      getNotesByCategory: (category) => {
        const { notes, userId } = get();
        if (!userId) return [];
        return notes.filter((note) => note.category === category && note.userId === userId);
      },

      searchNotes: (query) => {
        const { notes, userId } = get();
        if (!userId) return [];
        
        const userNotes = notes.filter(note => note.userId === userId);
        const lowercaseQuery = query.toLowerCase();
        return userNotes.filter(
          (note) =>
            note.content.toLowerCase().includes(lowercaseQuery) ||
            note.title?.toLowerCase().includes(lowercaseQuery) ||
            note.tags?.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
        );
      },

      getPinnedNotes: () => {
        const { notes, userId } = get();
        if (!userId) return [];
        return notes.filter((note) => note.pinned && note.userId === userId);
      },

      getRecentNotes: (limit = 5) => {
        const { notes, userId } = get();
        if (!userId) return [];
        
        return notes
          .filter(note => note.userId === userId)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, limit);
      },

      clearUserData: () => {
        set({ notes: [], userId: null });
      },
    }),
    {
      name: "note-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        notes: state.notes.filter(note => note.userId === state.userId),
        userId: state.userId 
      }),
    }
  )
);

export default useNoteStore;