import React from 'react';
import './Home.css';

// Component imports
import SideMenu from './SideMenu';
import TableView from './TableView';

type DJGUIHomeState = {
  selectedSchema: string,
  selectedTable: string,
  selectedTableType: string
}

class Home extends React.Component<{token: string}, DJGUIHomeState> {
  constructor(props: any) {
    super(props);
    this.state = {
      selectedSchema: '',
      selectedTable: '',
      selectedTableType: ''
    }
    this.handleTableSelection = this.handleTableSelection.bind(this);
  }

  handleTableSelection(schemaName:string, tableName:string, tableType:string) {
    this.setState({selectedSchema: schemaName, selectedTable: tableName, selectedTableType: tableType})
  }

  render() {
    return (
      <div className="home-container">
        <div className="side-menu-container">
          <SideMenu token={this.props.token}
            selectedSchema={this.state.selectedSchema}
            handleTableSelection={(schema:string, tablename:string, tabletype:string)=>{this.handleTableSelection(schema, tablename, tabletype)}}/>
        </div>
        <div className="table-view-container">
          <TableView token={this.props.token} schemaName={this.state.selectedSchema} tableName={this.state.selectedTable}  tableType={this.state.selectedTableType}/>
        </div>
      </div>
    )
  }
}

export default Home;