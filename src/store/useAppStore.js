import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(
  persist(
    (set) => ({
      // OS State
      isBooting: true,
      finishBoot: () => set({ isBooting: false }),
      
      // Theme (Darkness)
      theme: 'normal', // 'normal' | 'dark'
      
      // Settings
      settings: {
        sfxEnabled: true,
        bgmEnabled: true,
        bgmTrack: '19 Angel rests.mp3',
        volume: 50,
        sfxVolume: 50,
        directorEnabled: false,
        autoMotionEnabled: true,
        windowScale: 100,
      },
      
      // Notepad State
      notes: [],
      currentNoteId: null,
      addNote: (note) => set((state) => ({ 
        notes: [...state.notes, note], 
        currentNoteId: note.id 
      })),
      updateNote: (id, content, title) => set((state) => ({
        notes: state.notes.map(n => n.id === id ? { ...n, content, title, updatedAt: Date.now() } : n)
      })),
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter(n => n.id !== id),
        currentNoteId: state.currentNoteId === id ? null : state.currentNoteId
      })),
      setCurrentNote: (id) => set({ currentNoteId: id }),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      // Windows State
      windows: {
        ameCam: { isOpen: true, zIndex: 1 },
        jine: { isOpen: true, zIndex: 2 },
        status: { isOpen: true, zIndex: 3 },
        director: { isOpen: false, zIndex: 4 },
        settings: { isOpen: false, zIndex: 5 },
        notepad: { isOpen: false, zIndex: 6 }
      },
      
      // Window Controls
      openWindow: (winId) => set((state) => {
        const maxZ = Math.max(...Object.values(state.windows).map(w => w.zIndex), 0);
        return {
          windows: {
            ...state.windows,
            [winId]: { isOpen: true, zIndex: maxZ + 1 }
          }
        };
      }),
      closeWindow: (winId) => set((state) => ({
        windows: {
          ...state.windows,
          [winId]: { ...state.windows[winId], isOpen: false }
        }
      })),
      focusWindow: (winId) => set((state) => {
        const maxZ = Math.max(...Object.values(state.windows).map(w => w.zIndex), 0);
        return {
          windows: {
            ...state.windows,
            [winId]: { ...state.windows[winId], zIndex: maxZ + 1 }
          }
        };
      }),

      // JINE Messages
      messages: [
        { id: 1, text: "초텐쨩 최고다!", sender: "user" },
        { id: 2, text: "당연하지! 승인욕구 몬스터니까!", sender: "ame" }
      ],
      addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
      
      // Status
      stress: 50,
      affection: 50,
      
      // Ame Transform State
      petState: 'idle', // 'idle' | 'gaming' | 'transforming' | 'kangel'
      petAction: '0/0/0/0',
      setPetState: (state) => set({ 
        petState: state,
        petAction: state === 'idle' ? '0/0/0/0' : 
                   state === 'kangel' ? 'stream/0/0' : 
                   state === 'transforming_dark' ? 'transformation_dark' : 'transformation',
        theme: state === 'kangel' ? 'dark' : 'normal'
      }),
      setPetAction: (action) => set({ petAction: action })
    }),
    {
      name: 'dose-os-storage',
      merge: (persistedState, currentState) => {
        // Migration: If notes is a string from v1, reset it to an empty array
        if (typeof persistedState.notes === 'string') {
          persistedState.notes = [];
        }
        return { ...currentState, ...persistedState };
      },
      partialize: (state) => ({
        settings: state.settings,
        notes: state.notes,
        messages: state.messages,
        affection: state.affection,
        stress: state.stress
      }),
    }
  )
);

export default useAppStore;
