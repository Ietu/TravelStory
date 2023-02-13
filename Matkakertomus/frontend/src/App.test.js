import { fireEvent, getByTestId, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { App, LoginModal, SigninModal } from './App';
import AlertError from './components/Alerts/AlertError';
// import AlertSuccess from './components/Alerts/AlertSuccess';

test('Testi-testi tarkistetaan onko otsikko etusivulla', () => {
  render(<App />);
  const Otsikko = screen.getByText("Matkakertomus");
  expect(Otsikko).toBeInTheDocument();
});

describe("SigninModal-testi", () => {
  test("SigninModal-testi, testataan tyhjillä inputeilla", () => {
    render(<SigninModal />);
    const email_input = screen.getByLabelText("Sähköpostiosoite:");
    const username_input = screen.getByLabelText("Käyttäjä:");
    const password_input = screen.getByLabelText("Salasana:");
    const password_verify_input = screen.getByLabelText("Varmista salasana:");

    userEvent.type(email_input, "");
    userEvent.type(username_input, "");
    userEvent.type(password_input, "");
    userEvent.type(password_verify_input, "");
    userEvent.click(getByTestId("signin-btn"));

    expect(screen.containsMatchingElement(<AlertError />)).toEqual(true);
  })
});
