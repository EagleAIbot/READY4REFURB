import { create } from 'zustand'

export const useAppStore = create((set) => ({
  sceneLoaded:      false,
  animationsReady:  false,
  isFinished:       false,

  setSceneLoaded:     () => set({ sceneLoaded: true }),
  setAnimationsReady: () => set({ animationsReady: true }),
  setFinished:        () => set({ isFinished: true }),
}))
