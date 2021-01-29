import React from 'react';
import './Home.css';

// Component imports
import SideMenu from './SideMenu';
import {TableView} from './TableView';
import {TableType} from './TableList'

type DJGUIHomeState = {
  selectedSchemaName: string,
  selectedTableName: string,
  selectedTableType: TableType
}

class Home extends React.Component<{token: string}, DJGUIHomeState> {
  constructor(props: any) {
    super(props);
    this.state = {
      selectedSchemaName: '',
      selectedTableName: '',
      selectedTableType: TableType.MANUAL
    }
    this.handleTableSelection = this.handleTableSelection.bind(this);
  }

  handleTableSelection(schemaName:string, tableName:string, tableType:TableType) {
    this.setState({selectedSchemaName: schemaName, selectedTableName: tableName, selectedTableType: tableType})
  }

  render() {
    return (
      <div className="home-container">
        <div className="side-menu-container">
          <SideMenu token={this.props.token}
            selectedSchema={this.state.selectedSchemaName}
            selectedTableName={this.state.selectedTableName}
            selectedTableType={this.state.selectedTableType}
            handleTableSelection={(schema:string, tablename:string, tabletype:TableType)=>{this.handleTableSelection(schema, tablename, tabletype)}}/>
        </div>
        <div className="table-view-container">
          <TableView token={this.props.token} selectedSchemaName={this.state.selectedSchemaName} selectedTableName={this.state.selectedTableName}  selectedTableType={this.state.selectedTableType}/>
        </div>
      </div>
    )
  }
}

export default Home;