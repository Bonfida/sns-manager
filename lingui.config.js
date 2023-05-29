/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  locales: ["en", "kr", "zh"],
  catalogs: [
    {
      path: "src/locales/{locale}/messages",
      include: ["src"],
    },
  ],
  format: "po",
};
