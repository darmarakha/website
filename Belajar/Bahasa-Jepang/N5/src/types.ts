/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Character {
  ja: string;
  romaji: string;
  type: 'hiragana' | 'katakana';
  category?: 'basic' | 'dakuon' | 'handakuon' | 'yoon' | 'sokuon';
  strokes?: string; // Descriptive stroke order or SVG path
}

export interface Vocabulary {
  word: string;
  reading: string;
  meaning: string;
  category: string;
  explanation?: string;
  formula?: string;
}

export interface Kanji {
  character: string;
  meaning: string;
  onyomi: string;
  kunyomi: string;
  strokes?: number;
  examples: { word: string; reading: string; meaning: string }[];
}

export interface GrammarPoint {
  title: string;
  structure: string;
  explanation: string;
  examples: { ja: string; en: string }[];
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  audioUrl?: string; // Optional audio URL for fast playback
}
