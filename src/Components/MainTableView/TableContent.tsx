import React, {createRef} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronRight, faChevronLeft, faStepBackward, faStepForward} from '@fortawesome/free-solid-svg-icons'
import './TableContent.css'
import TableType from '../TableTypeEnum/TableType'
import Filter from './Filter/Filter'
import InsertTuple from './InsertTuple'
import UpdateTuple from './UpdateTuple'
import DeleteTuple from './DeleteTuple'
import TableAttributesInfo from './DataStorageClasses/TableAttributesInfo';
import TableAttribute from './DataStorageClasses/TableAttribute'
import TableAttributeType from './enums/TableAttributeType'

enum PaginationCommand {
  FORWARD,
  BACKWARD,
  START,
  END
}

enum TableActionType {
  FILTER = 0,
  INSERT = 1,
  UPDATE = 2,
  DELETE = 3
}

type TableContentStatus = {
  currentSelectedTableActionMenu: TableActionType,
  hideTableActionMenu: boolean,
  pageIncrement: number,
  paginatorState: Array<number>,
  selectedTableEntries: any, // lookup dictionary to store the selected table entry - for menu UI
  showWarning: boolean, // text warning when duplicate selection is made for delete/update, most likely to be take out once disable checkbox feature is finished
  isDisabledCheckbox: boolean, // tells the UI to disable any other checkboxes once there is already a selection in delete/update mode
  headerWidth: number, // part of table column resizer feature
  dragStart: number, // part of table column resizer feature
  dragDistance: number, // part of table column resizer feature
  resizeIndex: any, // part of table column resizer feature
  atEndPage: boolean, // tells the UI to disable certain pagination icons if user is on the last page
  atStartPage: boolean // tells the UI to disable certain pagination icons if user is on the first page
}

/**
 * Class component to handle rendering of the tuples as well as Filter, Insert, Update, and Delete subcomponetns
 * 
 * @param token JWT token for authentaction
 * @param selectedSchemaName Name of selected schema
 * @param selectedTableName Name of selected table
 * @param selectedTableType Type of selected table, should be one of the TableType defined under TableList
 * @param contentData Array of tuples obtain from the fetch of a table
 * @param tableAttributesInfo A TableAttributeInfo object that contains everything about both primary and secondary attributes of the table
 * @param fetchTableContent Callback function to tell the parent component to update the contentData
 */
class TableContent extends React.Component<{token: string, selectedSchemaName: string, selectedTableName: string, selectedTableType: TableType, contentData: Array<any>, tableAttributesInfo?: TableAttributesInfo, fetchTableContent: any}, TableContentStatus> {
  constructor(props: any) {
    super(props);
    this.state = {
      currentSelectedTableActionMenu: TableActionType.FILTER,
      hideTableActionMenu: true,
      pageIncrement: 25,
      paginatorState: [0, 25],
      selectedTableEntries: {},
      showWarning: false,
      isDisabledCheckbox: false,
      headerWidth: 0,
      dragStart: 0,
      dragDistance: 0,
      resizeIndex: undefined,
      atEndPage: false,
      atStartPage: true
    }

    this.getCurrentTableActionMenuComponent = this.getCurrentTableActionMenuComponent.bind(this);
    this.getShowWarningComponent = this.getShowWarningComponent.bind(this);

    // TODO: use effect to add reference for table column styling
    // cellRef: React.RefObject<HTMLTableDataCellElement>;
    // this.cellRef = createRef<HTMLTableDataCellElement>()
    // const [colRefs, setColRefs] = React.useState([]);
    // React.useEffect(() => {
    // })
  }

