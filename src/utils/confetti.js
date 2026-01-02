import confetti from "canvas-confetti";

export function triggerCartConfetti(x, y) {
  const end = Date.now() + 300;

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x, y },
      colors: ["#0ea5e9", "#06b6d4", "#3b82f6", "#1d4ed8"],
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
