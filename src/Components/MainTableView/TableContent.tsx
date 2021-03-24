import React, {RefObject} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronRight, faChevronLeft, faStepBackward, faStepForward, faFilter, faPlusCircle, faEdit, faTrashAlt} from '@fortawesome/free-solid-svg-icons'
import './TableContent.css'
import TableType from '../TableTypeEnum/TableType'
import Filter from './Filter/Filter'
import InsertTuple from './InsertTuple/InsertTuple'
import UpdateTuple from './UpdateTuple/UpdateTuple'
import DeleteTuple from './DeleteTuple/DeleteTuple'
import TableAttributesInfo from './DataStorageClasses/TableAttributesInfo';
import TableAttribute from './DataStorageClasses/TableAttribute'
import TableAttributeType from './enums/TableAttributeType'
import BasicLoadingIcon from '../LoadingAnimation/BasicLoadingIcon';
import Restriction from './DataStorageClasses/Restriction'

enum TableActionType {
  FILTER,
  INSERT,
  UPDATE,
  DELETE,
}

interface TableContentProps {
  token: string;
  selectedSchemaName: string;
  selectedTableName: string;
  selectedTableType: TableType;
  contentData: Array<any>; // Array of tuples obtain from the fetch of a table. Type any used here as there are many possible types with all the available via fetching the actual tuples
  totalNumOfTuples: number;
  currentPageNumber: number;
  maxPageNumber: number;
  tuplePerPage: number;
  tableAttributesInfo?: TableAttributesInfo; // A TableAttributeInfo object that contains everything about both primary and secondary attributes of the table
  setPageNumber: (pageNumber: number) => void;
  setNumberOfTuplesPerPage: (numberOfTuplesPerPage: number) => void;
  fetchTableContent: () => void; // Callback function to tell the parent component to update the contentData
  setRestrictions: (restrictions: Array<Restriction>) => void;
}

interface TableContentState {
  currentSelectedTableActionMenu: TableActionType;
  hideTableActionMenu: boolean;
  selectedTupleIndex: number; // Index of selected tuple
  selectedTuple?: {}; // Has to be an object with each attribute name as key cause the way tuple_buffer is handle in the subcomponents
  showWarning: boolean; // text warning when duplicate selection is made for delete/update, most likely to be take out once disable checkbox feature is finished
  isDisabledCheckbox: boolean; // tells the UI to disable any other checkboxes once there is already a selection in delete/update mode
  dragStart: number; // part of table column resizer feature
  resizeIndex?: number; // part of table column resizer feature
  isWaiting: boolean; // tells the UI to display loading icon while insert/update/delete are in action
  newHeaderWidths: Array<number>; // list of table column header width after user resizes
  initialTableColWidths: Array<number>; // list of initial table column width on load
  headerRowReference: RefObject<HTMLTableRowElement>;
  tuplesReference: Array<RefObject<HTMLTableRowElement>>;
}

/**
 * Component to handle rendering of the tuples as well as Filter, Insert, Update, and Delete subcomponents
 * 
 */
export default class TableContent extends React.Component<TableContentProps, TableContentState> {  
  constructor(props: TableContentProps) {
    super(props);
    this.constructTupleReferenceArray = this.constructTupleReferenceArray.bind(this);

    this.state = {
      currentSelectedTableActionMenu: TableActionType.FILTER,
      hideTableActionMenu: true,
      selectedTupleIndex: -1,
      selectedTuple: undefined,
      showWarning: false,
      isDisabledCheckbox: false,
      newHeaderWidths: [],
      dragStart: 0,
      resizeIndex: undefined,
      isWaiting: false,
      initialTableColWidths: [],
      headerRowReference: React.createRef(),
      tuplesReference: this.constructTupleReferenceArray()
    }

    this.getCurrentTableActionMenuComponent = this.getCurrentTableActionMenuComponent.bind(this);
    this.getShowWarningComponent = this.getShowWarningComponent.bind(this);
    this.goToFirstPage = this.goToFirstPage.bind(this);
    this.goToLastPage = this.goToLastPage.bind(this);
    this.goForwardAPage = this.goForwardAPage.bind(this);
    this.goBackwardAPage = this.goBackwardAPage.bind(this);
    this.handleNumberOfTuplesPerPageChange = this.handleNumberOfTuplesPerPageChange.bind(this);
  
    this.clearTupleSelection = this.clearTupleSelection.bind(this);
  }

