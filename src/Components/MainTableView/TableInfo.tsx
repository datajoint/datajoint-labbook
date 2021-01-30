import React from 'react';
import './TableInfo.css';

type TableInfoState = {
  tableDefinition: string
}

class TableInfo extends React.Component<{infoDefData: string}, TableInfoState> {
  constructor(props: any) {
    super(props);
    this.state = {
      tableDefinition: ''
    }
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (this.props.infoDefData !== prevState.tableDefinition) {
      this.setState({tableDefinition: this.props.infoDefData});

    }
  }

  render() {
    return (
      <div className="table-info-viewer">
        <div className="info-content">
          <h4 className="info-title">Description</h4>
          <div className="description-info">{this.state.tableDefinition}</div>
        </div>
      </div>
    )
  }
}

export default TableInfo;