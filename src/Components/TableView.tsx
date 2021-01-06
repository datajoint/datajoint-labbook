import React from 'react';
import "./TableView.css";

// Component imports
import TableContent from './TableContent';
import TableInfo from './TableInfo';

type TableViewState = {
  currentView: string,
  tableContentData: Array<any>,
  tableInfoData: string,
  selectedTable: string
}
class TableView extends React.Component<{ tableName: string, schemaName: string, tableType: string, token: string }, TableViewState> {
  constructor(props: any) {
    super(props);
    this.state = {
      currentView: 'tableContent', //'tableContent' or 'tableInfo'
      tableContentData: [],
      tableInfoData: '',
      selectedTable: ''
    }
  }

  switchCurrentView(viewChoice: string) {
    this.setState({ currentView: viewChoice });
  }

  componentDidUpdate(prevProps: any, prevState: any) {


    if (this.props.tableName !== this.state.selectedTable || this.state.currentView !== prevState.currentView) {
      console.log('incoming tablename prop: ', this.props.tableName)
      console.log('current state: ', this.state.selectedTable)
      this.setState({ selectedTable: this.props.tableName });

      if (this.state.currentView === 'tableContent') {
        fetch('/api/fetch_tuples', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token },
          body: JSON.stringify({ schemaName: this.props.schemaName, tableName: this.props.tableName })
        })
          .then(result => result.json())
          .then(result => {
            console.log('fetched table content data: ', result, ' [length: ', result.tuples.length, ']');
            this.setState({ tableContentData: result.tuples })
          })
      }
      if (this.state.currentView === 'tableInfo') {
        // this.setState({selectedTable: this.props.tableName})
        fetch('/api/get_table_definition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token },
          body: JSON.stringify({ schemaName: this.props.schemaName, tableName: this.props.tableName })
        })
          .then(result => result.json())
          .then(result => {
            console.log('info result: ', result)
            this.setState({ tableInfoData: result.definition })
          })
      }
    }

  }

  render() {
    return (
      <div className="table-view">
        <div className="nav-tabs">
          <div className={this.state.currentView === "tableContent" ? "tab inView" : "tab"} onClick={() => this.switchCurrentView('tableContent')}>View Content</div>
          <div className={this.state.currentView === "tableInfo" ? "tab inView" : "tab"} onClick={() => this.switchCurrentView('tableInfo')}>Table Information</div>
        </div>
        <div className="view-area">
          {this.state.currentView === 'tableContent' ?
            <TableContent contentData={this.state.tableContentData} tableName={this.state.selectedTable} tableType={this.props.tableType} />
            : this.state.currentView === 'tableInfo' ?
              <TableInfo infoDefData={this.state.tableInfoData} /> : ''
          }

        </div>
      </div>
    )
  }
}

export default TableView;