  /**
   * Reset the table action sub menu selection upon a new table selection
   * @param prevProps 
   * @param prevState 
   */
  componentDidUpdate(prevProps: TableContentProps, prevState: TableContentState) {
    // Check if the tuplePerPage change, if so update tupleReferenceArray
    if (prevProps.tuplePerPage !== this.props.tuplePerPage) {
      this.setState({tuplesReference: this.constructTupleReferenceArray()});
    }

    // Break if the the selectedTable did not change
    if (prevProps.selectedTableName === this.props.selectedTableName) {
      return;
    }

    // Reset TableActionview
    this.setState({currentSelectedTableActionMenu: TableActionType.FILTER, hideTableActionMenu: true, selectedTuple: undefined});
  }

  /**
   * Upon the mounting of the component, determine the inital width of each column based on the max of (header cell width vs average of tuple cell width for that column)
   */
  componentDidMount() {
    // Storage buffer for initialTableColWidths
    let initialTableColWidths: Array<number> = [];
    if (this.state.headerRowReference.current) {
      // Iterate though each column and take the max between the header cell width verses the tuple average width
      for (let i = 1; i < this.state.headerRowReference.current.cells.length; i++) {
        // Compute the average width for tuples that are currently displayed for this column
        let averageTupleCellWidth = 0;
        let numOfValidTupleDOMS = 0;
        for (let j = 0; j < this.state.tuplesReference.length; j++) {
          let tupleDOM = this.state.tuplesReference[j]; // Work around for annoying typescript could be undefined error
          if (tupleDOM.current) {
            // Add to the averageTupleCellWidth
            averageTupleCellWidth += tupleDOM.current.cells[i].clientWidth;
            numOfValidTupleDOMS++;
          }
        }

        // Compute the actual average and replace the value in the averageTupleCellWidth
        if (numOfValidTupleDOMS !== 0) {
          // Take the averageTupleCellWidth / numOfValidTuplesDOMS (should be equal to this.props.tuplePerPage) to compute the average
          averageTupleCellWidth = averageTupleCellWidth / numOfValidTupleDOMS;
        }
        else {
          // Handle edge case of divding by zero
          averageTupleCellWidth = 0;
        }

        // Pushed the max between headerCellWidth vs averageTupleCellWidth into initalTableColWidths
        initialTableColWidths.push(Math.max(this.state.headerRowReference.current.cells[i].clientWidth, averageTupleCellWidth));
      }
    }

    this.setState({initialTableColWidths: initialTableColWidths});
  }

  /**
   * Helper function to construct the ReactRef arrays for the number of tuples shown per page
   * @returns an Array of RefObject for each of the entry in the table on the current page
   */
  constructTupleReferenceArray() {
    let tuplesReference: Array<RefObject<HTMLTableRowElement>> = [];
    for (let i = 0; i < this.props.tuplePerPage; i++) {
      tuplesReference.push(React.createRef());
    }

    return tuplesReference;
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
   * Call back function for goToFirstPage button
   */
  goToFirstPage() {
    this.props.setPageNumber(1);
  }

  /**
   * Call back function for goToLastPage button
   */
  goToLastPage() {
    this.props.setPageNumber(this.props.maxPageNumber);
  }

  /**
   * Call back function for goForwardAPage button
   */
  goForwardAPage() {
    if (this.props.currentPageNumber !== this.props.maxPageNumber) {
      this.props.setPageNumber(this.props.currentPageNumber + 1);
    }
  }

  /**
   * Call back function for goBackwardAPage button
   */
  goBackwardAPage() {
    if (this.props.currentPageNumber !== 1) {
      this.props.setPageNumber(this.props.currentPageNumber - 1);
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
            setRestrictions={this.props.setRestrictions}
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
            clearTupleSelection={() => this.clearTupleSelection()}
            selectedTableEntry={this.state.selectedTuple}
            insertInAction={(isWaiting: boolean) => this.handleActionWaitTime(isWaiting)}
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
            clearTupleSelection={this.clearTupleSelection}
            selectedTableEntry={this.state.selectedTuple}
            updateInAction={(isWaiting: boolean) => this.handleActionWaitTime(isWaiting)}
          />
      </div>)
    }
    else if (this.state.currentSelectedTableActionMenu === TableActionType.DELETE) {
      return (<div className="actionMenuContainer">
        <h1>Delete</h1>
        <DeleteTuple  
          token={this.props.token}
          // tupleToDelete={this.state.selectedTableEntry}
          selectedSchemaName={this.props.selectedSchemaName} 
          selectedTableName={this.props.selectedTableName} 
          tableAttributesInfo={this.props.tableAttributesInfo}
          fetchTableContent={this.props.fetchTableContent}
          clearEntrySelection={this.clearTupleSelection}
          selectedTableEntry={this.state.selectedTuple}
          deleteInAction={(isWaiting: boolean) => this.handleActionWaitTime(isWaiting)}
        />
      </div>)
    }

    // Raise and error if none of the other conditions above trigger
    throw Error('Unsupported TableActionType');
  }

