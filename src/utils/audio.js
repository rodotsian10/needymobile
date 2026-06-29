// src/utils/audio.js
import useAppStore from '../store/useAppStore';

const sfxCache = {};

export const playSFX = (soundFileName) => {
  // Check if SFX is enabled in the global store
  const { settings } = useAppStore.getState();
  if (!settings.sfxEnabled) return;

  const basePath = import.meta.env.BASE_URL + 'assets/audio/';
  const fullPath = basePath + soundFileName;

  try {
    const audio = new Audio(fullPath);
    audio.volume = settings.volume / 100;
    audio.play().catch(e => {
      // Ignore autoplay errors if user hasn't interacted yet
      console.warn("Audio play failed:", e);
    });
  } catch (error) {
    console.error("Error playing SFX:", error);
  }
};

// Preset functions for convenience
export const playOpenSound = () => playSFX('open.wav');
export const playCloseSound = () => playSFX('close.wav');
export const playExecuteSound = () => playSFX('execute.wav');
export const playJineSendSound = () => playSFX('jine_send_stamp.wav');
export const playErrorSound = () => playSFX('Boot_Caution.wav');
export const playNotificationSound = () => playSFX('piporo.wav');
export const playEndHaishinSound = () => playSFX('endHaishin.wav');

// BGM functionality placeholder
export const playBGM = (bgmFileName) => {
  // To be implemented later
};
export const stopBGM = () => {
  // To be implemented later
};

let transformAudioInstance = null;

export const playTransformSound = () => {
  const { settings } = useAppStore.getState();
  if (!settings.sfxEnabled) return;

  const basePath = import.meta.env.BASE_URL + 'assets/audio/';
  transformAudioInstance = new Audio(basePath + 'transform.wav');
  transformAudioInstance.volume = settings.volume / 100;
  transformAudioInstance.play().catch(e => console.warn("Audio play failed:", e));
};

export const stopTransformSound = () => {
  if (transformAudioInstance) {
    transformAudioInstance.pause();
    transformAudioInstance.currentTime = 0;
    transformAudioInstance = null;
  }
};
