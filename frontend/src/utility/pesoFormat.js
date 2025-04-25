/**
 * Format a number into Philippine Peso currency.
 * @param {number} value - The amount to format.
 * @returns {string} - Formatted currency string (e.g., ₱1,000.00).
 */
export function formatPeso(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}
