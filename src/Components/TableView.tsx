import React from 'react';
import "./TableView.css";


// Component imports
import {TableType}  from './TableList';
import TableContent from './TableContent';
import TableInfo from './TableInfo';

// Struct and enums to handle table attirbutes
enum TableAttributeType {
  TINY = 0,
  TINY_UNSIGNED = 1,
  SMALL = 2,
  SMALL_UNSIGNED = 3,
  MEDIUM = 4,
  MEDIUM_UNSIGNED = 5,
  BIG = 6,
  BIG_UNSIGNED = 7,
  INT = 8,
  INT_UNSIGNED = 9,
  DECIMAL = 10,
  DECIMAL_UNSIGNED = 11,
  FLOAT = 12,
  FLOAT_UNSIGNED = 13,
  BOOL = 14,
  VAR_CHAR = 15,
  UUID = 16,
  DATETIME = 17,
  TIMESTAMP = 18
}

/**
 * Parent class for table attributes, typically never used directly
 */
class TableAttribute {
  attributeName: string;
  attributeType: TableAttributeType;

  constructor(attributeName: string, attributeType: TableAttributeType) {
    this.attributeName = attributeName;
    this.attributeType = attributeType;
  }
}

/**
 * Class for Primary attributes of a table, only has the additional field of autoIncrement for int type keys
 */
class PrimaryTableAttribute extends TableAttribute {
  autoIncrement: boolean; // Note this is only valid if the attributeType is int type

  constructor(attributeName: string, attributeType: TableAttributeType, autoIncrement: boolean) {
    super(attributeName, attributeType);
    this.autoIncrement = autoIncrement;
  }
}

/**
 * Class for secondary attributes of a table, deals with cases of it being nullable, defaultValue
 */
class SecondaryTableAttribute extends TableAttribute {
  nullable: boolean;
  defaultValue: string;

  constructor(attributeName: string, attributeType: TableAttributeType, nullable: boolean, defaultValue: string) {
    super(attributeName, attributeType);
    this.nullable = nullable;
    this.defaultValue = defaultValue;
  }
}

class TableAttributesInfo {
  primaryAttributes: Array<PrimaryTableAttribute>;
  secondaryAttributes: Array<SecondaryTableAttribute>;

  constructor(primaryAtributes: Array<PrimaryTableAttribute>, secondaryAttributes: Array<SecondaryTableAttribute>) {
    this.primaryAttributes = primaryAtributes;
    this.secondaryAttributes = secondaryAttributes;
  }
}

type TableViewState = {
  tableAttributesInfo?: TableAttributesInfo,
  currentView: string,
  tableContentData: Array<any>,
  tableInfoData: string,
  selectedTable: string,
  errorMessage: string
}

class TableView extends React.Component<{tableName: string, schemaName: string, tableType: TableType, token: string}, TableViewState> {
  constructor(props: any) {
    super(props);
    this.state = {
      tableAttributesInfo: undefined,
      currentView: 'tableContent',
      tableContentData: [],
      tableInfoData: '',
      selectedTable: '',
      errorMessage: ''
    }
  }

