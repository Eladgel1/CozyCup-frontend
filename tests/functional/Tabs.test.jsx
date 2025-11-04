import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs } from '@/components/ui/Tabs.jsx';

const TABS = [
  { label: 'One', value: 'one' },
  { label: 'Two', value: 'two' },
  { label: 'Three', value: 'three' },
];

describe('Tabs (functional)', () => {
  it('changes selection on click and fires onChange with value', () => {
    const onChange = vi.fn();
    render(<Tabs tabs={TABS} onChange={onChange} initial={0} />);
    const two = screen.getByRole('tab', { name: 'Two' });
    fireEvent.click(two);
    expect(onChange).toHaveBeenCalledWith('two');
    expect(two).toHaveAttribute('aria-selected', 'true');
  });

  it('keyboard navigation: ArrowRight/Home/End', () => {
    const onChange = vi.fn();
    render(<Tabs tabs={TABS} onChange={onChange} initial={0} />);
    const list = screen.getByRole('tablist');
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('two');
    fireEvent.keyDown(list, { key: 'End' });
    expect(onChange).toHaveBeenCalledWith('three');
    fireEvent.keyDown(list, { key: 'Home' });
    expect(onChange).toHaveBeenCalledWith('one');
  });

  it('controlled mode follows value prop', () => {
    const onChange = vi.fn();
    const { rerender } = render(<Tabs tabs={TABS} value="one" onChange={onChange} />);
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true');
    rerender(<Tabs tabs={TABS} value="three" onChange={onChange} />);
    expect(screen.getByRole('tab', { name: 'Three' })).toHaveAttribute('aria-selected', 'true');
  });
});
