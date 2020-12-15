import React from 'react';
import {NavLink} from 'react-router-dom';

import './NavBar.css'

// Assets
import logo from '../images/logo_default.svg'

type DJGUINavBarState = {
}

class NavBar extends React.Component<{hostname: string, isLoggedIn: boolean}, DJGUINavBarState> {
  constructor(props: any) {
    super(props);
    this.state = {
    }

  }
  render() {
    return (
      <nav className='top-nav'>
        <div className='nav-logo'>
          <NavLink to='/'><img src={logo} alt='Logo'/></NavLink>
        </div>
        <ul className='right-nav'>
          {this.props.isLoggedIn ? 
          (
            <li className='right-nav-li hostname'>
              <label>Currently connected</label>
              <h5>{this.props.hostname}</h5>
            </li>
          ) : '' }
          {this.props.isLoggedIn ? 
          (
            <li className='right-nav-li'>
              <li><a href="/login">Log Out</a></li>
            </li>
          ) : <li className='right-nav-li'><a href="/login">Log In</a></li>
          }
        </ul>
      </nav>
    );
  }
}

export default NavBar;