import { tr } from './tr.js';
import { en } from './en.js';

const dict = { tr, en };

export function t(key, language = 'tr') {
  return dict[language]?.[key] || dict.tr[key] || key;
}
