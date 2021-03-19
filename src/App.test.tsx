import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './Components/App';

test('renders login page', () => {
    render(<App />);

    // All inner text
    const linkElements = [
        screen.getByText("Host\/Database Address"),
        screen.getByText("Username"),
        screen.getByText("Password"),
        screen.getByText("Remember Me"),
        screen.getByText("Connect"),
        screen.getByText("Log In")
    ];

    // Navigation bar
    expect(screen.getByRole('navigation')).toBeInTheDocument();

    // `Remember Me` checkbox
    expect(screen.getByRole('checkbox')).toBeInTheDocument();

    // Logos
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
    expect(screen.getByAltText('datajoint gui logo')).toBeInTheDocument();

    // `Connect` Button
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
    linkElements.forEach(element => {
        expect(element).toBeInTheDocument();
    })
});