  switchCurrentView(viewChoice: string) {
    this.setState({currentView: viewChoice});
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (this.props.tableName !== this.state.selectedTable || this.state.currentView !== prevState.currentView) {
      this.setState({selectedTable: this.props.tableName});
      if (this.state.currentView === 'tableContent') {
        // retrieve table headers
        fetch('/api/get_table_attributes', {
          method: 'POST',
          headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token},
          body: JSON.stringify({schemaName: this.props.schemaName, tableName: this.props.tableName})
        })
          .then(result => {
            if (!result.ok) {
              throw Error(`${result.status} - ${result.statusText}`)
            }
            return result.json()})
          .then(result => {
            this.setState({tableAttributesInfo: this.parseTableAttributes(result), errorMessage: ''})
          })
          .catch(error => {
            console.log('type of eerrror: ', typeof error)
            console.log(error)
            console.error('problem fetching table attributes');
            console.error(error)
            this.setState({tableAttributesInfo: undefined, errorMessage: 'Problem fetching table attributes'})
          })
        // retrieve table content
        fetch('/api/fetch_tuples', {
          method: 'POST',
          headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token},
          body: JSON.stringify({schemaName: this.props.schemaName, tableName: this.props.tableName})
        })
          .then(result => {
            if (!result.ok) {
              throw Error(`${result.status} - ${result.statusText}`)
            }
            return result.json()})
          .then(result => {
            this.setState({tableContentData: result.tuples, errorMessage: ''})
          })
          .catch(error => {
            console.error('problem fetching table content');
            console.error(error);
            this.setState({tableContentData: [], errorMessage: 'Problem fetching table content'})
          })
      }
      if (this.state.currentView === 'tableInfo') {
        fetch('/api/get_table_definition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token },
          body: JSON.stringify({ schemaName: this.props.schemaName, tableName: this.props.tableName })
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
            console.error('problem fetching table information: ');
            console.error(error);
            this.setState({tableInfoData: '', errorMessage: 'Problem fetching table information'})
          })
      }
    }
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
      tableAttributesInfo.primaryAttributes.push(new PrimaryTableAttribute(
        primaryAttributeInfoArray[0], 
        this.parseTableTypeString(primaryAttributeInfoArray[1]), 
        primaryAttributeInfoArray[4]));
    }

    // Deal with secondary attributes
    for (let secondaryAttributesInfoArray of jsonResult.secondary_attributes) {
      tableAttributesInfo.secondaryAttributes.push(new SecondaryTableAttribute(
        secondaryAttributesInfoArray[0],
        this.parseTableTypeString(secondaryAttributesInfoArray[1]),
        secondaryAttributesInfoArray[2],
        secondaryAttributesInfoArray[3]
        ))
    }

    return tableAttributesInfo;
  }

  /**
   * Function to deal figure out what is the datatype given a string
   */
  parseTableTypeString(tableTypeString: string): TableAttributeType{
    if (tableTypeString === 'tiny') {
      return TableAttributeType.TINY;
    }
    else if (tableTypeString === 'tiny unsigned') {
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
    else if (tableTypeString === 'decimal') {
      return TableAttributeType.DECIMAL;
    }
    else if (tableTypeString === 'decimal unsigned') {
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
    else if ('varchar' === tableTypeString.substring(0, 7)) {
      return TableAttributeType.VAR_CHAR;
    }
    else if (tableTypeString === 'uuid') {
      return TableAttributeType.UUID;
    }
    else if (tableTypeString === 'datetime') {
      return TableAttributeType.DATETIME;
    }
    else if (tableTypeString === 'timestamp') {
      return TableAttributeType.TIMESTAMP;
    }

    throw Error('Unsupported TableAttributeType: ' + tableTypeString);
  }

  render() {
    return (
      <div className="table-view">
        <div className="nav-tabs">
          <div className={this.state.currentView === "tableContent" ? "tab inView" : "tab"} onClick={() => this.switchCurrentView('tableContent')}>View Content</div>
          <div className={this.state.currentView === "tableInfo" ? "tab inView" : "tab"} onClick={() => this.switchCurrentView('tableInfo')}>Table Information</div>
        </div>

        <div className="view-area"> {
            this.state.errorMessage ? <div className="errorMessage">{this.state.errorMessage}</div> : 
            this.state.currentView === 'tableContent' ?
            <TableContent contentData={this.state.tableContentData} tableAttributesInfo={this.state.tableAttributesInfo} tableName={this.state.selectedTable} tableType={this.props.tableType} />
            : this.state.currentView === 'tableInfo' ?
              <TableInfo infoDefData={this.state.tableInfoData} /> : ''
          }
        </div>
      </div>
    )
  }
}

export {TableView, TableAttributesInfo, PrimaryTableAttribute, SecondaryTableAttribute}