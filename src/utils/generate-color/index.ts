/**
 * Generates a random color in hexadecimal format.
 * @returns {string} - The randomly generated color in the format '#RRGGBB'.
 */
export const generateColor = (): string => {
  // Generate a random number between 0 and 16777215 (FFFFFF in hexadecimal)
  const randomColor = Math.floor(Math.random() * 16777215)
    .toString(16) // Convert the number to hexadecimal string
    .padStart(6, "0"); // Pad the string with leading zeros to ensure it has 6 characters

  return `#${randomColor}`;
};
