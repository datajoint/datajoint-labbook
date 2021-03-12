import React from 'react';
import {NavLink} from 'react-router-dom';
import {Helmet} from 'react-helmet';
import {version} from '../../package.json';

import './NavBar.css'

// Assets
import logo from '../images/logo_default.svg'

interface NavBarProps {
  hostname: string;
  isLoggedIn: boolean;
}

interface NavBarState {
  backendVersion: string;
}

/**
 * Navigation bar component
 */
export default class NavBar extends React.Component<NavBarProps, NavBarState> {
  constructor(props: NavBarProps) {
    super(props);

    this.state = {
      backendVersion: ''
    }
  }

  /**
   * Get the version number upon being mounted.
   */
  componentDidMount() {
    fetch(`${process.env.REACT_APP_DJLABBOOK_BACKEND_PREFIX}/version`, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'}
    })
    .then(result => {
      // Check for error mesage 500, if so throw and error
      if (result.status === 500) {
        throw new Error('Unable to get version number');
      }

      return result.text();
    })
    .then(result => {
      this.setState({backendVersion: result});
    })
    .catch(error => {
      console.log(error);
    })
  }
  
  render() {
    return (
      <nav className='top-nav'>
        <Helmet>
          <title>DataJoint LabBook{this.props.hostname ? " | " + this.props.hostname : ""}</title>
        </Helmet>
        <div className='nav-logo'>
          <NavLink to='/'><img src={logo} alt='Logo' /></NavLink>
        </div>
        <div className='version-info-div'>
          <div className='version-number'>Front End Version: {version}</div>
          <div className='version-number'>Back End Version: {this.state.backendVersion}</div>
        </div>
        
        <ul className='right-nav'>
          {this.props.isLoggedIn ?
            (
              <li className='right-nav-li hostname'>
                <label>Currently connected</label>
                <h5>{this.props.hostname}</h5>
              </li>
            ) : ''
          }
          {this.props.isLoggedIn ?
            (
              <li className='right-nav-li'>
                <a href="/login">Log Out</a>
              </li>
            ) : <li className='right-nav-li'><a href="/login">Log In</a></li>
          }
        </ul>
      </nav>
    );
  }
}