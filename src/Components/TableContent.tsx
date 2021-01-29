import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronRight, faChevronLeft, faStepBackward, faStepForward} from '@fortawesome/free-solid-svg-icons'
import './TableContent.css'
import {TableType}  from './TableList'
import InsertTuple from './InsertTuple'
import DeleteTuple from './DeleteTuple'
import {TableAttributesInfo, PrimaryTableAttribute, SecondaryTableAttribute} from './TableView'

enum PaginationCommand {
  forward,
  backward,
  start,
  end
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
  stagedTableEntryDict: any,
  showWarning: boolean
}

class TableContent extends React.Component<{contentData: Array<any>, tableAttributesInfo?: TableAttributesInfo, tableName: string, tableType: TableType, schemaName: string, token: string}, TableContentStatus> {
  constructor(props: any) {
    super(props);
    this.state = {
      currentSelectedTableActionMenu: TableActionType.FILTER,
      hideTableActionMenu: true,
      pageIncrement: 25,
      paginatorState: [0, 25],
      stagedTableEntryDict: {},
      showWarning: false
    }

    this.getCurrentTableActionMenuComponent = this.getCurrentTableActionMenuComponent.bind(this);
    this.getShowWarningComponent = this.getShowWarningComponent.bind(this);
  }

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

  handlePagination(cmd: PaginationCommand) {
    if (cmd === PaginationCommand.start) {
      this.setState({paginatorState: [0, this.state.pageIncrement]})
    } 
    else if (cmd === PaginationCommand.end) {
      this.setState({paginatorState: [this.props.contentData.length - this.props.contentData.length%this.state.pageIncrement, this.props.contentData.length]})
    } 
    else if (cmd === PaginationCommand.forward) {
      if (this.state.paginatorState[1] + this.state.pageIncrement < this.props.contentData.length) {
        this.setState({paginatorState: [this.state.paginatorState[0] + this.state.pageIncrement, this.state.paginatorState[1] + this.state.pageIncrement]})
      } 
      else {
        this.setState({paginatorState: [this.props.contentData.length - this.props.contentData.length%this.state.pageIncrement, this.props.contentData.length]})
      }
    } 
    else if (cmd === PaginationCommand.backward) {
      if (this.state.paginatorState[0] - this.state.pageIncrement > 0 || this.state.paginatorState[0] - this.state.pageIncrement === 0) {
        this.setState({paginatorState: [this.state.paginatorState[0] - this.state.pageIncrement, this.state.paginatorState[0]]})
      } 
      else {
        this.setState({paginatorState: [0, this.state.pageIncrement]})
      }
    }
  }

  getCurrentTableActionMenuComponent() {
    if (this.state.currentSelectedTableActionMenu === TableActionType.FILTER) {
      return <div><h3>Filter</h3><p>Replace with Filter Component</p></div>;
    }
    else if (this.state.currentSelectedTableActionMenu === TableActionType.INSERT) {
      return <InsertTuple/>
    }
    else if (this.state.currentSelectedTableActionMenu === TableActionType.UPDATE) {
      return <div><h3>Update</h3><p>Replace with Update Component</p></div>;
    }
    else if (this.state.currentSelectedTableActionMenu === TableActionType.DELETE) {
      return <div><h3>Delete</h3><DeleteTuple stagedEntry={this.state.stagedTableEntryDict} tableName={this.props.tableName} schemaName={this.props.schemaName} token={this.props.token} /></div>
    }

    // Raise and error if none of the other conditions above trigger
    throw Error('Unsupported TableActionType');
  }

  /**
   * Function to stage the selected table entries for insert/update/delete process
   *  
   */
  handleCheckedEntry(event:any, tableEntry:any) {
    // goal format of this.state.stagedTableEntryDict = {
    //   "primaryKey1_value.primaryKey2_value": {
    //     "primaryEntries": {
    //       "primaryKey1" : "primaryKey1_value",
    //       "primaryKey2" : "primaryKey2_value",
    //     },
    //     "secondaryEntries": {
    //       "secondaryKey1" : "secondaryKey1_value"
    //     }
    //   },
    // }

    // getting the list of primary attributes and secondary attributes, perhaps better to just use a stored value instead
    let primaryKeys: Array<string> = this.getPrimaryKeys();
    let secondaryKeys: Array<string>  = this.getSecondaryKeys();

    // splitting the selected table entry into primary and secondary attributes
    let primaryTableEntries = tableEntry.slice(0, primaryKeys.length);
    let secondaryTableEntries = tableEntry.slice(primaryKeys.length);

    // pairing the table entry with it's corresponding key
    let primaryEntries: any = {};
    let secondaryEntries: any = {};
    primaryKeys.forEach((PK, index) => {
      primaryEntries[PK] = primaryTableEntries[index]
    })
    secondaryKeys.forEach((SK, index) => {
      secondaryEntries[SK] = secondaryTableEntries[index]
    })

    // store the labeled entries under unique keyname using its primary keys if not already there
    let uniqueEntryName = primaryTableEntries.join(".")
    let stageCopy = Object.assign({}, this.state.stagedTableEntryDict);
    if (this.state.stagedTableEntryDict[uniqueEntryName]) {
      // delete if already there
      const { [uniqueEntryName]: remove, ...updatedCopy} = stageCopy;
      this.setState({stagedTableEntryDict: updatedCopy});
    }
    else {
      // prevent further creation if there's already an entry and action is set to delete or update
      if (Object.entries(this.state.stagedTableEntryDict).length > 0 && (this.state.currentSelectedTableActionMenu === TableActionType.DELETE || this.state.currentSelectedTableActionMenu === TableActionType.UPDATE)) {
        console.log('delete and update should only allow for one entry to be staged')
        event.preventDefault();
        this.setState({showWarning: true});
        return
      }

      // create entry if not there
      stageCopy[uniqueEntryName] = {
        "primaryEntries": primaryEntries,
        "secondaryEntries": secondaryEntries
      }
      this.setState({stagedTableEntryDict: stageCopy});
    }
  }

