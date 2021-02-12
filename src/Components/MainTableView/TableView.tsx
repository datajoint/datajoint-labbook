import React from 'react';
import "./TableView.css";

// Component imports
import TableType from '../TableTypeEnum/TableType'
import TableContent from './TableContent';
import TableInfo from './TableInfo';
import TableAttributeType from './enums/TableAttributeType';
import TableAttributesInfo from './DataStorageClasses/TableAttributesInfo';
import PrimaryTableAttribute from './DataStorageClasses/PrimaryTableAttribute';
import SecondaryTableAttribute from './DataStorageClasses/SecondaryTableAttribute';
import TableAttribute from './DataStorageClasses/TableAttribute';
import Restriction from './DataStorageClasses/Restriction';
import RestrictionType from './enums/RestrictionType';
import { faUnderline } from '@fortawesome/free-solid-svg-icons';

type TableViewState = {
  tableAttributesInfo?: TableAttributesInfo,
  currentView: string,
  tableContentData: Array<any>,
  tableInfoData: string,
  selectedTable: string,
  errorMessage: string,
  isLoading: boolean
}

class TableView extends React.Component<{token: string, selectedSchemaName: string, selectedTableName: string, selectedTableType: TableType}, TableViewState> {
  constructor(props: any) {
    super(props);
    this.state = {
      tableAttributesInfo: undefined,
      currentView: 'tableContent',
      tableContentData: [],
      tableInfoData: '',
      selectedTable: '',
      errorMessage: '',
      isLoading: false,
    }

    this.fetchTableContent = this.fetchTableContent.bind(this);
  }

