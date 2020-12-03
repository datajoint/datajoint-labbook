import React from 'react';
import {Route, HashRouter, Switch, Redirect} from 'react-router-dom';
import './App.css';

// Component imports
import NavBar from './NavBar';
import Login from './Login';
import Home from './Home'
import DatabaseConnectionInfo from './DatabaseConnectionInfo';

type DJGUIAppState = {
  userIsLoggedIn: boolean;
  currentDatabaseConnection: DatabaseConnectionInfo;
}

class App extends React.Component<{}, DJGUIAppState> {
  constructor(props: any) {
    super(props);
    this.state = {userIsLoggedIn: false, currentDatabaseConnection: new DatabaseConnectionInfo('', '', '')};
  }

  render() {
    return (
      <HashRouter>
        <NavBar></NavBar>
        <div className='content'>
          <Switch>
            <Route exact path='/'>{this.state.userIsLoggedIn ? <Redirect to='/home'/> : <Redirect to='/login'/>}</Route>
            <Route path='/login'><Login></Login></Route>
            <Route path='/home'>{this.state.userIsLoggedIn ? <Home></Home> : <Redirect to='/login'/>}</Route>
          </Switch>
        </div>
        </HashRouter>
    );
  }
}

export default App;