  /**
   * Function to stage the selected table entries for insert/update/delete process
   * For insert, this will be used for the entry-copy-autofill feature requested.
   * Datatype included in the selectedTableEntry but should we format datatype to 
   * DJ style here or right before making the API call?
   * @param event
   * @param tableEntry // table row selection from the checkbox
   */
  handleCheckedEntry(event: React.ChangeEvent<HTMLInputElement>, tupleIndex: number) {
    // Deal with tableAttributeInfo being undefined
    if (this.props.tableAttributesInfo === undefined) {
      return;
    }

    // If the tupleIndex is already selected, deselect it
    if (tupleIndex === this.state.selectedTupleIndex) {
      this.setState({selectedTupleIndex: -1, selectedTuple: undefined});
      return;
    }

    // Obtain the array of all attributes types (Primary + Secondary)
    const tableAttributesInfo: Array<TableAttribute> = (this.props.tableAttributesInfo.primaryAttributes as Array<TableAttribute>).concat(this.props.tableAttributesInfo.secondaryAttributes as Array<TableAttribute>);

    // Get the tuple
    let rawTupleValues = this.props.contentData[tupleIndex];
    let tupleBuffer: any = {};

    // Iterate though each one and handle speical cases
    for (let i = 0; i < tableAttributesInfo.length; i++) {
      // Deal with speical datatypes such as date, time, datetime, etc.
      if (tableAttributesInfo[i].attributeType === TableAttributeType.DATE) {
        // Covert date with covertRawDateToInputFieldFormat function from TableAttribute
        tupleBuffer[tableAttributesInfo[i].attributeName] = TableAttribute.covertRawDateToInputFieldFormat(rawTupleValues[i]);
      }
      else if (tableAttributesInfo[i].attributeType === TableAttributeType.DATETIME || tableAttributesInfo[i].attributeType === TableAttributeType.TIMESTAMP) {
        // Covert DateTime or TimeStamp to DATE,TIME
        tupleBuffer[tableAttributesInfo[i].attributeName] = TableAttribute.convertRawDateTimeInputFieldFormat(rawTupleValues[i]);
        const splitResult = tupleBuffer[tableAttributesInfo[i].attributeName].split(' ')
        tupleBuffer[tableAttributesInfo[i].attributeName + '__date'] = splitResult[0];
        tupleBuffer[tableAttributesInfo[i].attributeName + '__time'] = splitResult[1]; // YES I know this is dumb, will fix it later
      }
      else {
        tupleBuffer[tableAttributesInfo[i].attributeName] = rawTupleValues[i];
      }
    }

    // Covert array into object

    this.setState({selectedTupleIndex: tupleIndex, selectedTuple: tupleBuffer});
  }

