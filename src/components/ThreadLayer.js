export function renderThreads() {
  return `
    <div class="thread-layer" aria-hidden="true">
      <svg class="thread thread-a" viewBox="0 0 700 180">
        <path d="M4 110 C 120 12, 230 178, 344 88 S 546 16, 696 98" />
      </svg>
      <svg class="thread thread-b" viewBox="0 0 580 160">
        <path d="M6 74 C 95 134, 184 8, 280 80 S 450 146, 574 52" />
      </svg>
      <svg class="thread thread-c" viewBox="0 0 460 150">
        <path d="M5 112 C 90 10, 156 128, 234 58 S 360 30, 455 96" />
      </svg>
    </div>
  `;
}
