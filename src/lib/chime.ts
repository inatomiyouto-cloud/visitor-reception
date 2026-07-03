/**
 * 「ピンポーン」通知チャイム（Web Audio API）
 * 管理者画面で新規来客を検知した際に再生する
 */
export function playNotificationChime(): void {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) return;

    const context = new AudioContextClass();

    const playTone = (frequency: number, startAt: number, duration: number) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      gain.connect(context.destination);

      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.25, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

      oscillator.start(startAt);
      oscillator.stop(startAt + duration);
    };

    const now = context.currentTime;
    playTone(880, now, 0.12);
    playTone(1174, now + 0.16, 0.28);

    window.setTimeout(() => {
      void context.close();
    }, 600);
  } catch (error) {
    console.warn("通知チャイムの再生に失敗しました:", error);
  }
}
