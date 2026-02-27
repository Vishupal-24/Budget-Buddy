/**
 * Generate a deterministic color based on a string input
 * @param text String to generate color from
 * @returns Hex color code
 */
export function getRandomColor(text: string): string {
  // These color options match the Tailwind color palette
  const colors = [
    "#1F2937", // gray-800
    "#374151", // gray-700
    "#4B5563", // gray-600
    "#525252", // neutral-600
    "#6B7280", // gray-500
    "#737373", // neutral-500
    "#78716C", // stone-500
    "#9CA3AF", // gray-400
    "#A3A3A3", // neutral-400
    "#A8A29E", // stone-400
    "#D1D5DB", // gray-300
    "#D4D4D4", // neutral-300
    "#D4D4D8", // zinc-300
    "#E5E7EB", // gray-200
    "#404040", // neutral-700
    "#57534E", // stone-600
    "#71717A", // zinc-500
  ];
  
  // Generate a deterministic index based on the text
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Get a color from the array using the hash
  const index = Math.abs(hash) % colors.length;
  return colors[index];
} 