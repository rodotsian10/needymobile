import { create } from 'zustand';

const useAppStore = create((set) => ({
  // OS State
  isBooting: true,
  finishBoot: () => set({ isBooting: false }),
  
  // Theme (Darkness)
  theme: 'normal', // 'normal' | 'dark'
  
  // Windows State
  windows: {
    ameCam: { isOpen: true, zIndex: 1 },
    jine: { isOpen: false, zIndex: 2 },
    status: { isOpen: true, zIndex: 3 }
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
  setPetState: (newState) => set((state) => {
    if (newState === 'kangel') {
      return { petState: newState, theme: 'dark' };
    }
    return { petState: newState };
  })
}));

export default useAppStore;
