// Web Audio API Synthesizer for Algorithm Sonification

let audioCtx = null;

/**
 * Plays a short synthesized sine wave tone pitched proportionally to value.
 * @param {number} value - The array element value
 * @param {number} minVal - Minimum value in array (default: 5)
 * @param {number} maxVal - Maximum value in array (default: 105)
 * @param {number} duration - Note duration in seconds
 */
export function playNote(value, minVal = 5, maxVal = 105, duration = 0.05) {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }

    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // Map array value range [minVal, maxVal] to frequency [220Hz (A3), 880Hz (A5)]
    const minFreq = 220;
    const maxFreq = 880;
    const clampedVal = Math.max(minVal, Math.min(maxVal, value || minVal));
    const normalized = (clampedVal - minVal) / (maxVal - minVal || 1);
    const frequency = minFreq + normalized * (maxFreq - minFreq);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    // Apply an exponential gain envelope to prevent clicking/popping audio artifacts
    const volume = 0.07;
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (err) {
    // Graceful fallback if Web Audio is blocked or unsupported
  }
}

/**
 * Plays a celebratory chord when a search target is found or sort completes.
 */
export function playSuccessChime() {
  playNote(40, 5, 105, 0.12);
  setTimeout(() => playNote(70, 5, 105, 0.15), 80);
  setTimeout(() => playNote(105, 5, 105, 0.25), 160);
}