  /**
   * Reset the table action sub menu selection upon a new table selection
   * @param prevProps 
   * @param prevState 
   */
  componentDidUpdate(prevProps: any, prevState: any) {
    // check to see if contentData updated, if so, check length to update page info
    if (this.props.contentData !== prevProps.contentData) {
      // Update paginator state if contentData is less than 25
      if (this.props.contentData.length < 25 ) {
        this.setState({paginatorState: [0, this.props.contentData.length]})
      } else {
        this.setState({paginatorState: [0, this.state.pageIncrement]}) // set to default increment of 25
      }
    }

    // Break if the the selectedTable did not change
    if (prevProps.selectedTableName === this.props.selectedTableName) {
      return;
    }

    // Reset TableActionview
    this.setState({currentSelectedTableActionMenu: TableActionType.FILTER, hideTableActionMenu: true, selectedTableEntries: {}});
    
    // TODO: part of reference for table column width update
    // console.log('cellRef: ', this.cellRef)
    // let cellStyle
    // if (this.cellRef.current) {
    //   cellStyle = getComputedStyle(this.cellRef.current)
    //   console.log('width: ', cellStyle.width)
    // }
  }

  /**
   * Function to handle the hiding/showing of the sub menus including dealing with switching between the table actions sub menu
   * @param tableActionMenu The tableActionMenu that was clicked on
   */
  setCurrentTableActionMenu(tableActionMenu: TableActionType) {
    if (this.state.currentSelectedTableActionMenu === tableActionMenu) {
      // Toggle hiding and showing
      this.setState({hideTableActionMenu: !this.state.hideTableActionMenu});
    } 
    else {
      // Switch to the new tableActionMenu
      this.setState({hideTableActionMenu: false, currentSelectedTableActionMenu: tableActionMenu});
    }
  }

  /**
   * Function for paginating between data entries. Takes in forward/backward/start/end commands to set
   * the page view state by increments (currently hardcoded on pageIncrement state) of 25 entries.
   * @param cmd 
   */
  handlePagination(cmd: PaginationCommand) {
    // check to see if paginator needs to even run for pages with small entries, if not, break
    if (this.state.paginatorState[1] < this.state.pageIncrement) {
      this.setState({atStartPage: true, atEndPage: true})
      return;
    }
    
    // jump to beginning/end/next/previous page and update the page position and style status accordingly
    if (cmd === PaginationCommand.START) {
      this.setState({paginatorState: [0, this.state.pageIncrement], atStartPage: true, atEndPage: false})
    }
    else if (cmd === PaginationCommand.END) {
      if (this.props.contentData.length % this.state.pageIncrement > 0) {
        this.setState({paginatorState: [this.props.contentData.length - this.props.contentData.length % this.state.pageIncrement, this.props.contentData.length]})
      } 
      else {
        this.setState({paginatorState: [this.props.contentData.length - this.state.pageIncrement, this.props.contentData.length]})
      }
      this.setState({atStartPage: false, atEndPage: true})
    } 
    else if (cmd === PaginationCommand.FORWARD) {
      if (this.state.paginatorState[1] + this.state.pageIncrement < this.props.contentData.length) {
        this.setState({paginatorState: [this.state.paginatorState[0] + this.state.pageIncrement, this.state.paginatorState[1] + this.state.pageIncrement],
                       atStartPage: false})
      } 
      else if (this.props.contentData.length % this.state.pageIncrement > 0) {
        this.setState({paginatorState: [this.props.contentData.length - this.props.contentData.length % this.state.pageIncrement, this.props.contentData.length],
                       atStartPage: false, atEndPage: true})
      } 
      else {
        this.setState({paginatorState: [this.props.contentData.length - this.state.pageIncrement, this.props.contentData.length],
                       atStartPage: false, atEndPage: true})
      }
    } 
    else if (cmd === PaginationCommand.BACKWARD) {
      if (this.state.paginatorState[0] - this.state.pageIncrement > 0) {
        this.setState({paginatorState: [this.state.paginatorState[0] - this.state.pageIncrement, this.state.paginatorState[0]],
                       atEndPage: false})
      } 
      else if (this.state.paginatorState[0] - this.state.pageIncrement === 0) {
        this.setState({paginatorState: [this.state.paginatorState[0] - this.state.pageIncrement, this.state.paginatorState[0]],
                       atStartPage: true, atEndPage: false})
      }
      else {
        this.setState({paginatorState: [0, this.state.pageIncrement],
                       atStartPage: true, atEndPage: false})
      }
    }
  }

