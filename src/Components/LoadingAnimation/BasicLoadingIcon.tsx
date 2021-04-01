import React from 'react';
import './BasicLoadingIcon.css';

interface BasicLoadingIconProps {
  size: number;
}

/**
 * Basic Loading Icon component that shows up when user is waiting for something to load
 */
export default class BasicLoadingIcon extends React.Component<BasicLoadingIconProps> {
  iconStyle = {
    width: this.props.size + 'px',
    height: this.props.size + 'px',
    marginTop: -(this.props.size / 2) + 'px'
  }

  render() {
    return (
      <div className="loadingOverlay">
        <div className="basicLoadingIcon" style={this.iconStyle}></div>
      </div>
    )
  }
}