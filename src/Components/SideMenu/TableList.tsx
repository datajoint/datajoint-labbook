import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEye, faEyeSlash, faSearch, faSortAmountDown} from '@fortawesome/free-solid-svg-icons';
import TableType from '../TableTypeEnum/TableType';
import './TableList.css';
import TableListLoading from '../LoadingAnimation/TableListLoading';
import TableListDict from './TableListDict'

enum TableSortMode {
  ATOZ,
  ZTOA,
}

/**
 * Parent Class for all table entry which mainly contains name and type of each table
 */
class TableListEntry {
  tableName: string;
  tableType: TableType;

  /**
   * Constructor
   * @param tableName Name of table
   * @param tableType Type of table, should be one of the enums from TableType
   */
  constructor(tableName: string, tableType: TableType) {
    this.tableName = tableName;
    this.tableType = tableType;
  }
}

/**
 * Parent Table List Entry Class which inherits TableListEntry but adds partTables array as an attribute
 */
class ParentTableListEntry extends TableListEntry {
  partTables: Array<PartTableListEntry>;

  /**
   * Constructor for ParentTableListEntry
   * @param tableName Name of table
   * @param tableType Type of table, should be one of the enums from TableType
   * @param partTables Array of PartTables
   */
  constructor(tableName: string, tableType: TableType, partTables: Array<PartTableListEntry>) {
    super(tableName, tableType);
    this.partTables = partTables;
  }
}

/**
 * Part Table List Entry which inherits TableListEntry but set table type to PART by default
 */
class PartTableListEntry extends TableListEntry {
  /**
   * Construcotor for PartTableListEntry
   * @param tableName Name of part table
   */
  constructor(tableName: string) {
    super(tableName, TableType.PART);
  }
}

interface TableListProps {
  token: string;
  tableListDict?: TableListDict;
  selectedTableName: string;
  selectedTableType: TableType;
  onTableSelection: (tableName: string, tableType: TableType) => void,
  tableListIsLoading: boolean
}

interface TableListState {
  currentSort: string;
  viewAllPartTables: boolean;
  hidePartTable: Array<string>;
  tableList: Array<ParentTableListEntry>;
  restrictedTableList: Array<ParentTableListEntry>;
  searchString: string;
  currentTableSortMode: TableSortMode;
}

/**
 * Class for listing, sorting, and serachinng for tables in tableList
 */
export default class TableList extends React.Component<TableListProps, TableListState> {
  constructor(props: TableListProps) {
    super(props);
    this.state = {
      currentSort: 'tier',
      viewAllPartTables: true,
      hidePartTable: [],
      tableList: [],
      restrictedTableList: [],
      searchString: '',
      currentTableSortMode: TableSortMode.ATOZ
    }

    this.onSearchStringChange = this.onSearchStringChange.bind(this);
    this.restrictTableListBySeachString = this.restrictTableListBySeachString.bind(this);
    this.changeTableSortMode = this.changeTableSortMode.bind(this);
  }

  /**
   * Call back for toggle the visability of part tables in tablelist
   */
  toggleAllPartTableView() {
    // Controls visibility for all of the part tables in the list
    this.setState({viewAllPartTables: !this.state.viewAllPartTables})
    if (this.state.viewAllPartTables) {
      this.setState({hidePartTable: []})
    }
  }

  /**
   * Call back for hiding parts tables of a specific parent table
   * @param event HTML on click event from button
   * @param table Table object that the part table view should be hidden or shown
   */
  toggleEachPartTableView(event: React.MouseEvent<HTMLDivElement, MouseEvent>, table: TableListEntry) {
    event.stopPropagation();
    let updatedList = this.state.hidePartTable;
    if (this.state.hidePartTable.includes(table.tableName)) {
      let deleteIndex = updatedList.indexOf(table.tableName);
      updatedList.splice(deleteIndex, 1);
    } 
    else {
      updatedList.push(table.tableName)
    }

    this.setState({hidePartTable: updatedList})
  }
  
