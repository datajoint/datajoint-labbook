import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSortAmountDown, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import './SideMenu.css';


type HomeSideMenuState = {
  tableDict: any,
  selectedSchema: string
}
class SideMenu extends React.Component<{ token: string, onReqTableData: any }, HomeSideMenuState> {
  constructor(props: any) {
    super(props);
    this.handleOnSchemaSelection = this.handleOnSchemaSelection.bind(this);
    this.handleOnTableSelection = this.handleOnTableSelection.bind(this);
    this.state = {
      tableDict: {},
      selectedSchema: ''
    }
  }
  handleOnSchemaSelection(schema: string) {
    this.setState({ selectedSchema: schema })
    console.log('pushing up the selected schema')
    console.log('selected schema: ', schema)
    fetch('/api/list_tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token },
      body: JSON.stringify({ schemaName: schema })
    })
      .then(result => result.json())
      .then(result => {
        console.log('fetched tables: ', result.tableTypeAndNames);
        this.setState({ tableDict: result.tableTypeAndNames });
      })
      .catch((error) => {
        console.log('Problem fetching table list');
        console.error('Error: ', error);
      })
  }

  handleOnTableSelection(tableName: string, tableType: string) {
    console.log('pushing up table selection: ', tableName, ' - type: ', tableType);
    this.props.onReqTableData(tableName, tableType, this.state.selectedSchema);
  }

  render() {
    return (
      <div className="side-full-menu">
        <ListSchemas token={this.props.token} onSchemaSelection={(val: string) => this.handleOnSchemaSelection(val)} />
        <ListTables token={this.props.token} tableListDict={this.state.tableDict} onTableSelection={(tableName: string, tableType: string) => { console.log('tableselection prop emitting: ', tableName); this.handleOnTableSelection(tableName, tableType) }} />
      </div>

    )
  }
}

type ListSchemaState = {
  schemaList: Array<string>,
  selectedSchema: string

}
class ListSchemas extends React.Component<{ token: string, onSchemaSelection: any }, ListSchemaState> {
  constructor(props: any) {
    super(props);
    this.state = {
      schemaList: [],
      selectedSchema: ''
    }
  }
  componentDidMount() {
    fetch('/api/list_schemas', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token }
    })
      .then(result => result.json())
      .then(result => {
        console.log('schema: ', result.schemaNames);
        this.setState({ schemaList: result.schemaNames });
        this.handleSchemaSelection(result.schemaNames[0]);
      })
      .catch((error) => {
        console.log('Problem fetching schema list');
        console.error('Error: ', error);
      })
  }

  handleSortSchema(value: string) {
    console.log('handling sort schema. Sort by: ', value);
    this.setState({ schemaList: this.state.schemaList.reverse() });
  }

  handleSchemaSelection(value: string) {
    console.log('schema selected: ', value);
    if (value !== this.state.selectedSchema) {
      this.setState({ selectedSchema: value });
      this.props.onSchemaSelection(value);
    }
  }


  render() {
    return (
      <div className="schema-menu">
        <div className="search-schema-field">
          <input type="text" placeholder="Search Schema" />
          <FontAwesomeIcon className="search-icon" icon={faSearch} />
        </div>
        <div className="sort-schema-field">
          <div className="sort-field-head"><FontAwesomeIcon className="sort-icon" icon={faSortAmountDown} /><label>Sort<br />Schema</label></div>
          <select className="sort-schema-options" onChange={(e) => this.handleSortSchema(e.target.value)}>
            <option value="az">Alphabetical (A-Z)</option>
            <option value="za">Alphabetical (Z-A)</option>
            {/* <option value="tb">Topological (top-bottom)</option> */}
            {/* <option value="bt">Topological (bottom-top)</option> */}
          </select>
        </div>
        <div className="schema-listing">
          {/* <div>{this.state.schemaList[0]}</div> */}
          {this.state.schemaList.map((schema: string) => {
            return (
              <div onClick={() => this.handleSchemaSelection(schema)} className={this.state.selectedSchema === schema ? 'schema-name selected' : 'schema-name'}>{schema}</div>
            )
          })}
        </div>
      </div>
    )
  }
}

