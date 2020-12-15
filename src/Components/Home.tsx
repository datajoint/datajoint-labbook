import React from 'react';
import './Home.css';

// Component imports
import SideMenu from './SideMenu';
import TableView from './TableView';

class Home extends React.Component {
  render() {
    return (
      <div className="home-container">
        <div className="side-menu-container">
          <SideMenu/>
        </div>
        <div className="table-view-container">
          <TableView/>
        </div>
      </div>
    )
  }
}

export default Home;