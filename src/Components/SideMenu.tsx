import React from 'react';
import SchemaList from './SchemaList'
import {TableList, TableType} from './TableList'
import './SideMenu.css';

/**
 * selectedSchemaBuffer: Buffer to temporarly stored the selected schema and wait until the user select a table to update the parent state which will update other views
 * tableDict: Dictonary containing all the tables type and name, please refer the API call to see what it returns.
 */
type HomeSideMenuState = {
  selectedSchemaBuffer: string
  tableDict: any,
}

/**
 * SideMenu component that handles listing schemas and tables
 * 
 */
class SideMenu extends React.Component<{token: string, selectedSchema: string, selectedTableName: string, selectedTableType: TableType, handleTableSelection: any}, HomeSideMenuState> {
  constructor(props: any) {
    super(props);
    this.handleSchemaSelection = this.handleSchemaSelection.bind(this);
    this.handleTableSelection = this.handleTableSelection.bind(this);
    this.state = {
      selectedSchemaBuffer: '',
      tableDict: {}
    }
  }

  /**
   * Handle when the user select a schema and store it in the selectedSchemaBuffer then
   * query the backend to get the update table dict 
   * @param schema 
   */
  handleSchemaSelection(schema: string) {
    // Update selectedSchemaBuffer
    this.setState({selectedSchemaBuffer: schema})
    
    // Run api fetch for list tables and deal with result
    fetch('/api/list_tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token },
      body: JSON.stringify({schemaName: schema})
    })
      .then(result => {
        // Check for error mesage 500, if so throw and error
        if (result.status === 500) {
          result.text().then(errorMessage => {throw new Error(errorMessage)});
        }
        
        return result.json();
      })
      .then(result => {
        this.setState({tableDict: result.tableTypeAndNames});
      })
      .catch((error) => {
        console.error('Error: ', error);
      })
  }

  /**
   * Function to handle table selection by including schema info from this.state.selectedSchemaBuffer
   * @param tableName
   * @param tableType Enums from TableList
   */
  handleTableSelection(tableName: string, tableType: TableType) {
    this.props.handleTableSelection(this.state.selectedSchemaBuffer, tableName, tableType);
  }

  render() {
    return (
      <div className="side-full-menu">
        <SchemaList token={this.props.token} handleSchemaSelection={(val: string) => this.handleSchemaSelection(val)} />
        <TableList
          token={this.props.token} 
          tableListDict={this.state.tableDict} 
          selectedTableName={this.props.selectedTableName}
          selectedTableType = {this.props.selectedTableType}
          onTableSelection={(tableName: string, tableType: TableType) => {this.handleTableSelection(tableName, tableType)}}
        />
      </div>
    )
  }
}
export default SideMenu;