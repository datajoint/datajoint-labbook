import React from 'react';
import {version} from '../../../package.json';

import './Footer.css'

interface FooterProps {
}

interface FooterState {
  backendVersion: string;
}

/**
 * Footer component
 */
export default class Footer extends React.Component<FooterProps, FooterState> {
  constructor(props: FooterProps) {
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
      this.setState({backendVersion: 'Unable to get version number'});
      console.log(error);
    })
  }
  
  render() {
    return (
      <footer>
        <div className='footer-content'>
          <p>© 2021, DataJoint LabBook</p>
          </div>
        <div className='version-info-div'>
          <div className='version-number'>Front End Version: {version}</div>
          <div className='version-number'>Back End Version: {this.state.backendVersion}</div>
        </div>
      </footer>
    );
  }
}