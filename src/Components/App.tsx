import React from 'react';
import {Route, HashRouter, Switch, Redirect} from 'react-router-dom';
import './App.css';

// Component imports
import NavBar from './NavBar';
import Login from './Login';
import Home from './Home'

type DJGUIAppState = {
  currentDatabaseConnectionJWT: string;
}

class App extends React.Component<{}, DJGUIAppState> {
  constructor(props: any) {
    super(props);
    this.state = {
      currentDatabaseConnectionJWT: ''
    };

    this.setCurrentDatabaseConnectionJWT = this.setCurrentDatabaseConnectionJWT.bind(this);
  }

  // Set the current database jwt token to use for future queries and etc.
  setCurrentDatabaseConnectionJWT(jwt: string) {
    this.setState({currentDatabaseConnectionJWT: jwt});
  }

  render() {
    return (
      <HashRouter>
        <NavBar></NavBar>
        <div className='content'>
          <Switch>
            <Route exact path='/'>{this.state.currentDatabaseConnectionJWT !== '' ? <Redirect to='/home'/> : <Redirect to='/login'/>}</Route>
            <Route path='/login'>{this.state.currentDatabaseConnectionJWT !== '' ? <Redirect to='/home'/> : <Login setCurrentDatabaseConnectionJWT={this.setCurrentDatabaseConnectionJWT}></Login>}</Route>
            <Route path='/home'>{this.state.currentDatabaseConnectionJWT !== '' ? <Home></Home> : <Redirect to='/login'/>}</Route>
          </Switch>
        </div>
        </HashRouter>
    );
  }
}

export default App;