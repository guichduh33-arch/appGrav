/**
 * Audio Utilities
 * Shared audio functions for notifications across the application
 */

/** Window with webkit-prefixed AudioContext for Safari compatibility */
interface WebkitWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

/**
 * Play a notification sound using Web Audio API
 * Used for KDS new orders, order ready notifications, etc.
 *
 * @param frequency - Sound frequency in Hz (default: 880)
 * @param duration - Sound duration in seconds (default: 0.3)
 * @param volume - Initial volume 0-1 (default: 0.3)
 */
export function playNotificationSound(
  frequency: number = 880,
  duration: number = 0.3,
  volume: number = 0.3
): void {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as WebkitWindow).webkitAudioContext;

    if (!AudioContextClass) {
      console.warn('[audio] Web Audio API not supported');
      return;
    }

    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    // Audio API not available or blocked by browser
    console.warn('[audio] Failed to play notification sound:', error);
  }
}

/**
 * Play a short beep for order ready notification
 */
export function playOrderReadySound(): void {
  playNotificationSound(880, 0.3, 0.2);
}

/**
 * Play a longer sound for new order notification
 */
export function playNewOrderSound(): void {
  playNotificationSound(880, 0.5, 0.3);
}

/**
 * Play urgent alert sound (higher pitch)
 */
export function playUrgentSound(): void {
  playNotificationSound(1200, 0.4, 0.4);
}
