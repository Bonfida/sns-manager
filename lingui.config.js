/** @type {import('@lingui/conf').LinguiConfig} */
import { allLocales as locales } from "./src/locales";
module.exports = {
  locales,
  catalogs: [
    {
      path: "src/locales/{locale}/messages",
      include: ["src"],
    },
  ],
  format: "po",
};
