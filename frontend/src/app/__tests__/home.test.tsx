import { render, screen } from '@testing-library/react';
import Home from '../page';

describe('Home', () => {
  it('renders hero with funding stats', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /funding intelligence/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open strategy/i })).toBeInTheDocument();
  });
});
