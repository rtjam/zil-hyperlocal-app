"use client";

// Warm, two-tone acoustic brass doorbell chime ("Ding-Dong!")
// Synthesized via Web Audio API with brass overtones and soft resonance
export function playZilChime(muted = false) {
  if (muted || typeof window === "undefined") return;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const playBellTone = (
      freq: number,
      startTime: number,
      duration: number,
      gainPeak: number
    ) => {
      // Fundamental + warm brass/bell partials
      const partials = [
        { ratio: 1, amp: 1.0 },
        { ratio: 2, amp: 0.35 },
        { ratio: 3.01, amp: 0.14 },
        { ratio: 4.16, amp: 0.06 },
      ];

      partials.forEach(({ ratio, amp }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = ratio === 1 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq * ratio, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(gainPeak * amp, startTime + 0.018);
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          startTime + duration / Math.sqrt(ratio)
        );

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    };

    // "Ding" (G5 - 783.99 Hz) -> "Dong" (E5 - 659.25 Hz)
    playBellTone(783.99, now, 1.05, 0.22);
    playBellTone(659.25, now + 0.34, 1.55, 0.25);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 2200);
  } catch {
    // Ignore audio context restriction errors if user hasn't interacted yet
  }
}
