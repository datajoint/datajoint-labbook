import React from 'react';
import './BasicLoadingIcon.css';

/**
 * Basic Loading Icon component that shows up when user is waiting for something to load
 */
class BasicLoadingIcon extends React.Component<{size:number}> {
  constructor(props: any) {
    super(props);
  }

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
export default BasicLoadingIcon;