  /**
   * Switching return code based this.state.currentSelectedTableActionMenu. Mainly used in the render() function below
   */
  getCurrentTableActionMenuComponent() {
    if (this.state.currentSelectedTableActionMenu === TableActionType.FILTER) {
      return (<div className="actionMenuContainer">
          <Filter 
            tableAttributesInfo={this.props.tableAttributesInfo}
            fetchTableContent={this.props.fetchTableContent}
          />
        </div>)
    }
    else if (this.state.currentSelectedTableActionMenu === TableActionType.INSERT) {
      return (<div className="actionMenuContainer">
          <InsertTuple 
            token={this.props.token}
            selectedSchemaName={this.props.selectedSchemaName}
            selectedTableName={this.props.selectedTableName}
            tableAttributesInfo={this.props.tableAttributesInfo}
            fetchTableContent={this.props.fetchTableContent}
            tuplesToInsert = {this.state.selectedTableEntries}
          />
        </div>)
    }
    else if (this.state.currentSelectedTableActionMenu === TableActionType.UPDATE) {
      return (<div className="actionMenuContainer">
        <h1>Update</h1>
        <UpdateTuple 
            token={this.props.token}
            selectedSchemaName={this.props.selectedSchemaName}
            selectedTableName={this.props.selectedTableName}
            tableAttributesInfo={this.props.tableAttributesInfo}
            fetchTableContent={this.props.fetchTableContent}
            tupleToUpdate = {this.state.selectedTableEntries}
            clearEntrySelection={() => this.handleSelectionClearRequest()}
          />
      </div>)
    }
    else if (this.state.currentSelectedTableActionMenu === TableActionType.DELETE) {
      return (<div className="actionMenuContainer">
        <h1>Delete</h1>
        <DeleteTuple  
          token={this.props.token}
          tupleToDelete={this.state.selectedTableEntries}
          selectedSchemaName={this.props.selectedSchemaName} 
          selectedTableName={this.props.selectedTableName} 
          fetchTableContent={this.props.fetchTableContent}
          clearEntrySelection={() => this.handleSelectionClearRequest()}
        />
      </div>)
    }

    // Raise and error if none of the other conditions above trigger
    throw Error('Unsupported TableActionType');
  }

  /**
   * Function to stage the selected table entries for insert/update/delete process
   * For insert, this will be used for the entry-copy-autofill feature requested.
   * Datatype included in the selectedTableEntries but should we format datatype to 
   * DJ style here or right before making the API call?
   * @param event
   * @param tableEntry // table row selection from the checkbox
   */
  handleCheckedEntry(event: any, tableEntry: any) {
    /* goal format of this.state.selectedTableEntries = 
      {
        "primaryKey1_value.primaryKey2_value": {
          "primaryEntries": {
            "primaryKey1" : "primaryKey1_value",
            "primaryKey2" : "primaryKey2_value"
          },
          "secondaryEntries": {
            "secondaryKey1" : "secondaryKey1_value"
          },
          "attributesInfo": {
            from this.props.tableAttributesInfo
          }
        },
      }
    */

    // splitting the selected table entry into primary and secondary attributes
    let primaryTableEntries = tableEntry.slice(0, this.props.tableAttributesInfo?.primaryAttributes.length);
    let secondaryTableEntries = tableEntry.slice(this.props.tableAttributesInfo?.primaryAttributes.length);

    // pairing the table entry with it's corresponding key
    let primaryEntries: any = {};
    let secondaryEntries: any = {};
    this.props.tableAttributesInfo?.primaryAttributes.forEach((PK, index) => {
      primaryEntries[PK.attributeName] = primaryTableEntries[index]
    })
    this.props.tableAttributesInfo?.secondaryAttributes.forEach((SK, index) => {
      secondaryEntries[SK.attributeName] = secondaryTableEntries[index]
    })

    // store the labeled entries under unique keyname using its primary keys if not already there
    let uniqueEntryName = primaryTableEntries.join(".")
    let selectionsCopy = Object.assign({}, this.state.selectedTableEntries);
    if (this.state.selectedTableEntries[uniqueEntryName]) {
      // delete if already there
      const {[uniqueEntryName]: remove, ...updatedCopy} = selectionsCopy;
      this.setState({selectedTableEntries: updatedCopy});
    }
    else {
      // prevent further creation if there's already an entry and action is set to delete or update
      if (Object.entries(this.state.selectedTableEntries).length > 0 && (this.state.currentSelectedTableActionMenu === TableActionType.DELETE || this.state.currentSelectedTableActionMenu === TableActionType.UPDATE)) {
        event.preventDefault();
        this.setState({showWarning: true});
        return
      }

      // create entry if not there
      selectionsCopy[uniqueEntryName] = {
        "primaryEntries": primaryEntries,
        "secondaryEntries": secondaryEntries,
        "tableAttributesInfo": this.props.tableAttributesInfo
      }
      this.setState({selectedTableEntries: selectionsCopy});
    }
  }

