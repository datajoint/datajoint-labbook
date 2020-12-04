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
      currentDatabaseConnectionJWT: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJkYXRhYmFzZUFkZHJlc3MiOiJzeW5pY2l4LXNlcnZlciIsInVzZXJuYW1lIjoic3luaWNpeCIsInBhc3N3b3JkIjoiU2l0b25pYzQzMjQ1MSEifQ.bPtUSSlV3UvhwMTLgmJD0GiikD3PL6VZHwiHD5OGm6i3zngy_aEHorjpP06Eq-2NrghXNN2tnr4sLo2GQVV0G3BbT5bKKFV_WEtcBansIz6r04UF41-mXIF3lTYloTSBfjTphwcsQfe2K4qvFHuWizPZt9HNBvz4P-AyjjtL4JLwhW4iM0xD9aB2iU02IpyAv5v1XPtm44QYa_rW1HyIQ6X-7nHiQw8ZrRn6ztSrcXnp7FSQTQOztlqtkjPaVZNyVFHQbGaRuXL7jpUyXr49njwewuT8L2wblgYdFDelbQnvf5czBwaNS35bbPhMMv0syr9iTXfH1_Udj5W7OUYnXo97164ogOUFLDyCmAtTRSr_-c8Js4zZ9fIQSbVrb9s6N0xVHCVPQWzz5gulf32DvxhQ6TS4IqWCzMJF5d9YQLTvV3lU-YQrpJcPHeVLQQ7GeOcdURg0iHWnxNejA_VZrLj0jpmzOsn0VE2gEExS-9_RyUYsfH9Qd0aOYWNrJ8u524VsVmSAmGjlJreqBxMv4AcPGcze724hKU7FD8pmRYqW1JNXhpFH7wVlOOs11jyzj5jAuUvDY2qePPzRHXC4XLFCdB9Or5tNrqWME0HTky6gzeYGKtGaQIOlOqxruH0PWaffwYbTsGxByVkdflO9RvQyt-80ds40V8kw8On3IB4'
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