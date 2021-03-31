import React from 'react';
import {NavLink} from 'react-router-dom';
import {Helmet} from 'react-helmet';

import './NavBar.css'

// Assets
import logo from '../../images/logo_default.svg'

interface NavBarProps {
  hostname: string;
  isLoggedIn: boolean;
}

interface NavBarState {
}

/**
 * Navigation bar component
 */
export default class NavBar extends React.Component<NavBarProps, NavBarState> {
  constructor(props: NavBarProps) {
    super(props);
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