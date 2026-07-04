import { normalizeTitle, titleSimilarity, isDuplicate, contentHash } from './helpers';

describe('helpers', () => {
  describe('normalizeTitle', () => {
    it('lowercases and strips punctuation', () => {
      expect(normalizeTitle('OpenAI Launches GPT-5!')).toBe('openai launches gpt5');
    });
  });

  describe('titleSimilarity', () => {
    it('returns high similarity for near-identical titles', () => {
      const a = 'OpenAI launches new model for developers';
      const b = 'OpenAI launches new model for enterprise developers';
      expect(titleSimilarity(a, b)).toBeGreaterThan(0.5);
    });

    it('returns low similarity for different titles', () => {
      expect(titleSimilarity('Rust 2.0 released', 'AWS launches new region')).toBeLessThan(0.2);
    });
  });

  describe('isDuplicate', () => {
    it('detects duplicate URLs', () => {
      const candidate = { title: 'Story A', url: 'https://example.com/a?utm=1' };
      const existing = [{ title: 'Different', url: 'https://example.com/a' }];
      expect(isDuplicate(candidate, existing)).toBe(true);
    });

    it('detects similar titles', () => {
      const candidate = { title: 'OpenAI launches GPT model today', url: 'https://a.com/1' };
      const existing = [{ title: 'OpenAI launches GPT model today!', url: 'https://b.com/2' }];
      expect(isDuplicate(candidate, existing)).toBe(true);
    });
  });

  describe('contentHash', () => {
    it('produces consistent hashes', () => {
      expect(contentHash('Title', 'https://x.com')).toBe(contentHash('Title', 'https://x.com'));
    });
  });
});
