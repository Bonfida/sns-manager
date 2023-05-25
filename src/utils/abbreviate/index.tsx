export const abbreviate = (text: string | undefined, len: number) => {
  if (!text) return "";
  if (text.length <= len) return text;
  const n = Math.floor(len / 2);
  return text.slice(0, n) + "..." + text.slice(-n);
};
