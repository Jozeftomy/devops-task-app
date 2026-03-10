import { render, screen } from '@testing-library/react';
import App from './App';

test('renders DevOps Task Manager title', () => {
  render(<App />);
  const title = screen.getByText(/DevOps Task Manager/i);
  expect(title).toBeInTheDocument();
});