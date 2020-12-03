import React, {Component} from 'react';
//import DatabaseConnectionInfo from './DatabaseConnectionInfo'

import './Login.css'

interface loginInFormBuffer {
  databaseAddress: string;
  username: string;
  password: string;
}

class Login extends Component<{}, loginInFormBuffer> {
  constructor(props: any) {
    super(props);

    // Default values
    this.state = {
      databaseAddress: '',
      username: '',
      password: ''
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
    // Attempt login here
    // if successful then set databaseConnection
    //this.props.setCurrentDatabaseConnection(new DatabaseConnection(this.state.databaseAddress, this.state.username, this.state.password));
  }

  render() {
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
        </form>
      </div>
    );
  }
}

export default Login;