/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
    // include any template files from libs or components if needed
    './projects/**/*.{html,ts}',
  ],
  // No safelist by default — rely on content scanning to keep CSS minimal.
  // If you need dynamic classes at runtime, add a precise safelist of
  // specific class names or narrowly scoped patterns to avoid huge bundles.
  theme: {
    extend: {},
  },
  plugins: [],
}
