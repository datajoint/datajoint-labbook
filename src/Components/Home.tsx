import React from 'react';
import './Home.css';

// Component imports
import SideMenu from './SideMenu/SideMenu';
import TableView from './MainTableView/TableView';
import TableType from './TableTypeEnum/TableType'

interface HomeProps {
  jwtToken: string;
}

interface HomeState {
  selectedSchemaName: string;
  selectedTableName: string;
  selectedTableType: TableType;
}

/**
 * Main view for DJGUI App
 */
export default class Home extends React.Component<HomeProps, HomeState> {
  constructor(props: HomeProps) {
    super(props);
    this.state = {
      selectedSchemaName: '',
      selectedTableName: '',
      selectedTableType: TableType.MANUAL
    }
    this.handleTableSelection = this.handleTableSelection.bind(this);
  }
  
  /**
   * Call back for when user selects a table of a given schema
   * @param schemaName Name of the schema that the table belongs under
   * @param tableName Name of table
   * @param tableType Type of table which should be one of options under TableType enum
   */
  handleTableSelection(schemaName: string, tableName: string, tableType: TableType) {
    this.setState({selectedSchemaName: schemaName, selectedTableName: tableName, selectedTableType: tableType});
  }

  render() {
    return (
      <div className="home-container">
        <div className="side-menu-container">
          <SideMenu token={this.props.jwtToken}
            selectedSchema={this.state.selectedSchemaName}
            selectedTableName={this.state.selectedTableName}
            selectedTableType={this.state.selectedTableType}
            handleTableSelection={(schema:string, tablename:string, tabletype:TableType)=>{this.handleTableSelection(schema, tablename, tabletype)}}/>
        </div>
        <div className="table-view-container">
          <TableView token={this.props.jwtToken} selectedSchemaName={this.state.selectedSchemaName} selectedTableName={this.state.selectedTableName}  selectedTableType={this.state.selectedTableType}/>
        </div>
      </div>
    )
  }
}