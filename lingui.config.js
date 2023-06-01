/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  // English, Korean, Simplified Chinese
  locales: ["en", "kr", "zh-Hans"],
  catalogs: [
    {
      path: "src/locales/{locale}/messages",
      include: ["src"],
    },
  ],
  format: "po",
};
