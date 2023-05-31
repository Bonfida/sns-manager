/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  // English, Korean, Chinese
  locales: ["en", "kr", "zh"],
  catalogs: [
    {
      path: "src/locales/{locale}/messages",
      include: ["src"],
    },
  ],
  format: "po",
};