  /**
   * Call back for when the user change the number of tupples to show per page
   * @param event Value should be the number in string format
   */
  handleNumberOfTuplesPerPageChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.props.setNumberOfTuplesPerPage(parseInt(event.target.value));
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
  clearTupleSelection() {
    this.setState({selectedTupleIndex: -1, selectedTuple: undefined});
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

    if (this.props.selectedTableType === TableType.COMPUTED || this.props.selectedTableType === TableType.IMPORTED) {
      disableInsert = true;
      disableUpdate = true;
    }
    else if (this.props.selectedTableType === TableType.PART) {
      disableInsert = true;
      disableUpdate = true;
      disableDelete = true;
    }
    else if (this.checkIfTableHasBlobs()) {
      disableUpdate = true;
    }

    return(
      <div className="content-controllers">
        <button onClick={() => this.setCurrentTableActionMenu(TableActionType.FILTER)} className={this.state.currentSelectedTableActionMenu === TableActionType.FILTER && !this.state.hideTableActionMenu ? 'selectedButton' : ''}><FontAwesomeIcon className="menuIcon filter" icon={faFilter} /><span>Filter</span></button>
        <button onClick={() => this.setCurrentTableActionMenu(TableActionType.INSERT)} className={this.state.currentSelectedTableActionMenu === TableActionType.INSERT && !this.state.hideTableActionMenu ? 'selectedButton' : ''} disabled={disableInsert}><FontAwesomeIcon className="menuIcon insert" icon={faPlusCircle} /><span>Insert</span></button>
        <button onClick={() => this.setCurrentTableActionMenu(TableActionType.UPDATE)} className={this.state.currentSelectedTableActionMenu === TableActionType.UPDATE && !this.state.hideTableActionMenu ? 'selectedButton' : ''} disabled={disableUpdate}><FontAwesomeIcon className="menuIcon update" icon={faEdit} /><span>Update</span></button>
        <button onClick={() => this.setCurrentTableActionMenu(TableActionType.DELETE)} className={this.state.currentSelectedTableActionMenu === TableActionType.DELETE && !this.state.hideTableActionMenu ? 'selectedButton' : ''} disabled={disableDelete}><FontAwesomeIcon className="menuIcon delete" icon={faTrashAlt} /><span>Delete</span></button>
      </div>
    )
  }

  /**
   * Function to set the new adjusted width (TODO: fix to make sure the fix is for each column using reference)
   * @param difference // the distance the user dragged the column divider handle
   */
  setNewHeaderWidths(difference: number) {
    if (this.state.newHeaderWidths.length > 0 && difference !== 0) {
      let newWidthsCopy = this.state.newHeaderWidths
      if (this.state.resizeIndex !== undefined) {
        newWidthsCopy[this.state.resizeIndex] = this.state.newHeaderWidths[this.state.resizeIndex] + difference
        this.setState({newHeaderWidths: newWidthsCopy});
      }
    }
    else {
      this.setState({newHeaderWidths: this.state.initialTableColWidths})
    }
  }

  /**
   * Listens for when cell border is selected and stores the index of the column and mouse start position
   * @param event
   * @param colIndex 
   */
  cellResizeMouseDown(event: React.MouseEvent<HTMLDivElement, MouseEvent>, colIndex: number) {
    this.setState({dragStart: event.clientX, resizeIndex: colIndex})
  }

  /**
   * Updates the distance the user drags the table column divider
   * @param event 
   */
  cellResizeMouseMove(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (this.state.dragStart) {
      // use the drag distance to calculate the new width
      let dragDistance = event.pageX - this.state.dragStart
      this.setNewHeaderWidths(dragDistance);

      // update the new start
      this.setState({dragStart: event.clientX})
    }
  }

  /**
   * Listens for when user is done resizing the column, resets drag position stats
   * @param event 
   */
  cellResizeMouseUp(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    // reset column drag stats
    this.setState({dragStart: 0, resizeIndex: undefined})
  }
  
  /**
   * Tells the element how to style width of the given table column index
   * @param colIndex 
   */
  getCellWidth(colIndex: number) {
    if (this.state.resizeIndex === colIndex && this.state.newHeaderWidths[colIndex]) {
      return {
        width: this.state.newHeaderWidths[colIndex] + 'px'
      }
    }
    else if (this.state.resizeIndex !== colIndex && this.state.newHeaderWidths[colIndex]) {
      return {
        width: this.state.newHeaderWidths[colIndex] + 'px'
      }
    } 
    else {
      return {
        width: this.state.initialTableColWidths[colIndex] // default
      }
    }
  }