  /**
   * Handles the construction of the tableList for rendering based on if the tableListDict from props change or not
   * @param prevProps
   * @param prevState
   */
  componentDidUpdate(prevProps: TableListProps, prevState: TableListState) {
    // Check if the selectedSchemaBuffer is different if so than update the tableList
    if (prevProps.tableListDict === this.props.tableListDict) {
      return;
    }
  
    // Check if this.props.tableListDict is valid
    if (this.props.tableListDict === undefined) {
      return;
    }

    // Parse the tableListDict and covert it to array form call tableList for rendering
    // Read through each part table, create the TableListEntry and store it cache it temporarly with the parent table as the key
    let partTableDict: Record<string, Array<PartTableListEntry>> = {};

    for (let partTableFullName of this.props.tableListDict.part_tables) {
      const partTableNameSplitResult = partTableFullName.split('.');

      // Check if key already exist, if not initalize the array
      if (!(partTableNameSplitResult[0] in partTableDict)) {
        partTableDict[partTableNameSplitResult[0]] = [];
      }

      partTableDict[partTableNameSplitResult[0]].push(new PartTableListEntry(partTableNameSplitResult[1]));
    }

    // Create a new tableList to later use for setState
    let tableList: Array<ParentTableListEntry> = [];

    this.parseTableEntry(tableList, this.props.tableListDict.computed_tables, TableType.COMPUTED, partTableDict);
    this.parseTableEntry(tableList, this.props.tableListDict.manual_tables, TableType.MANUAL, partTableDict);
    this.parseTableEntry(tableList, this.props.tableListDict.lookup_tables, TableType.LOOKUP, partTableDict);
    this.parseTableEntry(tableList, this.props.tableListDict.imported_tables, TableType.IMPORTED, partTableDict);

    console.log(tableList);
    tableList = this.sortTableList(tableList, this.state.currentTableSortMode);
    console.log(tableList);
    // Update the state and reset sort mode to ATOZ
    this.setState({tableList: tableList, restrictedTableList: tableList, searchString: ''});
  }

  sortTableList(tableList: Array<ParentTableListEntry>, sortMode: TableSortMode) {
    let tableListsByTiers: any = []; // Dict to store an array for each tier of table

    // Sort the tableList into tiers first
    for (let parentTableListEntry of tableList) {
      // Check if the array is initalized
      if (tableListsByTiers[parentTableListEntry.tableType] === undefined) {
        // Initalized with an empty array
          tableListsByTiers[parentTableListEntry.tableType] = [];
      }

      // Throw the parentTableListEntry into their respective tier arrays
      tableListsByTiers[parentTableListEntry.tableType].push(parentTableListEntry);
    }

    if (sortMode === TableSortMode.ATOZ) {
      // Sort by name for each tier from A to Z
      for (let tableTierKey of Object.keys(tableListsByTiers)) {
        (tableListsByTiers[tableTierKey] as Array<ParentTableListEntry>).sort(function(a: TableListEntry, b: TableListEntry) {
          let aLowerCase = a.tableName.toLowerCase();
          let bLowerCase = b.tableName.toLowerCase();

          if (aLowerCase < bLowerCase) {
            return -1;
          }
          else if (aLowerCase > bLowerCase) {
            return 1;
          }
          else {
            return 0;
          }
        })

        // Check if the parentTableListEntry has part table, if so sort it also
        for (let parentTableListEntry of tableListsByTiers[tableTierKey] as Array<ParentTableListEntry>) {
          if (parentTableListEntry.partTables.length > 0) {
            parentTableListEntry.partTables.sort(function(a: TableListEntry, b: TableListEntry) {
              let aLowerCase = a.tableName.toLowerCase();
              let bLowerCase = b.tableName.toLowerCase();

              if (aLowerCase < bLowerCase) {
                return -1;
              }
              else if (aLowerCase > bLowerCase) {
                return 1;
              }
              else {
                return 0;
              }
            })
          }
        }
      }
    }
    else if (sortMode === TableSortMode.ZTOA) {
      // Basically exactly ATOZ but with the sort code flipped
      for (let tableTierKey of Object.keys(tableListsByTiers)) {
        (tableListsByTiers[tableTierKey] as Array<ParentTableListEntry>).sort(function(a: TableListEntry, b: TableListEntry) {
          let aLowerCase = a.tableName.toLowerCase();
          let bLowerCase = b.tableName.toLowerCase();

          if (aLowerCase < bLowerCase) {
            return 1;
          }
          else if (aLowerCase > bLowerCase) {
            return -1;
          }
          else {
            return 0;
          }
        })

        // Check if the parentTableListEntry has part table, if so sort it also
        for (let parentTableListEntry of tableListsByTiers[tableTierKey] as Array<ParentTableListEntry>) {
          if (parentTableListEntry.partTables.length > 0) {
            parentTableListEntry.partTables.sort(function(a: TableListEntry, b: TableListEntry) {
              let aLowerCase = a.tableName.toLowerCase();
              let bLowerCase = b.tableName.toLowerCase();

              if (aLowerCase < bLowerCase) {
                return 1;
              }
              else if (aLowerCase > bLowerCase) {
                return -1;
              }
              else {
                return 0;
              }
            })
          }
        }
      }
    }
    else {
      throw 'Unsupported Table List sort mode';
    }

    // Rebuild the tableList
    let sortedTableList: Array<ParentTableListEntry> = [];
    for (let tableTierKey of Object.keys(tableListsByTiers)) {
      sortedTableList = sortedTableList.concat(tableListsByTiers[tableTierKey]);
    }

    return sortedTableList;
  }

