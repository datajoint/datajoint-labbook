import React from 'react';
import {NavLink} from 'react-router-dom';

import './NavBar.css'

// Assets
import logo from '../images/datajoint-logo.png'

class NavBar extends React.Component {
  render() {
    return (
      <nav className='top-nav'>
        <div className='nav-logo'>
          <NavLink to='/'><img src={logo} alt='Logo'/></NavLink>
        </div>
        <ul className='right-nav'>
          <li className='right-nav-li'>
          </li>
        </ul>
      </nav>
    );
  }
}

export default NavBar;