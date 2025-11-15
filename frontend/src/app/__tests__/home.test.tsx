import { render, screen } from '@testing-library/react';
import Home from '../page';

describe('Home', () => {
  it('renders the onboarding headline placeholder', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /to get started/i })).toBeInTheDocument();
  });
});
