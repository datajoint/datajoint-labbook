import React from 'react';
import './TableInfo.css';

type TableInfoState = {
}

class TableInfo extends React.Component<{infoDefData: string}, TableInfoState> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className="table-info-viewer">
        <div className="info-content">
          <h4 className="info-title">Description</h4>
          <div className="description-info">{this.props.infoDefData}</div>
        </div>
      </div>
    )
  }
}

export default TableInfo;