// const palette = require("./palette-05.json");
const palette = require("./palette-02.json");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: { ...palette },
      fontFamily: {
        azeret: ["Azeret"],
      },
    },
  },
};