  getShowWarningComponent() {
    return (<div className="warningPopup">
      <div className="warningText">One item only for delete and update!!</div>
      <button onClick={() => this.setState({showWarning: false})}>dismiss</button>
    </div>)
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
  
  render() { 
    return(
      <div className="table-content-viewer">
        <div className={this.props.tableType === TableType.COMPUTED ? 'content-view-header computed ' : this.props.tableType === TableType.IMPORTED  ? 'content-view-header imported' : this.props.tableType === TableType.LOOKUP ? 'content-view-header lookup' : this.props.tableType === TableType.MANUAL ? 'content-view-header manual' : 'content-view-header part'}>
          <div className={this.props.tableType === TableType.COMPUTED ? 'computed table-type-tag' : this.props.tableType === TableType.IMPORTED  ? 'imported table-type-tag' : this.props.tableType === TableType.LOOKUP ? 'lookup table-type-tag' : this.props.tableType === TableType.MANUAL ? 'manual table-type-tag' : 'part table-type-tag'}>{TableType[this.props.tableType]}</div>
          <h4 className="table-name">{this.props.tableName}</h4>
          <div className="content-controllers">
            <button onClick={() => this.setCurrentTableActionMenu(TableActionType.FILTER)} className={this.state.currentSelectedTableActionMenu === TableActionType.FILTER && !this.state.hideTableActionMenu ? 'selectedButton' : ''}>Filter</button>
            <button onClick={() => this.setCurrentTableActionMenu(TableActionType.INSERT)} className={this.state.currentSelectedTableActionMenu === TableActionType.INSERT && !this.state.hideTableActionMenu ? 'selectedButton' : ''}>Insert</button>
            <button onClick={() => this.setCurrentTableActionMenu(TableActionType.UPDATE)} className={this.state.currentSelectedTableActionMenu === TableActionType.UPDATE && !this.state.hideTableActionMenu ? 'selectedButton' : ''}>Update</button>
            <button onClick={() => this.setCurrentTableActionMenu(TableActionType.DELETE)} className={this.state.currentSelectedTableActionMenu === TableActionType.DELETE && !this.state.hideTableActionMenu ? 'selectedButton' : ''}>Delete</button>
          </div>
        </div>
        {this.state.hideTableActionMenu ? '' : <this.getCurrentTableActionMenuComponent/>}
        {this.state.showWarning ? <this.getShowWarningComponent />: ''}
        <div className="content-view-area">
          <div className="table-container">
          <table className="table">
            <thead>
            <tr className="headerRow">
              <th className="buffer"><input type="checkbox" /></th>
              {this.getPrimaryKeys().map((attributeName) => {
                return (<th className="headings">
                  <div style={{color: '#4A9F5A' }}>{attributeName}</div>
                </th>)
              })}
              {this.getSecondaryKeys().map((attributeName) => {
                return (<th className="headings">
                  <div style={{color: 'inherit'}}>{attributeName}</div>
                </th>)
              })}
            </tr>
            </thead>
            <tbody>
            {this.props.contentData.slice(this.state.paginatorState[0], this.state.paginatorState[1]).map((entry: any) => {
              return (<tr className="tableRow">
                <td colSpan={1}><input type="checkbox" onChange={(event) => this.handleCheckedEntry(event, entry)} /></td>
                {entry.map((column: any) => {
                  return (<td className="tableCell">{column}</td>)
                })
                }</tr>)
            })}
            </tbody>
          </table>
          </div>
          <div className="paginator">
            <p>Total Rows: {this.props.contentData.length}</p>
            <FontAwesomeIcon className="backAll" icon={faStepBackward} onClick={() => this.handlePagination(PaginationCommand.start)} />
            <FontAwesomeIcon className="backOne" icon={faChevronLeft} onClick={() => this.handlePagination(PaginationCommand.backward)} />
            Currently viewing: {this.state.paginatorState[0] + 1} - {this.state.paginatorState[1]}
            <FontAwesomeIcon className="forwardOne" icon={faChevronRight} onClick={() => this.handlePagination(PaginationCommand.forward)} />
            <FontAwesomeIcon className="forwardAll" icon={faStepForward} onClick={() => this.handlePagination(PaginationCommand.end)} />
          </div>
        </div>

      </div>
    )
  }
}

export default TableContent;