  /**
   * Converts the current table action type to string for proper rendering on loading popup text
   * @param currentTableActionType 
   */
  tableActionEnumToString(currentTableActionType: TableActionType) {
    if (currentTableActionType === TableActionType.INSERT) {
      return 'Insert';
    }
    else if (currentTableActionType === TableActionType.UPDATE) {
      return 'Update';
    }
    else if (currentTableActionType === TableActionType.DELETE) {
      return 'Delete';
    }
    else {
      return '';
    }
  }

  /**
   * Call back for subcomponents to set loading animation
   * @param isWaiting 
   */
  handleActionWaitTime(isWaiting: boolean) {
    this.setState({isWaiting: isWaiting});
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
            <tr className="headerRow" onMouseMove={(event) => {this.cellResizeMouseMove(event)}} onMouseUp={(event) => {this.cellResizeMouseUp(event)}}　ref={this.state.headerRowReference}>
              <th className="buffer"><input type="checkbox" /></th>
              {this.getPrimaryKeys().map((attributeName, index) => {
                return (<th key={attributeName} className="headings" style={this.getCellWidth(index)}>
                  <div className="headerContent primary" style={{color: '#4A9F5A'}}>{attributeName}</div>
                  <div className="cellDivider" onMouseDown={(event) => {this.cellResizeMouseDown(event, index)}}></div>
                </th>)
              })}
              {this.getSecondaryKeys().map((attributeName, index) => {
                return (<th key={attributeName} className="headings" style={this.getCellWidth(index + this.getPrimaryKeys().length)}>
                  <div className="headerContent secondary" style={{color: 'inherit'}}>{attributeName}</div>
                  <div className="cellDivider" onMouseDown={(event) => {this.cellResizeMouseDown(event, index + this.getPrimaryKeys().length)}}></div>
                </th>)
              })}
            </tr>
            </thead>
            <tbody>
            {this.props.contentData.map((entry: any, tupleIndex: number) => {
              // creating reference for each body column to track the width
              return (<tr key={entry} className="tableRow" onMouseMove={(event) => {this.cellResizeMouseMove(event)}} onMouseUp={(event) => {this.cellResizeMouseUp(event)}}　ref={this.state.tuplesReference[tupleIndex]}>
                <td colSpan={1}>
                  <input type="checkbox" 
                        // disable multiple check for insert mode as well until multiple insert is supported.
                         disabled={this.state.selectedTupleIndex > -1 && this.state.selectedTupleIndex !== tupleIndex} 
                         onChange={(event) => this.handleCheckedEntry(event, tupleIndex)} 
                         checked={this.state.selectedTupleIndex === tupleIndex}/>
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
              <p>Total Table Entries: {this.props.totalNumOfTuples}</p>
              <div className="number-of-rows-per-page-input">
                <p>Number of row per page</p>
                <input type='number' value={this.props.tuplePerPage} onChange={this.handleNumberOfTuplesPerPageChange}></input>
              </div>
              {Object.entries(this.props.contentData).length ?
                <div className="controls">
                  <FontAwesomeIcon className={true ? "backAll icon" : "backAll icon disabled"} icon={faStepBackward} onClick={() => this.goToFirstPage()} />
                  <FontAwesomeIcon className={true  ? "backOne icon" : "backOne icon disabled"} icon={faChevronLeft} onClick={() => this.goBackwardAPage()} />
                  Page: ({this.props.currentPageNumber + ' / ' + this.props.maxPageNumber})
                  <FontAwesomeIcon className={true  ? "forwardOne icon" : "forwardOne icon disabled"} icon={faChevronRight} onClick={() => this.goForwardAPage()} />
                  <FontAwesomeIcon className={true  ? "forwardAll icon" : "forwardAll icon disabled"} icon={faStepForward} onClick={() => this.goToLastPage()} />
                </div>
                : ''
              }
            </div>
        </div>
        {this.state.isWaiting ? (
          <div className="loadingBackdrop">
            <div className="loadingPopup">
              <BasicLoadingIcon size={80} />
              <p>{this.tableActionEnumToString(this.state.currentSelectedTableActionMenu)} in action, please hold.</p>
            </div>
          </div>
        ) : ''}
      </div>
    )
  }
}