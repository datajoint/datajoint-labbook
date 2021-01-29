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
  DATETIME = 18,
  TIMESTAMP = 19
}

/**
 * Parent class for table attributes, typically never used directly
 */
class TableAttribute {
  attributeName: string;
  attributeType: TableAttributeType;
  stringTypeAttributeLengthInfo?: number;

  constructor(attributeName: string, attributeType: TableAttributeType, stringTypeAttributeLengthInfo?: number) {
    this.attributeName = attributeName;
    this.attributeType = attributeType;
    this.stringTypeAttributeLengthInfo = stringTypeAttributeLengthInfo;
  }
}

/**
 * Class for Primary attributes of a table, only has the additional field of autoIncrement for int type keys
 */
class PrimaryTableAttribute extends TableAttribute {
  autoIncrement: boolean; // Note this is only valid if the attributeType is int type

  constructor(attributeName: string, attributeType: TableAttributeType, autoIncrement: boolean, stringTypeAttributeLengthInfo?: number) {
    super(attributeName, attributeType, stringTypeAttributeLengthInfo);
    this.autoIncrement = autoIncrement;
  }
}

/**
 * Class for secondary attributes of a table, deals with cases of it being nullable, defaultValue
 */
class SecondaryTableAttribute extends TableAttribute {
  nullable: boolean;
  defaultValue: string;

  constructor(attributeName: string, attributeType: TableAttributeType, nullable: boolean, defaultValue: string, stringTypeAttributeLengthInfo?: number) {
    super(attributeName, attributeType, stringTypeAttributeLengthInfo);
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

class TableView extends React.Component<{tableName: string, schemaName: string, tableType: TableType, token: string}, TableViewState> {
  constructor(props: any) {
    super(props);
    this.state = {
      tableAttributesInfo: undefined,
      currentView: 'tableContent',
      tableContentData: [],
      tableInfoData: '',
      selectedTable: ''
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
          .then(result => result.json())
          .then(result => {
            this.setState({tableAttributesInfo: this.parseTableAttributes(result)});
          })
        // retrieve table content
        fetch('/api/fetch_tuples', {
          method: 'POST',
          headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token},
          body: JSON.stringify({schemaName: this.props.schemaName, tableName: this.props.tableName})
        })
          .then(result => result.json())
          .then(result => {
            this.setState({tableContentData: result.tuples})
          })
      }
      if (this.state.currentView === 'tableInfo') {
        fetch('/api/get_table_definition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token },
          body: JSON.stringify({ schemaName: this.props.schemaName, tableName: this.props.tableName })
        })
          .then(result => result.text())
          .then(result => {
            this.setState({tableInfoData: result})
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
      let tableAttributeType: TableAttributeType = this.parseTableTypeString(primaryAttributeInfoArray[1]);

      // If the datatype is of type VarChar or Char record the limit or range of it
      if (tableAttributeType === TableAttributeType.VAR_CHAR) {
        tableAttributesInfo.primaryAttributes.push(new PrimaryTableAttribute(
          primaryAttributeInfoArray[0], 
          tableAttributeType, 
          primaryAttributeInfoArray[4],
          parseInt(primaryAttributeInfoArray[1].substring(7, primaryAttributeInfoArray[1].length - 1))
          ));
      }
      else if (tableAttributeType === TableAttributeType.CHAR) {
        tableAttributesInfo.primaryAttributes.push(new PrimaryTableAttribute(
          primaryAttributeInfoArray[0], 
          tableAttributeType, 
          primaryAttributeInfoArray[4],
          parseInt(primaryAttributeInfoArray[1].substring(4, primaryAttributeInfoArray[1].length - 1))
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
    else if ('char' === tableTypeString.substring(0, 4)) {
      return TableAttributeType.CHAR;
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

export {TableView, TableAttributesInfo, TableAttribute, PrimaryTableAttribute, SecondaryTableAttribute, TableAttributeType}