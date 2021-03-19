import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './Components/App';

test('renders login page', () => {
    render(<App />);
    const linkElements = [
        screen.getByText("Host\/Database Address"),
        screen.getByText("Username"),
        screen.getByText("Password"),
        screen.getByText("Remember Me"),
        screen.getByText("Connect")
    ];
    linkElements.forEach(element => {
        expect(element).toBeInTheDocument();
    })

});
