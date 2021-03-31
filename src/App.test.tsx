import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import App from './Components/App';
import Login from './Components/Login/Login';
import Home from './Components/Home'


test('Verifying components appear on login page.', async () => {
    render(<App />);

    // All inner text
    const linkElements = [
        screen.getByText("Host\/Database Address"),
        screen.getByText("Username"),
        screen.getByText("Passyword"),
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

test('Login operation mocking', async () => {
    const result = render(
        <App />
    );
    //console.log(screen.getByLabelText(""));
    const passwordInput = result.container.querySelector('#password');
    const usernameInput = result.container.querySelector('#username');
    const dbServerInput = result.container.querySelector('#database-server');
    if (passwordInput && usernameInput && dbServerInput) {
        fireEvent.change(usernameInput, {target : {value : "root"}})
        fireEvent.change(passwordInput, {target : {value : "labbook"}})
        fireEvent.change(dbServerInput, {target : {value : "local-db"}})
        const connectButton = screen.getByText('Connect');
        expect(connectButton).toBeEnabled();
        fireEvent.click(connectButton);        
    } else {
        throw new Error('textbox for login info not found.');
    }
});

