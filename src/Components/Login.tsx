import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';

import './Login.css'

interface loginInFormProps {
  setCurrentDatabaseConnectionJWT: any;
}

interface loginInFormBuffer {
  databaseAddress: string;
  username: string;
  password: string;
  returnMessage: string;
  loginSucessful: boolean; // If set to true will redirect to /
}

class Login extends Component<loginInFormProps, loginInFormBuffer> {
  constructor(props: any) {
    super(props);

    // Default values
    this.state = {
      databaseAddress: '',
      username: '',
      password: '',
      returnMessage: '',
      loginSucessful: false
    }

    // Bind on change functions
    this.onUsernameChange = this.onUsernameChange.bind(this);
    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.onDatabaseAddressChange = this.onDatabaseAddressChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onDatabaseAddressChange(event: any) {
    this.setState({databaseAddress: event.target.value});
  }

  onUsernameChange(event: any) {
    this.setState({username: event.target.value});
  }

  onPasswordChange(event: any) {
    this.setState({password: event.target.value});
  }

  onSubmit(event: any) {
    // Attempt to authenticate
    fetch('/api/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        databaseAddress: this.state.databaseAddress,
        username: this.state.username,
        password: this.state.password
      })
    })
      .then(result => result.json())
      .then(result => {
        console.log(result)
        // Parse the result to see if there is a jwt property, if so then login credientials worked
        if (result.hasOwnProperty('jwt')) {
          // Set the JWT for the current session
          this.props.setCurrentDatabaseConnectionJWT(result.jwt);

          // Set loginSucessful for redirect back to /
          this.setState({loginSucessful: true});
        }
        else if (result.hasOwnProperty('error')) {
          // Server return an error message, thus display it
          this.setState({returnMessage: result.error});
        }
      })
      .catch((error) => {
        // Something else blew up
        console.error('Error:', error);
        this.setState({returnMessage: error});
      });
  }

  render() {
    if (this.state.loginSucessful) {
      return <Redirect to='/'></Redirect>
    }
    else {
      return (
        <div className='login-div'>
          <h1 className='login-title'>Login</h1>
          <form className='login-form' onSubmit={this.onSubmit}>
            <label className='login-input-label'>Database Address</label>
            <input className='login-input' type='text' value={this.state.databaseAddress} onChange={this.onDatabaseAddressChange}></input>
            <label className='login-input-label'>Username</label>
            <input className='login-input' type='text' value={this.state.username} onChange={this.onUsernameChange}></input>
            <label className='login-input-label'>Password</label>
            <input className='login-input' type='password' value={this.state.password} onChange={this.onPasswordChange}></input>
            <input className='login-input-button' type='submit'></input>
            <p>{this.state.returnMessage}</p>
          </form>
        </div>
      )
    }
  }
}

export default Login;