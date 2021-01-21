import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEye, faEyeSlash, faSortAmountDown} from '@fortawesome/free-solid-svg-icons'

type TableListState = {
  currentSort: string,
  viewAllPartTables: boolean,
  sortedTables: Array<any>,
  tablesToSort: any,
  showPT: any,
  selectedTableName: string,
  selectedTableType: string
}

class TableList extends React.Component<{tableListDict: any, token: string, onTableSelection: any}, TableListState> {

  constructor(props: any) {
    super(props);
    this.state = {
      currentSort: 'tier',
      viewAllPartTables: true,
      sortedTables: [],
      tablesToSort: this.props.tableListDict,
      showPT: {},
      selectedTableName: '',
      selectedTableType: ''
    }
  }

  toggleAllPartTableView() {
    this.setState({viewAllPartTables: !this.state.viewAllPartTables})
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (this.props.tableListDict !== prevState.tablesToSort) {
      this.setState({ tablesToSort: this.props.tableListDict });
      this.sortTables(this.state.currentSort, this.state.tablesToSort);
      if (this.state.selectedTableName === '') {
        this.tableSelected(this.state.sortedTables[0]?.['name'], this.state.sortedTables[0]?.['type'])
      }
    }

  }

  sortTables(sortType: string, tableList: any) {
    /*
    API fetched structure: 
    { "computed_tables" : ["TableName1", "TableName2"],
      "lookup_tables": [],
      "manual_tables": ["TableName", "AnotherTableName"],
      "part_tables": ["TableName1.PartTableName1", "TableName1.PartTableName2"]    
    }

    Post-sort structure by tier example:
    [ { "name" : "TableName1", "hasPartTable": true, "type": "computed"]},
      { "name" : "PartTableName1", "hasPartTable": false, "type": "computed.part"]},
      { "name" : "PartTableName2", "hasPartTable": false, "type": "computed.part"]},
      { "name" : "TableName2", "hasPartTable": false, "type": "computed"]},
      { "name" : "TableName", "hasPartTable": false, "type": "manual"]},
      { "name" : "AnotherTableName", "hasPartTable": false, "type": "manual"]},
    ]
    Post-sort structure by alphabet example:
    [ { "name" : "AnotherTableName", "hasPartTable": false, "type": "manual"]},
      { "name" : "TableName", "hasPartTable": false, "type": "manual"]},
      { "name" : "TableName1", "hasPartTable": true, "type": "computed"]},
      { "name" : "PartTableName1", "hasPartTable": false, "type": "computed.part"]},
      { "name" : "PartTableName2", "hasPartTable": false, "type": "computed.part"]},
      { "name" : "TableName2", "hasPartTable": false, "type": "computed"]}
    ]
    */

    let copyTableList: any = {};
    copyTableList = { ...tableList };
    let hasPartTableList: string[] = [];
    switch (sortType) {
      case 'tier':
        let byTierList: any = [];
        let partTableNames: any = {}
        if (copyTableList['part_tables'] && copyTableList['part_tables'].length > 0) {
          copyTableList['part_tables'].forEach((partTable: string) => {
            let MTname = partTable.split('.')[0];
            let PTname = partTable.split('.')[1];
            partTableNames[PTname] = partTable
            hasPartTableList.push(MTname);
            Object.entries(copyTableList).forEach((tableNameList: any) => {
              if (tableNameList[1].includes(MTname)) {
                let PTposition = tableNameList[1].indexOf(MTname) + 1
                tableNameList[1].splice(PTposition, 0, PTname + '.' + tableNameList[0].split('_')[0])
              }
            });
          })
        }
        Object.entries(copyTableList).forEach((byTierEntry: any) => {
          byTierEntry[1].forEach((tableName: any) => {
            if (byTierEntry[0] !== 'part_tables') {
              let tableEntry: any = {
                name: tableName,
              }
              if (hasPartTableList.includes(tableName)) {
                tableEntry['hasPartTable'] = true;
                tableEntry['type'] = byTierEntry[0].split('_')[0];
              } else if (Object.keys(partTableNames).includes(tableName.split('.')[0])) {
                tableEntry['hasPartTable'] = false;
                tableEntry['type'] = tableName.split('.')[1] ? tableName.split('.')[1] + '.part' : byTierEntry[0].split('_')[0]; // for cases where there's the same tablename as another master's part table in the same schema/table type
                tableEntry['name'] = partTableNames[tableName.split('.')[0]];
              } else {
                tableEntry['hasPartTable'] = false;
                tableEntry['type'] = byTierEntry[0].split('_')[0];
              }
              byTierList.push(tableEntry);
            }
          });
        });
        this.setState({sortedTables: byTierList});
        break;
      case 'az':
        let byAlphDownList: any = [];
        if (copyTableList['part_tables'] && copyTableList['part_tables'].length > 0) {
          let newPartTableList: string[] = [];
          copyTableList['part_tables'].forEach((partTable: string) => {
            let MTname = partTable.split('.')[0];
            hasPartTableList.push(MTname);

            Object.entries(copyTableList).forEach((byTierEntry: any) => {

              if (byTierEntry[1].includes(MTname)) {
                partTable = `${partTable}.${byTierEntry[0].split('_')[0]}`
                newPartTableList.push(partTable);
              }
            })
          });
          copyTableList['new_part_tables'] = newPartTableList;
        }
        Object.entries(copyTableList).forEach((byTierEntry: any) => {
          byTierEntry[1].forEach((tableName: string) => {
            if (byTierEntry[0] !== 'part_tables') {
              let tableEntry: any = {
                name: tableName,
                type: byTierEntry[0].split('_')[0]
              }
              if (hasPartTableList.includes(tableName)) {
                tableEntry['hasPartTable'] = true;
                tableEntry['type'] = byTierEntry[0].split('_')[0]
              } else if (byTierEntry[0] === 'new_part_tables') {
                tableEntry['type'] = `${tableName.split('.')[2]}.part`;
                tableEntry['name'] = tableName.split('.').slice(0, 2).join('.');
              } else {
                tableEntry['hasPartTable'] = false;
                tableEntry['type'] = byTierEntry[0].split('_')[0]
              }
              byAlphDownList.push(tableEntry); // not alphabetized yet - just dumping for now
            }
          })
        })
        byAlphDownList.sort((a: any, b: any) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        this.setState({sortedTables: byAlphDownList});
        break;
      case 'za':
        break;
    }
  }

  tableSelected(tablename: string, tabletype: string) {
    this.setState({selectedTableName: tablename, selectedTableType: tabletype});
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
            <select className="sort-table-options" onChange={(e) => {this.setState({ currentSort: e.target.value}); this.sortTables(e.target.value, this.props.tableListDict) }}>
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
          {this.state.sortedTables.map((eachTable: any) => {
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
          })}
        </div>
      </div>
    )
  }
}

export default TableList