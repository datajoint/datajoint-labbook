import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEye, faEyeSlash, faSortAmountDown} from '@fortawesome/free-solid-svg-icons'

/**
 * Enum for each type of table supported by datajoint
 */
enum TableType {
  MANUAL = 0,
  COMPUTED = 1,
  LOOKUP = 2,
  IMPORTED = 3,
  PART = 4
}

/**
 * Parent Class for all table entry which mainly contains name and type of each table
 */
class TableListEntry {
  tableName: string;
  tableType: TableType;

  constructor(tableName: string, tableType: TableType) {
    this.tableName = tableName;
    this.tableType = tableType;
  }
}

/**
 * Parent Table List Entry Class which inherits TableListEntry but adds partTables array as an attribute
 */
class ParentTableListEntry extends TableListEntry {
  partTables: Array<TableListEntry>;

  constructor(tableName: string, tableType:TableType = TableType.PART, partTables:Array<TableListEntry>) {
    super(tableName, tableType);
    this.partTables = partTables;
  }
}

/**
 * Part Table List Entry which inherits TableListEntry but set table type to PART by default
 */
class PartTableListEntry extends TableListEntry {
  constructor(tableName: string) {
    super(tableName, TableType.PART)
  }
}

type TableListState = {
  currentSort: string,
  viewAllPartTables: boolean,
  sortedTables: Array<any>,
  tablesToSort: any,
  showPT: any,
  selectedTableName: string,
  selectedTableType: string,
  tableList: Array<TableListEntry>
}

class TableList extends React.Component<{token: string, tableListDict: any, selectedSchemaBuffer: string, selectedTableName: string, onTableSelection: any}, TableListState> {
  constructor(props: any) {
    super(props);
    this.state = {
      currentSort: 'tier',
      viewAllPartTables: true,
      sortedTables: [],
      tablesToSort: this.props.tableListDict,
      showPT: {},
      selectedTableName: '',
      selectedTableType: '',
      tableList: [],
    }
  }

  toggleAllPartTableView() {
    this.setState({viewAllPartTables: !this.state.viewAllPartTables})
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    // Check if the selectedSchemaBuffer is different if so than update the tableList
    if (prevProps.selectedSchemaBuffer === this.props.selectedSchemaBuffer) {
      return;
    }

    // Parse the tableListDict and covert it to array form call tableList for rendering
    // Check if this.props.tableListDict is valid
    if (Object.keys(this.props.tableListDict).length === 0) {
      return;
    }

    // Read through each part table, create the TableListEntry and store it cache it temporarly with the parent table as the key
    let partTableDict: Record<string, Array<PartTableListEntry>> = {};

    for (let partTableFullName of this.props.tableListDict['part_tables']) {
      const partTableNameSplitResult = partTableFullName.split('.');

      // Check if key already exist, if not initalize the array
      if (!(partTableNameSplitResult[0] in partTableDict)) {
        partTableDict[partTableNameSplitResult[0]] = [];
      }

      partTableDict[partTableNameSplitResult[0]].push(new PartTableListEntry(partTableNameSplitResult[1]));
    }

    // Parse through the rest of the table types of Computed, Manual, and Lookup and attach Part table accordingly. Ignore all other type
    let tableListDictKeys: Array<string> = Object.keys(this.props.tableListDict);

    // Create a new tableList to later use for setState
    let tableList: Array<TableListEntry> = [];

    // Remove part_tables entry from the key list
    tableListDictKeys.splice(tableListDictKeys.indexOf('part_tables'));

    // Looped through each type of table that is not part
    for (let tableTypeName of tableListDictKeys) {
      // Figure out what table type to be set
      let tableType = null;

      if (tableTypeName === 'computed_tables') {
        tableType = TableType.COMPUTED;
      }
      else if (tableTypeName === 'manual_tables') {
        tableType = TableType.MANUAL;
      }
      else if (tableTypeName === 'lookup_tables') {
        tableType = TableType.LOOKUP;
      }
      else if (tableTypeName === 'imported_tables') {
        tableType = TableType.IMPORTED;
      }
      else {
        throw Error('Unsupported table type: ' + tableTypeName);
      }

      // Iterate through the table name list and append part tables if the parent table name match
      for (let parentTableName of this.props.tableListDict[tableTypeName]) {
        // Check if parent table has parts table if so inserted
        if (parentTableName in partTableDict) {
          tableList.push(new ParentTableListEntry(parentTableName, tableType, partTableDict[parentTableName]));
        }
        else {
          tableList.push(new ParentTableListEntry(parentTableName, tableType, []));
        }
      }
    }

     // Update the state
     this.setState({tableList: tableList});
  }

