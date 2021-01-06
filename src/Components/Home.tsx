import React from 'react';
import './Home.css';

// Component imports
import SideMenu from './SideMenu';
import TableView from './TableView';

type DJGUIHomeState = {
  reqTableName: string,
  reqSchemaName: string,
  reqTableType: string
}
class Home extends React.Component<{token: string}, DJGUIHomeState> {
  constructor(props: any) {
    super(props);
    this.handleTableDataReq = this.handleTableDataReq.bind(this);
    this.state = {
      reqTableName: '',
      reqSchemaName: '',
      reqTableType: ''
    }
  }
  handleTableDataReq(tablename:string, tabletype:string, schema:string) {
    this.setState({reqTableName: tablename, reqSchemaName: schema, reqTableType: tabletype})
  }

  render() {
    return (
      <div className="home-container">
        <div className="side-menu-container">
          <SideMenu token={this.props.token} onReqTableData={(tablename:string, tabletype:string, schema:string)=>{this.handleTableDataReq(tablename, tabletype, schema)}}/>
        </div>
        <div className="table-view-container">
          <TableView token={this.props.token} tableName={this.state.reqTableName} schemaName={this.state.reqSchemaName} tableType={this.state.reqTableType}/>
        </div>
      </div>
    )
  }
}

export default Home;