  /**
   * Warning that pops up to prevent user from staging multiple entries for delete/update
   */
  getShowWarningComponent() {
    return (<div className="warningPopup">
      <div className="warningText">One item only for delete and update!!</div>
      <button onClick={() => this.setState({showWarning: false})}>dismiss</button>
    </div>)
  }

  /**
   * Clears the staging once delete/update is successful and table content has been modified
   */
  handleSelectionClearRequest() {
    this.setState({selectedTableEntries: {}});
  }

  /**
   * Function to get the list of primary attributes for rendering
   */
  getPrimaryKeys(): Array<string> {
    let primaryKeyList: Array<string> = [];

    if (this.props.tableAttributesInfo === undefined) {
      return primaryKeyList;
    }
    for (let primaryAttribute of this.props.tableAttributesInfo.primaryAttributes) {
      primaryKeyList.push(primaryAttribute.attributeName);
    }

    return primaryKeyList;
  }

  /**
   * Function to get the list of secondary attributes for rendering
   */
  getSecondaryKeys(): Array<string> {
    let secondaryKeyList: Array<string> = [];

    if (this.props.tableAttributesInfo === undefined) {
      return secondaryKeyList;
    }
    for (let secondaryAttribute of this.props.tableAttributesInfo.secondaryAttributes) {
      secondaryKeyList.push(secondaryAttribute.attributeName);
    }

    return secondaryKeyList;
  }

  /**
   * Check if the current table has blob attributes
   */
  checkIfTableHasBlobs(): boolean {
    if (this.props.tableAttributesInfo === undefined) {
      return false;
    }
    
    let tableAttributes: Array<TableAttribute> = this.props.tableAttributesInfo?.primaryAttributes as Array<TableAttribute>;
    tableAttributes = tableAttributes.concat(this.props.tableAttributesInfo?.secondaryAttributes as Array<TableAttribute>);
    
    for (let tableAttribute of tableAttributes) {
      if (tableAttribute.attributeType === TableAttributeType.BLOB) {
        return true;
      }
    }

    return false;
  }

  /**
   * Handle button rednering with disable feature for Insert Update or Delete based on the table type and return the buttons accordingly
   */
  getTableActionButtons() {
    let disableInsert: boolean = false;
    let disableUpdate: boolean = false;
    let disableDelete: boolean = false;

    if (this.props.selectedTableType === TableType.COMPUTED || this.props.selectedTableType === TableType.IMPORTED || this.checkIfTableHasBlobs()) {
      disableInsert = true;
      disableUpdate = true;
    }
    else if (this.props.selectedTableType === TableType.PART || Object.entries(this.state.selectedTableEntries).length > 1) {
      disableInsert = true;
      disableUpdate = true;
      disableDelete = true;
    }

    return(
      <div className="content-controllers">
        <button onClick={() => this.setCurrentTableActionMenu(TableActionType.FILTER)} className={this.state.currentSelectedTableActionMenu === TableActionType.FILTER && !this.state.hideTableActionMenu ? 'selectedButton' : ''}>Filter</button>
        <button onClick={() => this.setCurrentTableActionMenu(TableActionType.INSERT)} className={this.state.currentSelectedTableActionMenu === TableActionType.INSERT && !this.state.hideTableActionMenu ? 'selectedButton' : ''} disabled={disableInsert}>Insert</button>
        <button onClick={() => this.setCurrentTableActionMenu(TableActionType.UPDATE)} className={this.state.currentSelectedTableActionMenu === TableActionType.UPDATE && !this.state.hideTableActionMenu ? 'selectedButton' : ''} disabled={disableUpdate}>Update</button>
        <button onClick={() => this.setCurrentTableActionMenu(TableActionType.DELETE)} className={this.state.currentSelectedTableActionMenu === TableActionType.DELETE && !this.state.hideTableActionMenu ? 'selectedButton' : ''} disabled={disableDelete}>Delete</button>
      </div>
    )
  }

