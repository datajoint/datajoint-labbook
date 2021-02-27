import React from 'react';
import {Route, BrowserRouter as Router, Switch, Redirect} from 'react-router-dom';
import './App.css';

// Component imports
import NavBar from './NavBar';
import Login from './Login';
import Home from './Home'

if (window.performance && performance.navigation.type === 1) alert( "This page is reloaded" )

type DJGUIAppState = {
  currentDatabaseConnectionJWT: string;
  hostname: string;
}

class App extends React.Component<{}, DJGUIAppState> {
  constructor(props: any) {
    super(props);
    this.state = {
      currentDatabaseConnectionJWT: '',
      hostname: ''
    };

    this.setCurrentDatabaseConnectionJWT = this.setCurrentDatabaseConnectionJWT.bind(this);
  }

  // Set the current database jwt token to use for future queries and etc.
  setCurrentDatabaseConnectionJWT(jwt: string, hostname: string) {
    this.setState({currentDatabaseConnectionJWT: jwt, hostname: hostname});
  }

  render() {
    return (
      <Router>
        <NavBar hostname={this.state.hostname} isLoggedIn={this.state.currentDatabaseConnectionJWT !== '' ? true: false}></NavBar>
        <div className='content'>
          <Switch>
            <Route exact path='/'>{this.state.currentDatabaseConnectionJWT !== '' ? <Redirect to='/home'/> : <Redirect to='/login'/>}</Route>
            <Route path='/login'>{this.state.currentDatabaseConnectionJWT !== '' ? <Redirect to='/home'/> : <Login setCurrentDatabaseConnectionJWT={this.setCurrentDatabaseConnectionJWT}></Login>}</Route>
            <Route path='/home'>{this.state.currentDatabaseConnectionJWT !== '' ? <Home token={this.state.currentDatabaseConnectionJWT}></Home> : <Redirect to='/login'/>}</Route>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;