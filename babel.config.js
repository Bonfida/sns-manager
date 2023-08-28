module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "transform-inline-environment-variables",
      "react-native-reanimated/plugin",
      "macros",
      [
        "module-resolver",
        {
          alias: {
            "@src": "./src/",
            "@assets": "./assets/",
          },
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      ],
    ],
  };
};
