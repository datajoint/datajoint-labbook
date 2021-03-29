import React from 'react';
import SchemaList from './SchemaList';
import TableList from './TableList';
import TableType from '../TableTypeEnum/TableType';
import './SideMenu.css';
import TableListDict from './TableListDict';

interface SideMenuProps {
  token: string;
  selectedSchema: string;
  selectedTableName: string; 
  selectedTableType: TableType; 
  handleTableSelection: any;
}

/**
 * selectedSchemaBuffer: Buffer to temporarly stored the selected schema and wait until the user select a table to update the parent state which will update other views
 * tableDict: Dictonary containing all the tables type and name, please refer the API call to see what it returns.
 */
 interface HomeSideMenuState {
  selectedSchemaBuffer: string;
  tableListDict?: TableListDict;
  tableListIsLoading: boolean;
}

/**
 * SideMenu component that handles listing schemas and tables
 * 
 */
export default class SideMenu extends React.Component<SideMenuProps, HomeSideMenuState> {
  constructor(props: SideMenuProps) {
    super(props);
    this.handleSchemaSelection = this.handleSchemaSelection.bind(this);
    this.handleTableSelection = this.handleTableSelection.bind(this);
    this.state = {
      selectedSchemaBuffer: '',
      tableListDict: undefined,
      tableListIsLoading: false
    }
  }

  /**
   * Handle when the user select a schema and store it in the selectedSchemaBuffer then
   * query the backend to get the update table dict 
   * @param schemaName 
   */
  handleSchemaSelection(schemaName: string) {
    // Update selectedSchemaBuffer
    this.setState({selectedSchemaBuffer: schemaName, tableListIsLoading: true})
    
    // Run api fetch for list tables and deal with result
    fetch(`${process.env.REACT_APP_DJLABBOOK_BACKEND_PREFIX}/schema/` + schemaName + '/table', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token }
    })
    .then(result => {
      this.setState({tableListIsLoading: false})
      // Check for error mesage 500, if so throw and error
      if (result.status === 500) {
        result.text().then(errorMessage => {throw new Error(errorMessage)});
      }
      
      return result.json();
    })
    .then(result => {
      this.setState({tableListDict: new TableListDict(result.tableTypes)});
    })
    .catch((error) => {
      this.setState({tableListIsLoading: false})
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
        <SchemaList token={this.props.token} currentlySelectedSchema={this.state.selectedSchemaBuffer} handleSchemaSelection={(val: string) => this.handleSchemaSelection(val)} />
        <TableList
          token={this.props.token} 
          tableListDict={this.state.tableListDict} 
          selectedTableName={this.props.selectedTableName}
          selectedTableType = {this.props.selectedTableType}
          onTableSelection={(tableName: string, tableType: TableType) => {this.handleTableSelection(tableName, tableType)}}
          tableListIsLoading={this.state.tableListIsLoading}
        />
      </div>
    )
  }
}