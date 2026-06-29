import { create } from 'zustand';

const useAppStore = create((set) => ({
  // OS State
  isBooting: true,
  finishBoot: () => set({ isBooting: false }),
  
  // Theme (Darkness)
  theme: 'normal', // 'normal' | 'dark'
  
  // Settings
  settings: {
    sfxEnabled: true,
    bgmEnabled: true,
    volume: 50,
    directorEnabled: false,
    autoMotionEnabled: true,
  },
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),

  // Windows State
  windows: {
    ameCam: { isOpen: true, zIndex: 1 },
    jine: { isOpen: true, zIndex: 2 },
    status: { isOpen: true, zIndex: 3 },
    director: { isOpen: false, zIndex: 4 },
    settings: { isOpen: false, zIndex: 5 }
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
}));

export default useAppStore;