  switchCurrentView(viewChoice: string) {
    this.setState({currentView: viewChoice});
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (this.props.selectedTableName !== this.state.selectedTable || this.state.currentView !== prevState.currentView) {
      this.setState({selectedTable: this.props.selectedTableName});
      if (this.state.currentView === 'tableContent') {
        this.setState({isLoading: true})
        // retrieve table headers
        fetch('/api/get_table_attributes', {
          method: 'POST',
          headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token},
          body: JSON.stringify({schemaName: this.props.selectedSchemaName, tableName: this.props.selectedTableName})
        })
          .then(result => {
            if (!result.ok) {
              throw Error(`${result.status} - ${result.statusText}`)
            }
            return result.json()})
          .then(result => {
            this.setState({tableAttributesInfo: this.parseTableAttributes(result), errorMessage: ''})
          })
          .then(() => {
            // Fetch table content after getting the table attribute info
            this.fetchTableContent();
          })
          .catch(error => {
            this.setState({tableAttributesInfo: undefined, errorMessage: 'Problem fetching table attributes: ' + error, isLoading: false})
          })
      }
      if (this.state.currentView === 'tableInfo') {
        fetch('/api/get_table_definition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token },
          body: JSON.stringify({ schemaName: this.props.selectedSchemaName, tableName: this.props.selectedTableName })
        })
          .then(result => {
            if (!result.ok) {
              throw Error(`${result.status} - ${result.statusText}`)
            }
            return result.text()})
          .then(result => {
            this.setState({tableInfoData: result, errorMessage: ''})
          })
          .catch(error => {
            this.setState({tableInfoData: '', errorMessage: 'Problem fetching table information: ' + error})
          })
      }
    }
  }

  /**
   * Utility function for refeshing the table view of tuples
   * @param restrictions Array of valid restrictions used to query the back end to prevent it sending back everything
   */
  fetchTableContent(restrictions?: Array<Restriction>) {
    // Construct restriction base64 restriction from restriction
    let apiUrl = '/api/fetch_tuples';

    if (restrictions !== undefined) {
      let restrictionsInAPIFormat = []

      for (let restriction of restrictions) {

        if (restriction.tableAttribute?.attributeType === TableAttributeType.DATETIME) {
          restrictionsInAPIFormat.push({
            attributeName: restriction.tableAttribute?.attributeName,
            operation: Restriction.getRestrictionTypeString(restriction.restrictionType),
            value: restriction.value[0] + ' ' + restriction.value[1]
          })
        }
        else {
          restrictionsInAPIFormat.push({
            attributeName: restriction.tableAttribute?.attributeName,
            operation: Restriction.getRestrictionTypeString(restriction.restrictionType),
            value: restriction.value
          })
        }
      }

      // Add ? to url
      apiUrl += '?'

      // Covert the restrictions to json string then base64 it
      apiUrl += 'restriction=' + encodeURIComponent(btoa(JSON.stringify(restrictionsInAPIFormat)));

    }
    
    fetch(apiUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token},
      body: JSON.stringify({schemaName: this.props.selectedSchemaName, tableName: this.props.selectedTableName})
    })
    .then(result => {
      if (!result.ok) {
        throw Error(`${result.status} - ${result.statusText}`)
      }
      return result.json();
    })
    .then(result => {
      // Deal with coverting time back to datajoint format
      let tableAttributes: Array<TableAttribute> = this.state.tableAttributesInfo?.primaryAttributes as Array<TableAttribute>;
      tableAttributes = tableAttributes.concat(this.state.tableAttributesInfo?.secondaryAttributes as Array<TableAttribute>);

      // Iterate though each tableAttribute and deal with TEMPORAL types
      for (let i = 0; i < tableAttributes.length; i++) {
        if (tableAttributes[i].attributeType === TableAttributeType.TIME) {
          for (let tuple of result.tuples) {
            tuple[i] = TableAttribute.parseTimeString(tuple[i]);
          }
        }
        else if (tableAttributes[i].attributeType === TableAttributeType.TIMESTAMP || tableAttributes[i].attributeType === TableAttributeType.DATETIME) {
          for (let tuple of result.tuples) {
            tuple[i] = TableAttribute.parseDateTime(tuple[i]);
          }
        }
        else if (tableAttributes[i].attributeType === TableAttributeType.DATE) {
          for (let tuple of result.tuples) {
            tuple[i] = TableAttribute.parseDate(tuple[i]);
          }
        }
      }

      this.setState({tableContentData: result.tuples, errorMessage: '', isLoading: false})
    })
    .catch(error => {
      this.setState({tableContentData: [], errorMessage: 'Problem fetching table content: ' + error, isLoading: false})
    })
  }
 
  /**
   * Function to convert the api return json to produce a TableAttributeInfo
   * @param jsonResult 
   */
  parseTableAttributes(jsonResult: any): TableAttributesInfo {
    // Create object for the return
    let tableAttributesInfo = new TableAttributesInfo([], []);

    // Deal with primary attributes
    for (let primaryAttributeInfoArray of jsonResult.primary_attributes) {
      let tableAttributeType: TableAttributeType = this.parseTableTypeString(primaryAttributeInfoArray[1]);

      // If the datatype is of type VarChar or Char record the limit or range of it
      if (tableAttributeType === TableAttributeType.VAR_CHAR) {
        tableAttributesInfo.primaryAttributes.push(new PrimaryTableAttribute(
          primaryAttributeInfoArray[0], 
          tableAttributeType, 
          primaryAttributeInfoArray[4],
          parseInt(primaryAttributeInfoArray[1].substring(8, primaryAttributeInfoArray[1].length - 1))
          ));
      }
      else if (tableAttributeType === TableAttributeType.CHAR) {
        tableAttributesInfo.primaryAttributes.push(new PrimaryTableAttribute(
          primaryAttributeInfoArray[0], 
          tableAttributeType, 
          primaryAttributeInfoArray[4],
          parseInt(primaryAttributeInfoArray[1].substring(5, primaryAttributeInfoArray[1].length - 1))
          ));
      }
      else if (tableAttributeType === TableAttributeType.ENUM) {
        tableAttributesInfo.primaryAttributes.push(new PrimaryTableAttribute(
          primaryAttributeInfoArray[0], 
          tableAttributeType, 
          primaryAttributeInfoArray[4],
          undefined,
          primaryAttributeInfoArray[1].substring(5, primaryAttributeInfoArray[1].length - 1).replace(/'/g, '').split(',')
          ));
      }
      else if (tableAttributeType === TableAttributeType.DECIMAL) {
        let decimalAttributes = primaryAttributeInfoArray[1].substring(7).replace(/[{()}]/g, '').split(',');

        tableAttributesInfo.primaryAttributes.push(new PrimaryTableAttribute(
          primaryAttributeInfoArray[0], 
          tableAttributeType, 
          primaryAttributeInfoArray[4],
          undefined,
          undefined,
          parseInt(decimalAttributes[0]),
          parseInt(decimalAttributes[1])
          ));
      }
      else {
        tableAttributesInfo.primaryAttributes.push(new PrimaryTableAttribute(
          primaryAttributeInfoArray[0], 
          tableAttributeType, 
          primaryAttributeInfoArray[4]));
      }
    }

    // Deal with secondary attributes
    for (let secondaryAttributesInfoArray of jsonResult.secondary_attributes) {
      let tableAttributeType: TableAttributeType = this.parseTableTypeString(secondaryAttributesInfoArray[1]);

      // If the datatype is of type VarChar or Char record the limit or range of it
      if (tableAttributeType === TableAttributeType.VAR_CHAR) {
        tableAttributesInfo.secondaryAttributes.push(new SecondaryTableAttribute(
          secondaryAttributesInfoArray[0],
          this.parseTableTypeString(secondaryAttributesInfoArray[1]),
          secondaryAttributesInfoArray[2],
          secondaryAttributesInfoArray[3],
          parseInt(secondaryAttributesInfoArray[1].substring(8, secondaryAttributesInfoArray[1].length - 1))
          ));
      }
      else if (tableAttributeType === TableAttributeType.CHAR) {
        tableAttributesInfo.secondaryAttributes.push(new SecondaryTableAttribute(
          secondaryAttributesInfoArray[0],
          this.parseTableTypeString(secondaryAttributesInfoArray[1]),
          secondaryAttributesInfoArray[2],
          secondaryAttributesInfoArray[3],
          parseInt(secondaryAttributesInfoArray[1].substring(5, secondaryAttributesInfoArray[1].length - 1))
          ));
      }
      else if (tableAttributeType === TableAttributeType.ENUM) {
        // Get each enum option and save it under enumOptions
        tableAttributesInfo.secondaryAttributes.push(new SecondaryTableAttribute(
          secondaryAttributesInfoArray[0],
          this.parseTableTypeString(secondaryAttributesInfoArray[1]),
          secondaryAttributesInfoArray[2],
          secondaryAttributesInfoArray[3],
          undefined,
          secondaryAttributesInfoArray[1].substring(5, secondaryAttributesInfoArray[1].length - 1).replace(/'/g, '').split(',')
          ));
      }
      else if (tableAttributeType === TableAttributeType.DECIMAL) {
        let decimalAttributes = secondaryAttributesInfoArray[1].substring(7).replace(/[{()}]/g, '').split(',');
        // Get each enum option and save it under enumOptions
        tableAttributesInfo.secondaryAttributes.push(new SecondaryTableAttribute(
          secondaryAttributesInfoArray[0],
          this.parseTableTypeString(secondaryAttributesInfoArray[1]),
          secondaryAttributesInfoArray[2],
          secondaryAttributesInfoArray[3],
          undefined,
          undefined,
          parseInt(decimalAttributes[0]),
          parseInt(decimalAttributes[1])
          ));
      }
      else {
        tableAttributesInfo.secondaryAttributes.push(new SecondaryTableAttribute(
          secondaryAttributesInfoArray[0],
          this.parseTableTypeString(secondaryAttributesInfoArray[1]),
          secondaryAttributesInfoArray[2],
          secondaryAttributesInfoArray[3]
          ));
      }
    }

    return tableAttributesInfo;
  }

  /**
   * Function to deal figure out what is the datatype given a string
   * @param tableTypeString The table type in string that was return from the api call
   */
  parseTableTypeString(tableTypeString: string): TableAttributeType{
    if (tableTypeString === 'tinyint') {
      return TableAttributeType.TINY;
    }
    else if (tableTypeString === 'tinyint unsigned') {
      return TableAttributeType.TINY_UNSIGNED;
    }
    else if (tableTypeString === 'small') {
      return TableAttributeType.SMALL;
    }
    else if (tableTypeString === 'small unsigned') {
      return TableAttributeType.SMALL_UNSIGNED;
    }
    else if (tableTypeString === 'medium') {
      return TableAttributeType.MEDIUM;
    }
    else if (tableTypeString === 'medium unsinged') {
      return TableAttributeType.MEDIUM_UNSIGNED;
    }
    else if (tableTypeString === 'big') {
      return TableAttributeType.BIG_UNSIGNED;
    }
    else if (tableTypeString === 'big unsigned') {
      return TableAttributeType.BIG_UNSIGNED;
    }
    else if (tableTypeString === 'int') {
      return TableAttributeType.INT;
    }
    else if (tableTypeString === 'int unsigned') {
      return TableAttributeType.INT_UNSIGNED;
    }
    else if (tableTypeString.substr(0, 7) === 'decimal') {
      return TableAttributeType.DECIMAL;
    }
    else if (tableTypeString === 'decimal unsigned') { 
      // Depricated in SQL 8.0
      return TableAttributeType.DECIMAL_UNSIGNED;
    }
    else if (tableTypeString === 'float') {
      return  TableAttributeType.FLOAT;
    }
    else if (tableTypeString === 'float unsigned') {
      return TableAttributeType.FLOAT_UNSIGNED;
    }
    else if (tableTypeString === 'bool') {
      return TableAttributeType.BOOL;
    }
    else if (tableTypeString.substring(0, 4) ==='char') {
      return TableAttributeType.CHAR;
    }
    else if (tableTypeString.substring(0, 7) ==='varchar') {
      return TableAttributeType.VAR_CHAR;
    }
    else if (tableTypeString === 'uuid') {
      return TableAttributeType.UUID;
    }
    else if (tableTypeString === 'date') {
      return TableAttributeType.DATE;
    }
    else if (tableTypeString === 'datetime') {
      return TableAttributeType.DATETIME;
    }
    else if (tableTypeString === 'time') {
      return TableAttributeType.TIME;
    }
    else if (tableTypeString === 'timestamp') {
      return TableAttributeType.TIMESTAMP;
    }
    else if (tableTypeString.substring(0, 4) === 'enum') {
      return TableAttributeType.ENUM;
    }
    else if (tableTypeString === 'blob' || tableTypeString === 'longblob') {
      return TableAttributeType.BLOB;
    }
    
    throw Error('Unsupported TableAttributeType: ' + tableTypeString);
  }

  getCurrentView() {

    if (!this.state.isLoading) {
      if (this.props.selectedTableName === '') {
        return <div className="errorMessage">Select a Table to see contents</div>
      } 
      else if (this.state.errorMessage) {
        return <div className="errorMessage">{this.state.errorMessage}</div>
      }
      else {
        if (this.state.currentView === 'tableContent') {
          return (
            <TableContent 
                token={this.props.token} 
                selectedSchemaName={this.props.selectedSchemaName} 
                selectedTableName={this.state.selectedTable} 
                selectedTableType={this.props.selectedTableType}
                contentData={this.state.tableContentData} 
                tableAttributesInfo={this.state.tableAttributesInfo}
                fetchTableContent={this.fetchTableContent}
            />
          )
        }
        else if (this.state.currentView === 'tableInfo') {
          return <TableInfo infoDefData={this.state.tableInfoData}/>
        }

        // Error out cause the view selected is not valid
        throw Error('Invalid View Selected');
      }
    } else {
      return (
        <div className="loadingArea">
          <div className="loadingMessage">Loading...</div>
        </div>
      )
    }
  }

  render() {
    return (
      <div className="table-view">
        <div className="nav-tabs">
          <button className={this.state.currentView === "tableContent" ? "tab inView" : "tab"} onClick={() => this.switchCurrentView('tableContent')} disabled={this.props.selectedTableName === ''}>View Content</button>
          <button className={this.state.currentView === "tableInfo" ? "tab inView" : "tab"} onClick={() => this.switchCurrentView('tableInfo')} disabled={this.props.selectedTableName === ''}>Table Information</button>
        </div>

        <div className="view-area"> {this.getCurrentView()}
        </div>
      </div>
    )
  }
}

export default TableView;