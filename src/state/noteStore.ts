import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Note, NoteCategory } from "../types";

interface NoteState {
  notes: Note[];
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  updateNote: (id: string, updates: Partial<Omit<Note, "id" | "createdAt" | "updatedAt">>) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
  getNotesByCategory: (category: NoteCategory) => Note[];
  searchNotes: (query: string) => Note[];
  getPinnedNotes: () => Note[];
  getRecentNotes: (limit?: number) => Note[];
}

const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: [],

      addNote: (noteData) => {
        const newNote: Note = {
          ...noteData,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          notes: [newNote, ...state.notes],
        }));
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date() }
              : note
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },

      togglePin: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, pinned: !note.pinned, updatedAt: new Date() }
              : note
          ),
        }));
      },

      getNotesByCategory: (category) => {
        return get().notes.filter((note) => note.category === category);
      },

      searchNotes: (query) => {
        const lowercaseQuery = query.toLowerCase();
        return get().notes.filter(
          (note) =>
            note.content.toLowerCase().includes(lowercaseQuery) ||
            note.title?.toLowerCase().includes(lowercaseQuery) ||
            note.tags?.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
        );
      },

      getPinnedNotes: () => {
        return get().notes.filter((note) => note.pinned);
      },

      getRecentNotes: (limit = 5) => {
        return get().notes
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, limit);
      },
    }),
    {
      name: "note-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ notes: state.notes }),
    }
  )
);

export default useNoteStore;