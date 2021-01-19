import React, {Component} from 'react';
import Cookies from 'js-cookie'
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
  rememberMe: boolean;
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
      rememberMe: false,
      returnMessage: ''
    }

    // Bind on change functions
    this.onUsernameChange = this.onUsernameChange.bind(this);
    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.onDatabaseAddressChange = this.onDatabaseAddressChange.bind(this);
    this.onRememberMeChange = this.onRememberMeChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    // Load databaseAddress and usernameCookie from cookies
    var databaseAddressCookie = Cookies.get('databaseAddress');
    var usernameCookie = Cookies.get('username')

    this.setState({
      databaseAddress: databaseAddressCookie === undefined ? '' : databaseAddressCookie,
      username: usernameCookie === undefined ? '' : usernameCookie
    })
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

  onRememberMeChange(event: any) {
    this.setState({rememberMe: event.target.checked})
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
      .then(result => {
        // If remember is checked then record the databaseAddress and username
        if (this.state.rememberMe) {
          Cookies.set('databaseAddress', this.state.databaseAddress);
          Cookies.set('username', this.state.username);
        }
        
        // Check for error mesage 500, if so throw and error
        if (result.status === 500) {
          throw new Error('Unable to connect to backend');
        }

        // Covert result to json if all checks passed
        return result.json();
      })
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
        this.setState({returnMessage: error.toString()});
      });
  }

  isFormReady() {
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
                <input className='remember-me-checkbox' type='checkbox' id='remember-me-checkbox' checked={this.state.rememberMe} onChange={this.onRememberMeChange}></input>
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