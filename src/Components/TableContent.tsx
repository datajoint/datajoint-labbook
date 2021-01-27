import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronRight, faChevronLeft, faStepBackward, faStepForward} from '@fortawesome/free-solid-svg-icons'
import './TableContent.css'
import { TableType }  from '../utilities/enums'



type TableContentStatus = {
  currentlyOpenCtrl: string,
  ctrlIsOpen: boolean,
  tableHeadings: Array<string>,
  pageIncrement: number,
  paginatorState: Array<number>
}

enum PaginationCommand {
  forward,
  backward,
  start,
  end
}

class TableContent extends React.Component<{contentData: Array<any>, attributeData: any, tableName: string, tableType: TableType}, TableContentStatus> {
  constructor(props: any) {
    super(props);
    this.state = {
      currentlyOpenCtrl: '',
      ctrlIsOpen: false,
      tableHeadings: [],
      pageIncrement: 25,
      paginatorState: [0, 25],

    }
  }

  openControl(ctrlType: string) {
    if (this.state.currentlyOpenCtrl === ctrlType) {
      this.setState({ctrlIsOpen: false, currentlyOpenCtrl: ''});
    } else {
      this.setState({ctrlIsOpen: true, currentlyOpenCtrl: ctrlType})
    }

  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (this.props.contentData !== prevProps.contentData) {
      let headings = this.resortAttributes(this.props.attributeData)
      this.setState({tableHeadings: headings});
    }
  }

  resortAttributes(attributeData: any) {
    let tableHeadings: Array<any> = []
    attributeData['primary_attributes'].forEach((attr: Array<any>) => {
      attr.push(true) // true for primary key, false for secondary
      tableHeadings.push(attr)
    })
    attributeData['secondary_attributes'].forEach((attr: Array<any>) => {
      attr.push(false) // true for primary key, false for secondary
      tableHeadings.push(attr)
    })
    return tableHeadings
  }

  handlePagination(cmd: PaginationCommand) {
    if (cmd === PaginationCommand.start) {
      this.setState({paginatorState: [0, this.state.pageIncrement]})
    } else if (cmd === PaginationCommand.end) {
      this.setState({paginatorState: [this.props.contentData.length - this.props.contentData.length%this.state.pageIncrement, this.props.contentData.length]})
    } else if (cmd === PaginationCommand.forward) {
      if (this.state.paginatorState[1] + this.state.pageIncrement < this.props.contentData.length) {
        this.setState({paginatorState: [this.state.paginatorState[0] + this.state.pageIncrement, this.state.paginatorState[1] + this.state.pageIncrement]})
      } else {
        this.setState({paginatorState: [this.props.contentData.length - this.props.contentData.length%this.state.pageIncrement, this.props.contentData.length]})
      }
    } else if (cmd === PaginationCommand.backward) {
      if (this.state.paginatorState[0] - this.state.pageIncrement > 0 || this.state.paginatorState[0] - this.state.pageIncrement === 0) {
        this.setState({paginatorState: [this.state.paginatorState[0] - this.state.pageIncrement, this.state.paginatorState[0]]})
      } else {
        this.setState({paginatorState: [0, this.state.pageIncrement]})
      }
    }
  }

  
  render() { 
    return (
      <div className="table-content-viewer">
        <div className={this.props.tableType === TableType.COMPUTED ? 'content-view-header computed ' : this.props.tableType === TableType.IMPORTED  ? 'content-view-header imported' : this.props.tableType === TableType.LOOKUP ? 'content-view-header lookup' : this.props.tableType === TableType.MANUAL ? 'content-view-header manual' : 'content-view-header part'}>
          <div className={this.props.tableType === TableType.COMPUTED ? 'computed table-type-tag' : this.props.tableType === TableType.IMPORTED  ? 'imported table-type-tag' : this.props.tableType === TableType.LOOKUP ? 'lookup table-type-tag' : this.props.tableType === TableType.MANUAL ? 'manual table-type-tag' : 'part table-type-tag'}>{TableType[this.props.tableType]}</div>
          <h4 className="table-name">{this.props.tableName}</h4>
          <div className="content-controllers">
            <button onClick={() => this.openControl('filter')} className={this.state.currentlyOpenCtrl === 'filter' ? 'selectedButton' : ''}>Filter</button>
            <button onClick={() => this.openControl('insert')} className={this.state.currentlyOpenCtrl === 'insert' ? 'selectedButton' : ''}>Insert</button>
            <button onClick={() => this.openControl('update')} className={this.state.currentlyOpenCtrl === 'update' ? 'selectedButton' : ''}>Update</button>
            <button onClick={() => this.openControl('delete')} className={this.state.currentlyOpenCtrl === 'delete' ? 'selectedButton' : ''}>Delete</button>
          </div>
        </div>
        {this.state.ctrlIsOpen ?
          <div className="edit-zone">
            {this.state.currentlyOpenCtrl === 'filter' ?
              <div><h3>Filter</h3><p>Replace with Filter Component</p></div> :
              this.state.currentlyOpenCtrl === 'insert' ?
                <div><h3>Insert</h3><p>Replace with Insert Component</p></div> :
                this.state.currentlyOpenCtrl === 'update' ?
                  <div><h3>Update</h3><p>Replace with Update Component</p></div> :
                  <div><h3>Delete</h3><p>Replace with Delete Component</p></div>}

          </div> : ''}
        <div className="content-view-area">
          <div className="table-container">
          <table className="table">
            <thead>
            <tr className="headerRow">
              {this.state.tableHeadings.map((head) => {
                return (<th>
                  <div style={{color: head[5]? '#4A9F5A' : 'inherit'}}>{head[0]}</div>
                </th>)
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