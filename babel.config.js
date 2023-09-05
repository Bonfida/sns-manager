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
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true
        },
      ],
    ],
  };
};