  /**
   * Function to check if the table entry has been selected or not (used to prevent multiple selection for delete/update mode)
   * @param tableEntry 
   */
  checkSelection(tableEntry: any) {
    // splitting the selected table entry into primary and secondary attributes
    let primaryTableEntries = tableEntry.slice(0, this.props.tableAttributesInfo?.primaryAttributes.length);

    // pairing the table entry with it's corresponding key
    let primaryEntries: any = {};
    this.props.tableAttributesInfo?.primaryAttributes.forEach((PK, index) => {
      primaryEntries[PK.attributeName] = primaryTableEntries[index]
    })

    // store the labeled entries under unique keyname using its primary keys if not already there
    let uniqueEntryName = primaryTableEntries.join(".")

    // returns true if entry is already selected
    return this.state.selectedTableEntries[uniqueEntryName]
  }

  /**
   * Function to set the new adjusted width (TODO: fix to make sure the fix is for each column using reference)
   * @param difference // the distance the user dragged the column divider handle
   */
  setHeaderWidth(difference: number) {
    if (this.state.headerWidth + difference > 0) {
      this.setState({headerWidth: this.state.headerWidth + difference});
    }
    else {
      this.setState({headerWidth: 1})
    }
  }

  /**
   * Listens for when cell border is selected and stores the index of the column and mouse start position
   * @param event
   * @param colIndex 
   */
  cellResizeMouseDown(event: any, colIndex: any) {
    this.setState({dragStart: event.clientX, resizeIndex: colIndex})
    // console.log('event.target.offsetParent.nextSibling: ', event.target.offsetParent.nextSibling)
  }

  /**
   * Updates the distance the user drags the table column divider
   * @param event 
   */
  cellResizeMouseMove(event: any) {
    if (this.state.dragStart) {
      this.setState({dragDistance: event.pageX - this.state.dragStart})
      this.setHeaderWidth(this.state.dragDistance);
    }
  }

  /**
   * Listens for when user is done resizing the column, resets drag position stats
   * @param event 
   */
  cellResizeMouseUp(event: any) {
    // reset column drag stats
    this.setState({dragStart: 0, dragDistance: 0, resizeIndex: undefined})
  }
  
  /**
   * Tells the element how to style width of the given table column index
   * @param colIndex 
   */
  getCellWidth(colIndex: number) {
    if (this.state.resizeIndex === colIndex && this.state.headerWidth) {
      return {
        width: this.state.headerWidth + 'px'
      }
    }
    else if (this.state.resizeIndex !== colIndex && this.state.headerWidth) {
      return {
        width: '180px' // needs to refer to each col state
      }
    } 
    else {
      return {
        width: '180px' // default
      }
    }
  }

