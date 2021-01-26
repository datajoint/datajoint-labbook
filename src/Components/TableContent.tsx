import React from 'react';
import './TableContent.css'

type TableContentStatus = {
  currentlyOpenCtrl: string,
  ctrlIsOpen: boolean,
  tableHeadings: Array<string>
}
class TableContent extends React.Component<{contentData: Array<any>, attributeData: Array<any>, tableName: string, tableType: string}, TableContentStatus> {
  constructor(props: any) {
    super(props);
    this.state = {
      currentlyOpenCtrl: '',
      ctrlIsOpen: false,
      tableHeadings: []
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
      this.setState({tableHeadings: Object.keys(this.props.contentData[0])});
    }
  }

  render() {
    return (
      <div className="table-content-viewer">
        <div className={this.props.tableType === 'computed' ? 'content-view-header computed ' : this.props.tableType === 'imported' ? 'content-view-header imported' : this.props.tableType === 'lookup' ? 'content-view-header lookup' : this.props.tableType === 'manual' ? 'content-view-header manual' : 'content-view-header part'}>
          <div className={this.props.tableType === 'computed' ? 'computed table-type-tag' : this.props.tableType === 'imported' ? 'imported table-type-tag' : this.props.tableType === 'lookup' ? 'lookup table-type-tag' : this.props.tableType === 'manual' ? 'manual table-type-tag' : 'part table-type-tag'}>{this.props.tableType}</div>
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
          <div className="table">
            <div className="headerRow">
              {this.state.tableHeadings.map((head) => {
                return (<div>{head}</div>)
              })}
            </div>
            {this.props.contentData.slice(0, 25).map((entry: any) => {
              return (<div className="tableRow">
                {this.state.tableHeadings.map((heading: string) => {
                  return (<div className="tableCell">{entry[heading]}</div>)
                })
                }</div>)
            })}
          </div>
          <div className="paginator">
            <p>Total Rows: {this.props.contentData.length}</p>
          </div>
        </div>


        {/* {this.props.contentData.map((tableEntry:any) => {
                    return (
                        <div>{tableEntry}</div>
                    )
                })} */}

      </div>
    )
  }
}

export default TableContent;