import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronRight, faChevronLeft, faStepBackward, faStepForward} from '@fortawesome/free-solid-svg-icons'
import './TableContent.css'
import {TableType}  from './TableList'
import InsertTuple from './InsertTuple'
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
  paginatorState: Array<number>
}

class TableContent extends React.Component<{contentData: Array<any>, tableAttributesInfo?: TableAttributesInfo, tableName: string, tableType: TableType}, TableContentStatus> {
  constructor(props: any) {
    super(props);
    this.state = {
      currentSelectedTableActionMenu: TableActionType.FILTER,
      hideTableActionMenu: true,
      pageIncrement: 25,
      paginatorState: [0, 25]
    }

    this.getCurrentTableActionMenuComponent = this.getCurrentTableActionMenuComponent.bind(this);
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
      return <div><h3>Delete</h3><p>Replace with Delete Component</p></div>
    }

    // Raise and error if none of the other conditions above trigger
    throw Error('Unsupported TableActionType');
  }

  /**
   * Function to get the list of attributes for rendering
   */
  getTableAttributeHeadingList(): Array<string> {
    let headingList: Array<string> = [];

    if (this.props.tableAttributesInfo === undefined) {
      return headingList;
    }

    // Deal with primary attributes from tableAttributesInfo
    for (let primaryAttribute of this.props.tableAttributesInfo.primaryAttributes) {
      headingList.push(primaryAttribute.attributeName);
    }

    // Deal with secondary attributes from secondaryAttributesInfo
    for (let secondary_attributes of this.props.tableAttributesInfo.secondaryAttributes) {
      headingList.push(secondary_attributes.attributeName);
    }

    return headingList;
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
        <div className="content-view-area">
          <div className="table-container">
          <table className="table">
            <thead>
            <tr className="headerRow">
              {this.getTableAttributeHeadingList().map((attributeName) => {
                return <div>{attributeName}</div> // Make this look pretty again - Daniel
              })}
            </tr>
            </thead>
            <tbody>
            {this.props.contentData.slice(this.state.paginatorState[0], this.state.paginatorState[1]).map((entry: any) => {
              return (<tr className="tableRow">
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