type DJGUITableMenuState = {
  currentSort: string,
  viewAllPartTables: boolean,
  sortedTables: Array<any>,
  tablesToSort: any,
  showPT: any,
  selectedTableName: string,
  selectedTableType: string
}
class ListTables extends React.Component<{ tableListDict: any, token: string, onTableSelection: any }, DJGUITableMenuState> {

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
    console.log('current view all part table state', this.state.viewAllPartTables)
    this.setState({ viewAllPartTables: !this.state.viewAllPartTables })
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    // console.log('component updated with: ', this.props.tableListDict);
    // console.log('component updated state for table: ', this.state.tablesToSort);
    if (this.props.tableListDict !== prevState.tablesToSort) {
      this.setState({ tablesToSort: this.props.tableListDict });
      this.sortTables(this.state.currentSort, this.state.tablesToSort);
      if (this.state.selectedTableName === '') {
        this.tableSelected(this.state.sortedTables[0]?.['name'], this.state.sortedTables[0]?.['type'])
      }
    }

  }

  sortTables(sortType: string, tableList: any) {

    // API fetched structure: 
    // { "computed_tables" : ["TableName1", "TableName2"],
    //   "lookup_tables": [],
    //   "manual_tables": ["TableName", "AnotherTableName"],
    //   "part_tables": ["TableName1.PartTableName1", "TableName1.PartTableName2"]    
    // }

    // Post-sort structure by tier example:
    // [ { "name" : "TableName1", "hasPartTable": true, "type": "computed"]},
    //   { "name" : "PartTableName1", "hasPartTable": false, "type": "computed.part"]},
    //   { "name" : "PartTableName2", "hasPartTable": false, "type": "computed.part"]},
    //   { "name" : "TableName2", "hasPartTable": false, "type": "computed"]},
    //   { "name" : "TableName", "hasPartTable": false, "type": "manual"]},
    //   { "name" : "AnotherTableName", "hasPartTable": false, "type": "manual"]},
    // ]
    // Post-sort structure by alphabet example:
    // [ { "name" : "AnotherTableName", "hasPartTable": false, "type": "manual"]},
    //   { "name" : "TableName", "hasPartTable": false, "type": "manual"]},
    //   { "name" : "TableName1", "hasPartTable": true, "type": "computed"]},
    //   { "name" : "PartTableName1", "hasPartTable": false, "type": "computed.part"]},
    //   { "name" : "PartTableName2", "hasPartTable": false, "type": "computed.part"]},
    //   { "name" : "TableName2", "hasPartTable": false, "type": "computed"]}
    // ]
    let copyTableList: any = {};
    copyTableList = { ...tableList };
    let hasPartTableList: string[] = [];
    switch (sortType) {
      case 'tier':
        console.log('sorting by tier');
        // console.log('before sort: ', copyTableList);
        let byTierList: any = [];
        // let partTableNames: string[] = [];
        let partTableNames: any = {}
        if (copyTableList['part_tables'] && copyTableList['part_tables'].length > 0) {
          copyTableList['part_tables'].forEach((partTable: string) => {
            let MTname = partTable.split('.')[0];
            let PTname = partTable.split('.')[1];
            partTableNames[PTname] = partTable
            hasPartTableList.push(MTname);
            Object.entries(copyTableList).forEach((tableNameList: any) => {
              // console.log('table name list here: ', tableNameList[1], 'table type: ', tableNameList[0].split('_')[0])
              if (tableNameList[1].includes(MTname)) {
                let PTposition = tableNameList[1].indexOf(MTname) + 1
                // console.log('inserting PT(', PTname + '.' +tableNameList[0].split('_')[0], ') at position ', PTposition)
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
        console.log('by TierList: ', byTierList);
        this.setState({ sortedTables: byTierList });
        break;
      case 'az':
        console.log('sorting with alphabet A-Z');
        let byAlphDownList: any = [];
        if (copyTableList['part_tables'] && copyTableList['part_tables'].length > 0) {
          let newPartTableList: string[] = [];
          copyTableList['part_tables'].forEach((partTable: string) => {
            let MTname = partTable.split('.')[0];
            hasPartTableList.push(MTname);

            Object.entries(copyTableList).forEach((byTierEntry: any) => {

              if (byTierEntry[1].includes(MTname)) {
                // console.log('this tierentry: ', byTierEntry[1], ' includes ', MTname)
                partTable = `${partTable}.${byTierEntry[0].split('_')[0]}`
                // console.log('parttablename after: ', partTable) // expecting 'MasterTableName.PartTableName.MasterTableType'
                newPartTableList.push(partTable);
              }
            })
          });
          copyTableList['new_part_tables'] = newPartTableList;
        }
        Object.entries(copyTableList).forEach((byTierEntry: any) => {
          // console.log('byTierEntry for AZ sorting: ', byTierEntry);
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
        console.log('byAlphDownList: ', byAlphDownList);
        this.setState({ sortedTables: byAlphDownList });
        break;
      case 'za':
        console.log('sorting with alphabet Z-A');
        break;
    }

  }

  tableSelected(tablename: string, tabletype: string) {
    console.log('table selected: ', tablename);
    console.log('selected table type: ', tabletype);
    this.setState({ selectedTableName: tablename, selectedTableType: tabletype });
    // this.props.onTableSelection(this.state.selectedTable);
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
            <select className="sort-table-options" onChange={(e) => { this.setState({ currentSort: e.target.value }); this.sortTables(e.target.value, this.props.tableListDict) }}>
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
              {this.state.viewAllPartTables ?
                <FontAwesomeIcon className="eye-icon" icon={faEye} />
                : <FontAwesomeIcon className="eye-icon" icon={faEyeSlash} />}

            </div>
          </div>
        </div>
        {/* <button onClick={()=>this.sortTables('tier', this.state.tablesToSort)}>test sort</button> */}
        <div className="table-listing">
          {this.state.sortedTables.map((eachTable: any) => {
            return (
              !eachTable['type'].endsWith('.part') ?
                (<div className={this.state.selectedTableName === eachTable['name'] ? 'table-entry selected' : 'table-entry'} onClick={() => { this.tableSelected(eachTable['name'], eachTable['type']) }}>
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
                  <div onClick={() => { this.tableSelected(eachTable['name'], 'part') }} className={this.state.viewAllPartTables && this.state.selectedTableName === eachTable['name'] ? "part-table-entry selected" : this.state.viewAllPartTables && this.state.selectedTableName !== eachTable['name'] ? "part-table-entry" : !this.state.viewAllPartTables ? "part-table-entry hide" : ""}>
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
export default SideMenu;