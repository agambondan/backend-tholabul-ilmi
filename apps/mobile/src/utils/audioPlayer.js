import { Platform } from 'react-native';

let nativeAudio;
let player;
let statusSubscription;

const cleanupStatusSubscription = () => {
  statusSubscription?.remove?.();
  statusSubscription = null;
};

const getNativeAudio = () => {
  if (Platform.OS === 'web') return null;
  if (!nativeAudio) {
    nativeAudio = require('expo-audio');
  }
  return nativeAudio;
};

export const stopAudio = () => {
  cleanupStatusSubscription();
  if (!player) return;

  try {
    player.pause?.();
    player.seekTo?.(0);
    player.remove?.();
  } catch {
    // Playback cleanup should never block reader UI.
  }

  player = null;
};

export const playAudioUrl = async (url, { onEnded } = {}) => {
  if (!url) return false;
  stopAudio();

  if (Platform.OS === 'web') {
    player = new Audio(url);
    player.onended = () => {
      player = null;
      onEnded?.();
    };
    await player.play();
    return true;
  }

  const nativeAudioModule = getNativeAudio();
  player = nativeAudioModule.createAudioPlayer(url);
  statusSubscription = player.addListener?.('playbackStatusUpdate', (status) => {
    if (status?.didJustFinish) {
      stopAudio();
      onEnded?.();
    }
  });
  player.play();
  return true;
};