  /**
   * Given a list of parent table names, check if there is any partTables that belong to it, if so attach it then push to tableList, otherwise just push
   * @param tableList 
   * @param tableNames 
   * @param tableType 
   * @param partTableDict 
   */
  parseTableEntry(tableList: Array<ParentTableListEntry>, tableNames: Array<string>, tableType: TableType, partTableDict: Record<string, Array<PartTableListEntry>>) {
    // Iterate through the table name list and append part tables if the parent table name match
    for (let parentTableName of tableNames) {
      // Check if parent table has parts table if so inserted
      if (parentTableName in partTableDict) {
        tableList.push(new ParentTableListEntry(parentTableName, tableType, partTableDict[parentTableName]));
      }
      else {
        tableList.push(new ParentTableListEntry(parentTableName, tableType, []));
      }
    }
  }

  /**
   * Call back for Table Search box input OnChange
   * @param event 
   */
  onSearchStringChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.restrictTableListBySeachString(event.target.value);
  }

  restrictTableListBySeachString(searchString: string) {
    // Filter our the results based on the search string, assuming it is not empty
    let restrictedTableList: Array<ParentTableListEntry> = [];

    if (searchString !== '') {
      for (let parentTableListEntry of this.state.tableList) {
        if (parentTableListEntry.tableName.toLocaleLowerCase().includes(searchString.toLocaleLowerCase())) {
          restrictedTableList.push(parentTableListEntry);
        }
        else {
          for (let partTableListEntry of parentTableListEntry.partTables) {
            if (partTableListEntry.tableName.toLocaleLowerCase().includes(searchString.toLocaleLowerCase())) {
              restrictedTableList.push(parentTableListEntry);
            }
          }
        }
      }
      this.setState({searchString: searchString, restrictedTableList: restrictedTableList});
    }
    else {
      this.setState({searchString: searchString, restrictedTableList: this.state.tableList});
    }
  }

  /**
   * Due to the assumtion that schemaList is initally in alphabetical ascending order and that there is only two option to sort
   * the list that is ascending and decensding with ascending by default, we can take advantage by this by just simply fliping the list when
   * the user change between the two sort mode. We also need to change the selected schema index accordingly which is simply just lengtOfArray - currentIndex - 1
   */
  async changeTableSortMode(event: React.ChangeEvent<HTMLSelectElement>) {
    let requestedTableSortMode: TableSortMode = parseInt(event.target.value) as TableSortMode;
    if (requestedTableSortMode !== this.state.currentTableSortMode) {
      let tableList =  this.sortTableList(this.state.tableList, requestedTableSortMode);
      // Update the tableList
      await this.setState({tableList: this.sortTableList(this.state.tableList, requestedTableSortMode), currentTableSortMode: requestedTableSortMode});

      // Reapply search string restriction
      this.restrictTableListBySeachString(this.state.searchString);
    }
  }

  render() {
    return(
      <div className="table-menu">
         <div className="search-table-field">
          <input type="text" onChange={this.onSearchStringChange} value={this.state.searchString} placeholder="Search Table"/>
          <FontAwesomeIcon className="search-icon" icon={faSearch}/>
        </div>
        <div className="table-view-controls">
          <div className="sort-table-field">
            <div className="sort-field-head">
              <FontAwesomeIcon className="sort-icon" icon={faSortAmountDown} />
              <label>Sort<br />Table</label>
            </div>
            <select className="sort-table-options" onChange={this.changeTableSortMode}>
              <option value={TableSortMode.ATOZ} selected={this.state.currentTableSortMode === TableSortMode.ATOZ}>Alphabetical (A-Z)</option>
              <option value={TableSortMode.ZTOA} selected={this.state.currentTableSortMode === TableSortMode.ZTOA}>Alphabetical (Z-A)</option>
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
        {this.props.tableListIsLoading ? 
        <TableListLoading /> : 
        <div className="table-listing">
          {!this.props.tableListDict ? <p className="unselectedSchemaMessage">Select a schema to see table listing</p> : ''}
          {
            this.state.restrictedTableList.map((table: ParentTableListEntry) => {
              return(
                <div key={`${table.tableName}-${table.tableType}`}>
                  <div className={this.props.selectedTableName === table.tableName && this.props.selectedTableType === table.tableType ? 'table-entry selected' : 'table-entry'} key={`${table.tableName}-${table.tableType}`} 
                  onClick={(event) => {this.props.onTableSelection(table.tableName, table.tableType)}}>
                    <p className="table-name">{table.tableName}</p>
                    <span className={table.tableType === TableType.COMPUTED ? 'computed tier-label' : (table.tableType === TableType.LOOKUP ? 
                      'lookup tier-label' : (table.tableType === TableType.MANUAL ? 'manual tier-label' : 'imported tier-label'))}>{TableType[table.tableType].toLowerCase()}</span>
                    {table.partTables.length ?
                      (<div onClick={(event) => {this.toggleEachPartTableView(event, table)}} 
                      className={table.tableType === TableType.COMPUTED ? "computed show-part-table" : table.tableType === TableType.IMPORTED ? "imported show-part-table" : table.tableType === TableType.LOOKUP  ? "lookup show-part-table" : "manual show-part-table"}>
                        <label className="head">part table</label>
                        <div className="icon">{!this.state.viewAllPartTables || this.state.hidePartTable.includes(table.tableName) ?
                          <FontAwesomeIcon className="eye-icon" icon={faEyeSlash} />
                          : <FontAwesomeIcon className="eye-icon" icon={faEye} />}
                        </div>
                      </div>) : ''}
                  </div>
                  {table.partTables.length && !this.state.hidePartTable.includes(table.tableName) ? (
                    table.partTables.map((partTable: PartTableListEntry) => {
                      return (
                        <div onClick={() => {this.props.onTableSelection(table.tableName + '.' + partTable.tableName, partTable.tableType)}} key={partTable.tableName} 
                        className={this.state.viewAllPartTables && this.props.selectedTableName === `${table.tableName}.${partTable.tableName}` && this.props.selectedTableType === partTable.tableType ? 
                        "part-table-entry selected" : this.state.viewAllPartTables && (this.props.selectedTableName !== `${table.tableName}.${partTable.tableName}` || this.props.selectedTableType !== partTable.tableType) ? 
                        "part-table-entry" : !this.state.viewAllPartTables ? "part-table-entry hide" : ""}>
                        <p className="table-name">{partTable.tableName}</p>
                        <span className={table.tableType === TableType.COMPUTED ? "part-label computed-part" : table.tableType === TableType.LOOKUP ? "part-label lookup-part" : table.tableType === TableType.IMPORTED ? "part-label imported-part" : "part-label manual-part"}>
                          <div className="MT-type">{TableType[table.tableType].toLowerCase()}</div>
                          <div className="part-table-tag">{TableType[partTable.tableType].toLowerCase() + ' table'}</div>
                        </span>
                      </div>
                      )
                    })
                  ) : ''
                  }
                </div>
              )
            })
          }
        </div>
        }
      </div>
    )
  }
}