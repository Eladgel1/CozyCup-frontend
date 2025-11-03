import { describe, it, expect, vi } from 'vitest';
import { on, off, emit } from '@/lib/events';

describe('events (module-level bus)', () => {
  it('subscribes and emits', () => {
    const spy = vi.fn();
    const unsubscribe = on('ping', spy);

    emit('ping', { x: 1 });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({ x: 1 });

    // cleanup
    unsubscribe();
  });

  it('removes listener via off()', () => {
    const spy = vi.fn();
    const unsubscribe = on('ping', spy);

    off('ping', spy); // explicit removal
    emit('ping', { y: 2 });

    expect(spy).not.toHaveBeenCalled();
    // extra: unsub shouldn’t throw if called again
    unsubscribe();
  });
});
