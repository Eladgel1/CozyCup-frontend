import { describe, it, expect } from 'vitest';
import { cx } from '@/lib/cx';

describe('cx (simple truthy joiner)', () => {
  it('joins truthy strings with a space', () => {
    expect(cx('btn', 'primary')).toBe('btn primary');
  });

  it('skips falsy values', () => {
    expect(cx('btn', null, undefined, '', false, 'ghost')).toBe('btn ghost');
  });

  it('handles single value', () => {
    expect(cx('only')).toBe('only');
  });
});