  tableSelected(tablename: string, tabletype: string) {
    this.props.onTableSelection(tablename, tabletype);
  }

  render() {
    return (
      <div className="table-menu">
        <div className="table-view-controls">
          <div className="sort-table-field">
            <div className="sort-field-head">
              <FontAwesomeIcon className="sort-icon" icon={faSortAmountDown} />
              <label>Sort<br />Table</label>
            </div>
            <select className="sort-table-options">
              <option value="tier">Tier</option>
              <option value="az">Alphabetical (A-Z)</option>
              {/* <option value="za">Alphabetical (Z-A)</option> */}
              {/* <option value="tb">Topological (top-bottom)</option> */}
              {/* <option value="bt">Topological (bottom-top)</option> */}
            </select>
          </div>
          <div className="view-all-part-tables">
            <div className="sort-field-head">
              <label>{this.state.viewAllPartTables ? 'Showing' : 'Hiding'} All Part Tables</label>
            </div>
            <div className="icon-container" onClick={() => this.toggleAllPartTableView()}>
              {this.state.viewAllPartTables ? <FontAwesomeIcon className="eye-icon" icon={faEye}/> : <FontAwesomeIcon className="eye-icon" icon={faEyeSlash}/>}
            </div>
          </div>
        </div>
        <div className="table-listing">

          {
            this.state.tableList.map((table: TableListEntry) => {
              return(
                <div>{table.tableName}</div>
              )
            })
          
          
          /*this.state.sortedTables.map((eachTable: any) => {
            return (
              !eachTable['type'].endsWith('.part') ?
                (<div className={this.state.selectedTableName === eachTable['name'] ? 'table-entry selected' : 'table-entry'} key={eachTable['name']} onClick={() => {this.tableSelected(eachTable['name'], eachTable['type'])}}>
                  <p className="table-name">{eachTable['name']}</p>
                  <span className={eachTable['type'] === 'computed' ? 'computed tier-label' : (eachTable['type'] === 'lookup' ? 'lookup tier-label' : (eachTable['type'] === 'manual' ? 'manual tier-label' : 'unknown tier-label'))}>{eachTable['type']}</span>
                  {eachTable['hasPartTable'] ?
                    (<div className={eachTable['type'] === 'computed' ? "computed show-part-table" : eachTable['type'] === 'imported' ? "imported show-part-table" : eachTable['type'] === 'lookup' ? "lookup show-part-table" : "manual show-part-table"}>
                      <label className="head">part table</label>
                      <div className="icon">{this.state.showPT[eachTable['name']] ?
                        <FontAwesomeIcon className="eye-icon" icon={faEye} />
                        : <FontAwesomeIcon className="eye-icon" icon={faEyeSlash} />}
                      </div>
                    </div>) : ''}
                </div>)
                :
                (
                  <div onClick={() => {this.tableSelected(eachTable['name'], 'part')}} key={eachTable['name']} className={this.state.viewAllPartTables && this.state.selectedTableName === eachTable['name'] ? "part-table-entry selected" : this.state.viewAllPartTables && this.state.selectedTableName !== eachTable['name'] ? "part-table-entry" : !this.state.viewAllPartTables ? "part-table-entry hide" : ""}>
                    <p className="table-name">{eachTable['name'].split('.')[1]}</p>
                    <span className={eachTable['type'].split('.')[0] === 'computed' ? "part-label computed-part" : eachTable['type'].split('.')[0] === 'lookup' ? "part-label lookup-part" : eachTable['type'].split('.')[0] === 'imported' ? "part-label imported-part" : "part-label manual-part"}>
                      <div className="MT-type">{eachTable['type'].split('.')[0]}</div>
                      <div className="part-table-tag">{eachTable['type'].split('.')[1] + ' table'}</div>
                    </span>
                  </div>
                )
            )
          })*/}
        </div>
      </div>
    )
  }
}

export default TableList