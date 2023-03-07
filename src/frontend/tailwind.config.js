module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1E90FF',
      },
    }
  },
  plugins: [
    
  ],
  variants: {
    extend: {
      backgroundColor: ['dark'],
     
    },
  },
  isDarkMode: "class",
}
