import { fireEvent, render, screen } from '@testing-library/react';
import Card from '@/components/ui/Card';

describe('Card (functional)', () => {
  it('renders structure: Header, Body, Footer, Title, Description', () => {
    render(
      <Card>
        <Card.Header>
          <Card.Title>Order Summary</Card.Title>
          <Card.Description>Review your items</Card.Description>
        </Card.Header>
        <Card.Body>Items go here</Card.Body>
        <Card.Footer>Footer actions</Card.Footer>
      </Card>
    );

    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('Review your items')).toBeInTheDocument();
    expect(screen.getByText('Items go here')).toBeInTheDocument();
    expect(screen.getByText('Footer actions')).toBeInTheDocument();
  });

  it('applies elevation classes and interactive behavior', () => {
    const onClick = vi.fn();
    const { rerender, container } = render(<Card elevation={0}>Zero</Card>);
    const root = container.firstChild;
    expect(root).toHaveClass('shadow-none');

    rerender(<Card elevation={2}>High</Card>);
    expect(container.firstChild).toHaveClass('shadow-md');

    rerender(
      <Card interactive onClick={onClick}>
        Clickable
      </Card>
    );
    const clickable = screen.getByText('Clickable').closest('div');
    expect(clickable).toHaveClass('cursor-pointer');
    fireEvent.click(clickable);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('merges custom className on root', () => {
    const { container } = render(<Card className="custom-pad">X</Card>);
    expect(container.firstChild).toHaveClass('custom-pad');
  });
});
