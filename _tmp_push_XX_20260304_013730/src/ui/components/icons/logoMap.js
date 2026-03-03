export const logoMap = Object.freeze({
  GPT: '🟢',
  GEMINI: '🔵',
  CLAUDE: '🟣',
  DEEPSEEK: '⚫',
});

export function getLogoGlyph(logoKey = '') {
  return logoMap[logoKey] || '⚪';
}
