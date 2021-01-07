import React, {Component} from 'react';

import './Login.css'
// Assets
import logo from '../images/logo_default.svg'

interface loginInFormProps {
  setCurrentDatabaseConnectionJWT: any;
}

interface loginInFormBuffer {
  databaseAddress: string;
  username: string;
  password: string;
  returnMessage: string;
}

class Login extends Component<loginInFormProps, loginInFormBuffer> {
  constructor(props: any) {
    super(props);

    // Default values
    this.state = {
      databaseAddress: '',
      username: '',
      password: '',
      returnMessage: ''
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
        // Parse the result to see if there is a jwt property, if so then login credientials worked
        if (result.hasOwnProperty('jwt')) {
          // Set the JWT for the current session
          this.props.setCurrentDatabaseConnectionJWT(result.jwt, this.state.databaseAddress);
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

  isFormReady() {
    console.log(this.state.databaseAddress && this.state.username && this.state.password ? true : false)
    return this.state.databaseAddress && this.state.username && this.state.password ? true : false
  }

  render() {
    return (
      <div className='login-div'>
        <div className='login-container'>
          <img className="login-top-logo" src={logo} alt="datajoint gui logo"/>
          <form className='login-form'>
            <label className='login-input-label'>Host/Database Address</label>
            <input className='login-input' type='text' value={this.state.databaseAddress} onChange={this.onDatabaseAddressChange}></input>
            <label className='login-input-label'>Username</label>
            <input className='login-input' type='text' value={this.state.username} onChange={this.onUsernameChange}></input>
            <label className='login-input-label'>Password</label>
            <input className='login-input' type='password' value={this.state.password} onChange={this.onPasswordChange}></input>
            <div className='login-interaction-div'>
              <div>
                <input className='remember-me-checkbox' type='checkbox' id='remember-me-checkbox'></input>
                <label className='remember-me-checkbox-label' htmlFor='remember-me-checkbox'>Remember Me</label>
              </div>
              <button className={this.isFormReady() ? 'login-input-button ready' : 'login-input-button'} disabled={!this.isFormReady()} onClick={this.onSubmit} type='button'>Connect</button>
            </div>
            <p className="form-message">{this.state.returnMessage}</p>
          </form>
        </div>
      </div>
    )
  }
}

export default Login;