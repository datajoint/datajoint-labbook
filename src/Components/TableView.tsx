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
  CHAR = 15,
  VAR_CHAR = 16,
  UUID = 17,
  DATE = 18,
  DATETIME = 19,
  TIMESTAMP = 20,
  ENUM = 21
}

/**
 * Parent class for table attributes, typically never used directly
 */
class TableAttribute {
  attributeName: string;
  attributeType: TableAttributeType;
  stringTypeAttributeLengthInfo?: number;
  enumOptions?: Array<string>;

  constructor(attributeName: string, attributeType: TableAttributeType, stringTypeAttributeLengthInfo?: number, enumOptions?: Array<string>) {
    this.attributeName = attributeName;
    this.attributeType = attributeType;
    this.stringTypeAttributeLengthInfo = stringTypeAttributeLengthInfo;
    this.enumOptions = enumOptions;
  }
}

/**
 * Class for Primary attributes of a table, only has the additional field of autoIncrement for int type keys
 */
class PrimaryTableAttribute extends TableAttribute {
  autoIncrement: boolean; // Note this is only valid if the attributeType is int type

  constructor(attributeName: string, attributeType: TableAttributeType, autoIncrement: boolean, stringTypeAttributeLengthInfo?: number, enumOptions?: Array<string>) {
    super(attributeName, attributeType, stringTypeAttributeLengthInfo, enumOptions);
    this.autoIncrement = autoIncrement;
  }
}

/**
 * Class for secondary attributes of a table, deals with cases of it being nullable, defaultValue
 */
class SecondaryTableAttribute extends TableAttribute {
  nullable: boolean;
  defaultValue: string;

  constructor(attributeName: string, attributeType: TableAttributeType, nullable: boolean, defaultValue: string, stringTypeAttributeLengthInfo?: number, enumOptions?: Array<string>) {
    super(attributeName, attributeType, stringTypeAttributeLengthInfo, enumOptions);
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
  selectedTable: string
}

class TableView extends React.Component<{token: string, selectedSchemaName: string, selectedTableName: string, selectedTableType: TableType}, TableViewState> {
  constructor(props: any) {
    super(props);
    this.state = {
      tableAttributesInfo: undefined,
      currentView: 'tableContent',
      tableContentData: [],
      tableInfoData: '',
      selectedTable: ''
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
        // retrieve table headers
        fetch('/api/get_table_attributes', {
          method: 'POST',
          headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token},
          body: JSON.stringify({schemaName: this.props.selectedSchemaName, tableName: this.props.selectedTableName})
        })
          .then(result => result.json())
          .then(result => {
            this.setState({tableAttributesInfo: this.parseTableAttributes(result)});
          })
        // retrieve table content
        this.fetchTableContent();
      }
      if (this.state.currentView === 'tableInfo') {
        fetch('/api/get_table_definition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token },
          body: JSON.stringify({ schemaName: this.props.selectedSchemaName, tableName: this.props.selectedTableName })
        })
          .then(result => result.text())
          .then(result => {
            this.setState({tableInfoData: result})
          })
      }
    }
  }

  fetchTableContent() {
    fetch('/api/fetch_tuples', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token},
      body: JSON.stringify({schemaName: this.props.selectedSchemaName, tableName: this.props.selectedTableName})
    })
    .then(result => result.json())
    .then(result => {
      this.setState({tableContentData: result.tuples})
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
        tableAttributesInfo.secondaryAttributes.push(new SecondaryTableAttribute(
          secondaryAttributesInfoArray[0],
          this.parseTableTypeString(secondaryAttributesInfoArray[1]),
          secondaryAttributesInfoArray[2],
          secondaryAttributesInfoArray[3],
          undefined,
          secondaryAttributesInfoArray[1].substring(5, secondaryAttributesInfoArray[1].length - 1).replace(/'/g, '').split(',')
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
    else if (tableTypeString === 'timestamp') {
      return TableAttributeType.TIMESTAMP;
    }
    else if (tableTypeString.substring(0, 4) === 'enum') {
      return TableAttributeType.ENUM;
    }

    throw Error('Unsupported TableAttributeType: ' + tableTypeString);
  }

  getCurrentView() {
    if (this.props.selectedTableName === '') {
      return <div>Select a Table to see contents</div>
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

export {TableView, TableAttributesInfo, TableAttribute, PrimaryTableAttribute, SecondaryTableAttribute, TableAttributeType}