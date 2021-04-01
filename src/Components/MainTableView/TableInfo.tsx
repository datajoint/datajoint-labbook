import React from 'react';
import './TableInfo.css';

interface TableInfoProps {
  tableDefintionString: string; // Table definition string
}

interface TableInfoState {
}

/**
 * Component for displaying the table definition
 */
export default class TableInfo extends React.Component<TableInfoProps, TableInfoState> {
  constructor(props: TableInfoProps) {
    super(props);
  }

  render() {
    return (
      <div className="table-info-viewer">
        <div className="info-content">
          <h4 className="info-title">Description</h4>
          <div className="description-info">{this.props.tableDefintionString}</div>
        </div>
      </div>
    )
  }
}