  render() {
    return(
      <div className="table-content-viewer">
        <div className={this.props.selectedTableType === TableType.COMPUTED ? 'content-view-header computed ' : this.props.selectedTableType === TableType.IMPORTED  ? 'content-view-header imported' : this.props.selectedTableType === TableType.LOOKUP ? 'content-view-header lookup' : this.props.selectedTableType === TableType.MANUAL ? 'content-view-header manual' : 'content-view-header part'}>
          <div className={this.props.selectedTableType === TableType.COMPUTED ? 'computed table-type-tag' : this.props.selectedTableType === TableType.IMPORTED  ? 'imported table-type-tag' : this.props.selectedTableType === TableType.LOOKUP ? 'lookup table-type-tag' : this.props.selectedTableType === TableType.MANUAL ? 'manual table-type-tag' : 'part table-type-tag'}>{TableType[this.props.selectedTableType]}</div>
          <h4 className="table-name">{this.props.selectedTableName}</h4>
          {this.getTableActionButtons()}
        </div>
        {this.state.hideTableActionMenu ? '' : <this.getCurrentTableActionMenuComponent/>}
        {this.state.showWarning ? <this.getShowWarningComponent />: ''}
        <div className="content-view-area">
          <div className="table-container">
          <table className="table">
            <thead>
            <tr className="headerRow" onMouseMove={(event) => {this.cellResizeMouseMove(event)}} onMouseUp={(event) => {this.cellResizeMouseUp(event)}}>
              <th className="buffer"><input type="checkbox" /></th>
              {this.getPrimaryKeys().map((attributeName, index) => {
                return (<th key={attributeName} className="headings" style={this.getCellWidth(index)}>
                  <div className="headerContent" style={{color: '#4A9F5A'}}>{attributeName}</div>
                  <div className="cellDivider" onMouseDown={(event) => {this.cellResizeMouseDown(event, index)}}></div>
                </th>)
              })}
              {this.getSecondaryKeys().map((attributeName, index) => {
                return (<th key={attributeName} className="headings" style={this.getCellWidth(index + this.getPrimaryKeys().length)}>
                  <div className="headerContent" style={{color: 'inherit'}}>{attributeName}</div>
                  <div className="cellDivider" onMouseDown={(event) => {this.cellResizeMouseDown(event, index + this.getPrimaryKeys().length)}}></div>
                </th>)
              })}
            </tr>
            </thead>
            <tbody>
            {this.props.contentData.slice(this.state.paginatorState[0], this.state.paginatorState[1]).map((entry: any) => {
              return (<tr key={entry} className="tableRow" onMouseMove={(event) => {this.cellResizeMouseMove(event)}} onMouseUp={(event) => {this.cellResizeMouseUp(event)}}>
                <td colSpan={1}>
                  <input type="checkbox" 
                        // disable multiple check for insert mode as well until multiple insert is supported.
                         disabled={Object.entries(this.state.selectedTableEntries).length > 0 && (this.state.currentSelectedTableActionMenu === TableActionType.DELETE || this.state.currentSelectedTableActionMenu === TableActionType.UPDATE || this.state.currentSelectedTableActionMenu === TableActionType.INSERT) && !this.checkSelection(entry)} 
                         onChange={(event) => this.handleCheckedEntry(event, entry)} 
                         checked={this.checkSelection(entry)}/>
                </td>
                {entry.map((column: any, index: number) => {
                  return (
                    <td key={`${column}-${index}`} className="tableCell" style={this.getCellWidth(index)}>{column} 
                      <div className="cellDivider" onMouseDown={(event) => {this.cellResizeMouseDown(event, index)}}></div>
                    </td>)
                })
                }</tr>)
            })}
            </tbody>
          </table>
          </div>
            <div className="paginator">
              <p>Total Rows: {this.props.contentData.length}</p>

            { Object.entries(this.props.contentData).length ?
              <div className="controls">
                <FontAwesomeIcon className={!this.state.atStartPage ? "backAll icon" : "backAll icon disabled"} icon={faStepBackward} onClick={() => this.handlePagination(PaginationCommand.START)} />
                <FontAwesomeIcon className={!this.state.atStartPage ? "backOne icon" : "backOne icon disabled"} icon={faChevronLeft} onClick={() => this.handlePagination(PaginationCommand.BACKWARD)} />
                Currently viewing: {this.state.paginatorState[0] + 1} - {this.state.paginatorState[1]}
                <FontAwesomeIcon className={!this.state.atEndPage ? "forwardOne icon" : "forwardOne icon disabled"} icon={faChevronRight} onClick={() => this.handlePagination(PaginationCommand.FORWARD)} />
                <FontAwesomeIcon className={!this.state.atEndPage ? "forwardAll icon" : "forwardAll icon disabled"} icon={faStepForward} onClick={() => this.handlePagination(PaginationCommand.END)} />
              </div>
            : '' }
            </div>
        </div>

      </div>
    )
  }
}

export default TableContent;