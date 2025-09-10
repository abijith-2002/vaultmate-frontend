import { render, screen } from '@testing-library/react';
import App from './App';

test('renders VaultMate brand', () => {
  render(<App />);
  const brand = screen.getByText(/VaultMate/i);
  expect(brand).toBeInTheDocument();
});
