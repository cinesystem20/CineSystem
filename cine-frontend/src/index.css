@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    @apply bg-cinema-black text-cinema-light font-body;
    -webkit-font-smoothing: antialiased;
  }
}

@layer components {
  .btn-primary {
    @apply bg-cinema-amber hover:bg-cinema-gold text-cinema-black font-semibold
           px-6 py-2.5 rounded-lg transition-all duration-200 active:scale-95;
  }
  .btn-ghost {
    @apply border border-cinema-border hover:border-cinema-amber text-cinema-light
           hover:text-cinema-amber px-6 py-2.5 rounded-lg transition-all duration-200;
  }
  .card {
    @apply bg-cinema-card border border-cinema-border rounded-xl;
  }
  .input {
    @apply bg-cinema-dark border border-cinema-border rounded-lg px-4 py-2.5
           text-cinema-light placeholder-cinema-muted focus:outline-none
           focus:border-cinema-amber transition-colors w-full;
  }
  .seat-available {
    @apply bg-cinema-dark border border-cinema-border hover:border-cinema-amber
           hover:bg-amber-900/30 cursor-pointer transition-all duration-150 rounded;
  }
  .seat-selected {
    @apply bg-cinema-amber border border-cinema-gold cursor-pointer rounded;
  }
  .seat-occupied {
    @apply bg-cinema-border border border-transparent cursor-not-allowed opacity-50 rounded;
  }
  .seat-vip {
    @apply border-amber-600;
  }
}
