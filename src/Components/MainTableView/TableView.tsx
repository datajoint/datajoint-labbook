import React from 'react';
import "./TableView.css";

// Component imports
import TableType from '../TableTypeEnum/TableType'
import TableContent from './TableContent';
import TableInfo from './TableInfo';
import TableAttributeType from './enums/TableAttributeType';
import TableAttributesInfo from './DataStorageClasses/TableAttributesInfo';
import PrimaryTableAttribute from './DataStorageClasses/PrimaryTableAttribute';
import SecondaryTableAttribute from './DataStorageClasses/SecondaryTableAttribute';
import TableAttribute from './DataStorageClasses/TableAttribute';
import Restriction from './DataStorageClasses/Restriction';

const NUMBER_OF_TUPLES_PER_PAGE_TIMEOUT: number = 500;

enum CurrentView {
  TABLE_CONTENT,
  TABLE_INFO
}

type TableViewState = {
  tableAttributesInfo?: TableAttributesInfo,
  currentView: CurrentView,
  tableContentNeedRefresh: boolean,
  tableDefinitionNeedRefresh: boolean,
  numberOfTuplesPerPage: number,
  setNumberOFTuplesPerPageTimeout: ReturnType<typeof setTimeout>
  totalNumOfTuples: number,
  currentPageNumber: number,
  maxPageNumber: number,
  tableContentData: Array<any>,
  tableInfoData: string,
  errorMessage: string,
  isLoading: boolean,
  restrictions: Array<Restriction> // Storage for the last requested restrction to deal with case such as numberOfTuplesPerPage change
}

class TableView extends React.Component<{token: string, selectedSchemaName: string, selectedTableName: string, selectedTableType: TableType}, TableViewState> {
  constructor(props: any) {
    super(props);
    this.state = {
      tableAttributesInfo: undefined,
      currentView: CurrentView.TABLE_CONTENT,
      tableContentNeedRefresh: true,
      tableDefinitionNeedRefresh: true,
      numberOfTuplesPerPage: 25,
      setNumberOFTuplesPerPageTimeout: setTimeout(() => {}, 1000),
      currentPageNumber: 1,
      maxPageNumber: 1,
      tableContentData: [],
      totalNumOfTuples: 0,
      tableInfoData: '',
      errorMessage: '',
      isLoading: false,
      restrictions: []
    }

    this.fetchTableAttributeAndContent = this.fetchTableAttributeAndContent.bind(this);
    this.setPageNumber = this.setPageNumber.bind(this);
    this.setNumberOfTuplesPerPage = this.setNumberOfTuplesPerPage.bind(this);
    this.fetchTableContent = this.fetchTableContent.bind(this);
    this.setRestrictions = this.setRestrictions.bind(this);
  }

  setPageNumber(pageNumber: number) {
    if (pageNumber < 1 || pageNumber > this.state.maxPageNumber) {
      throw Error('Invalid pageNumber ' + pageNumber + ' requested');
    }

    this.setState({currentPageNumber: pageNumber});
  }

  setNumberOfTuplesPerPage(numberOfTuplesPerPage: number) {
    this.setState({numberOfTuplesPerPage: numberOfTuplesPerPage});
  }

  setRestrictions(restrictions: Array<Restriction>) {
    this.setState({restrictions: restrictions});
  }

  switchCurrentView(viewChoice: CurrentView) {
    this.setState({currentView: viewChoice});
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    // Check if table change, if so fetch the new data
    if (prevProps.selectedTableName !== this.props.selectedTableName) {

      // Determine what view the user is on and fetch accordingly
      if (this.state.currentView === CurrentView.TABLE_CONTENT) {
        // User is on TableContent, fetch data related to that view and set tableInfoNeedRefresh to true
        this.fetchTableAttributeAndContent();
        this.setState({tableContentNeedRefresh: false, tableDefinitionNeedRefresh: true});
      }
      else if (this.state.currentView === CurrentView.TABLE_INFO) {
        // User is on TableInfo, fetch data related to that view nad set tableContentNeedRefresh to true
        this.fetchTableDefinition();
        this.setState({tableContentNeedRefresh: true, tableDefinitionNeedRefresh: false});
      }
    }
    else if (this.state.currentView !== prevState.currentView) {
      // The view change thus update accordingly if refresh is needed
      if (this.state.currentView === CurrentView.TABLE_CONTENT && this.state.tableContentNeedRefresh) {
        // Fetch data realted to TableContent
        this.fetchTableAttributeAndContent();
        this.setState({tableContentNeedRefresh: false})
      }
      else if (this.state.currentView === CurrentView.TABLE_INFO && this.state.tableDefinitionNeedRefresh) {
        // Fetch data related to TableInfo
        this.fetchTableDefinition();
        this.setState({tableDefinitionNeedRefresh: false})
      }
    }
    else if (this.state.currentPageNumber !== prevState.currentPageNumber) {
      this.fetchTableContent();
    }
    else if (this.state.numberOfTuplesPerPage !== prevState.numberOfTuplesPerPage) {
      clearTimeout(this.state.setNumberOFTuplesPerPageTimeout);
      const setNumberOFTuplesPerPageTimeout = setTimeout(() => {
        this.fetchTableContent();
        this.setState({currentPageNumber: 1});
      }, NUMBER_OF_TUPLES_PER_PAGE_TIMEOUT)
      this.setState({setNumberOFTuplesPerPageTimeout: setNumberOFTuplesPerPageTimeout});
    }
    else if (this.state.restrictions !== prevState.restrictions) {
      this.fetchTableContent();
    }
  }

  fetchTableDefinition() {
    this.setState({isLoading: true})
    fetch(`${process.env.REACT_APP_DJLABBOOK_BACKEND_PREFIX}/get_table_definition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token },
      body: JSON.stringify({ schemaName: this.props.selectedSchemaName, tableName: this.props.selectedTableName })
    })
    .then(result => {
      if (!result.ok) {
        result.text()
        .then(errorMessage => {
          throw Error(`${result.status} - ${result.statusText}: (${errorMessage})`)
        })
        .catch(error => {
          this.setState({tableInfoData: '', errorMessage: 'Problem fetching table information: ' + error})
        })
      }
      return result.text()})
    .then(result => {
      console.log(result);
      this.setState({tableInfoData: result, errorMessage: '', isLoading: false})
    })
    .catch(error => {
      this.setState({tableInfoData: '', errorMessage: 'Problem fetching table information: ' + error})
    })
  }

  fetchTableAttributeAndContent() {
    this.setState({isLoading: true})
    // retrieve table headers
    fetch(`${process.env.REACT_APP_DJLABBOOK_BACKEND_PREFIX}/get_table_attributes`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token},
      body: JSON.stringify({schemaName: this.props.selectedSchemaName, tableName: this.props.selectedTableName})
    })
    .then(result => {
      if (!result.ok) {
        result.text()
        .then(errorMessage => {
          throw Error(`${result.status} - ${result.statusText}: (${errorMessage})`)
        })
        .catch(error => {
          this.setState({tableAttributesInfo: undefined, errorMessage: 'Problem fetching table attributes: ' + error, isLoading: false})
        })
      }
      return result.json()})
    .then(result => {
      this.setState({tableAttributesInfo: this.parseTableAttributes(result), errorMessage: ''})
    })
    .then(() => {
      // Fetch table content after getting the table attribute info
      this.fetchTableContent();
    })
    .catch(error => {
      this.setState({tableAttributesInfo: undefined, errorMessage: 'Problem fetching table attributes: ' + error, isLoading: false})
    })
  }

  /**
   * Utility function for refeshing the table view of tuples
   * @param restrictions Array of valid restrictions used to query the back end to prevent it sending back everything
   */
  fetchTableContent() {
    // Buffer to store restrictions
    let urlParams: Array<string> = []

    // Add limit to url
    urlParams.push('limit=' + this.state.numberOfTuplesPerPage);

    // Add page param
    urlParams.push('page=' + this.state.currentPageNumber);

    if (this.state.restrictions !== []) {
      let restrictionsInAPIFormat = []

      for (let restriction of this.state.restrictions) {

        if (restriction.tableAttribute?.attributeType === TableAttributeType.DATETIME) {
          restrictionsInAPIFormat.push({
            attributeName: restriction.tableAttribute?.attributeName,
            operation: Restriction.getRestrictionTypeString(restriction.restrictionType),
            value: restriction.value[0] + ' ' + restriction.value[1]
          })
        }
        else {
          restrictionsInAPIFormat.push({
            attributeName: restriction.tableAttribute?.attributeName,
            operation: Restriction.getRestrictionTypeString(restriction.restrictionType),
            value: restriction.value
          })
        }
      }

      // Covert the restrictions to json string then base64 it
      urlParams.push('restriction=' + encodeURIComponent(btoa(JSON.stringify(restrictionsInAPIFormat))));
    }

    // Build the url with params
    let apiUrl = `${process.env.REACT_APP_DJLABBOOK_BACKEND_PREFIX}/fetch_tuples`;
    if (urlParams.length > 0) {
      apiUrl += '?';

      // Add the first param
      apiUrl += urlParams[0];

      for (let i = 1; i < urlParams.length; i++) {
        apiUrl += '&' + urlParams[i];
      }
    }
    
    // Call get fetch_tuple with params
    fetch(apiUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token},
      body: JSON.stringify({schemaName: this.props.selectedSchemaName, tableName: this.props.selectedTableName})
    })
    .then(result => {
      if (!result.ok) {
        result.text()
        .then(errorMessage => {
          throw Error(`${result.status} - ${result.statusText}: (${errorMessage})`)
        })
        .catch(error => {
          this.setState({tableContentData: [], errorMessage: 'Problem fetching table content: ' + error, isLoading: false})
        })
      }
      return result.json();
    })
    .then(result => {
      // Deal with coverting time back to datajoint format
      let tableAttributes: Array<TableAttribute> = this.state.tableAttributesInfo?.primaryAttributes as Array<TableAttribute>;
      tableAttributes = tableAttributes.concat(this.state.tableAttributesInfo?.secondaryAttributes as Array<TableAttribute>);

      // Iterate though each tableAttribute and deal with TEMPORAL types
      for (let i = 0; i < tableAttributes.length; i++) {
        if (tableAttributes[i].attributeType === TableAttributeType.TIME) {
          for (let tuple of result.tuples) {
            tuple[i] = TableAttribute.parseTimeString(tuple[i]);
          }
        }
        else if (tableAttributes[i].attributeType === TableAttributeType.TIMESTAMP || tableAttributes[i].attributeType === TableAttributeType.DATETIME) {
          for (let tuple of result.tuples) {
            tuple[i] = TableAttribute.parseDateTime(tuple[i]);
          }
        }
        else if (tableAttributes[i].attributeType === TableAttributeType.DATE) {
          for (let tuple of result.tuples) {
            tuple[i] = TableAttribute.parseDate(tuple[i]);
          }
        }
      }

      this.setState({tableContentData: result.tuples, totalNumOfTuples: result.total_count, errorMessage: '', maxPageNumber:  Math.ceil(result.total_count / this.state.numberOfTuplesPerPage), isLoading: false})
    })
    .catch(error => {
      this.setState({tableContentData: [], errorMessage: 'Problem fetching table content: ' + error, isLoading: false})
    })
  }
 
  /**
   * Function to convert the api return json to produce a TableAttributeInfo
   * @param jsonResult 
   */
  parseTableAttributes(jsonResult: any): TableAttributesInfo {
    // Create object for the return
    let tableAttributesInfo = new TableAttributesInfo([], []);

    // Deal with primary attributes
    for (let primaryAttributeInfoArray of jsonResult.primary_attributes) {
      let tableAttributeType: TableAttributeType = this.parseTableTypeString(primaryAttributeInfoArray[1]);

      // If the datatype is of type VarChar or Char record the limit or range of it
      if (tableAttributeType === TableAttributeType.VAR_CHAR) {
        tableAttributesInfo.primaryAttributes.push(new PrimaryTableAttribute(
          primaryAttributeInfoArray[0], 
          tableAttributeType, 
          primaryAttributeInfoArray[4],
          parseInt(primaryAttributeInfoArray[1].substring(8, primaryAttributeInfoArray[1].length - 1))
          ));
      }
      else if (tableAttributeType === TableAttributeType.CHAR) {
        tableAttributesInfo.primaryAttributes.push(new PrimaryTableAttribute(
          primaryAttributeInfoArray[0], 
          tableAttributeType, 
          primaryAttributeInfoArray[4],
          parseInt(primaryAttributeInfoArray[1].substring(5, primaryAttributeInfoArray[1].length - 1))
          ));
      }
      else if (tableAttributeType === TableAttributeType.ENUM) {
        tableAttributesInfo.primaryAttributes.push(new PrimaryTableAttribute(
          primaryAttributeInfoArray[0], 
          tableAttributeType, 
          primaryAttributeInfoArray[4],
          undefined,
          primaryAttributeInfoArray[1].substring(5, primaryAttributeInfoArray[1].length - 1).replace(/'/g, '').split(',')
          ));
      }
      else if (tableAttributeType === TableAttributeType.DECIMAL) {
        let decimalAttributes = primaryAttributeInfoArray[1].substring(7).replace(/[{()}]/g, '').split(',');

        tableAttributesInfo.primaryAttributes.push(new PrimaryTableAttribute(
          primaryAttributeInfoArray[0], 
          tableAttributeType, 
          primaryAttributeInfoArray[4],
          undefined,
          undefined,
          parseInt(decimalAttributes[0]),
          parseInt(decimalAttributes[1])
          ));
      }
      else {
        tableAttributesInfo.primaryAttributes.push(new PrimaryTableAttribute(
          primaryAttributeInfoArray[0], 
          tableAttributeType, 
          primaryAttributeInfoArray[4]));
      }
    }

    // Deal with secondary attributes
    for (let secondaryAttributesInfoArray of jsonResult.secondary_attributes) {
      let tableAttributeType: TableAttributeType = this.parseTableTypeString(secondaryAttributesInfoArray[1]);

      // If the datatype is of type VarChar or Char record the limit or range of it
      if (tableAttributeType === TableAttributeType.VAR_CHAR) {
        tableAttributesInfo.secondaryAttributes.push(new SecondaryTableAttribute(
          secondaryAttributesInfoArray[0],
          this.parseTableTypeString(secondaryAttributesInfoArray[1]),
          secondaryAttributesInfoArray[2],
          secondaryAttributesInfoArray[3],
          parseInt(secondaryAttributesInfoArray[1].substring(8, secondaryAttributesInfoArray[1].length - 1))
          ));
      }
      else if (tableAttributeType === TableAttributeType.CHAR) {
        tableAttributesInfo.secondaryAttributes.push(new SecondaryTableAttribute(
          secondaryAttributesInfoArray[0],
          this.parseTableTypeString(secondaryAttributesInfoArray[1]),
          secondaryAttributesInfoArray[2],
          secondaryAttributesInfoArray[3],
          parseInt(secondaryAttributesInfoArray[1].substring(5, secondaryAttributesInfoArray[1].length - 1))
          ));
      }
      else if (tableAttributeType === TableAttributeType.ENUM) {
        // Get each enum option and save it under enumOptions
        tableAttributesInfo.secondaryAttributes.push(new SecondaryTableAttribute(
          secondaryAttributesInfoArray[0],
          this.parseTableTypeString(secondaryAttributesInfoArray[1]),
          secondaryAttributesInfoArray[2],
          secondaryAttributesInfoArray[3],
          undefined,
          secondaryAttributesInfoArray[1].substring(5, secondaryAttributesInfoArray[1].length - 1).replace(/'/g, '').split(',')
          ));
      }
      else if (tableAttributeType === TableAttributeType.DECIMAL) {
        let decimalAttributes = secondaryAttributesInfoArray[1].substring(7).replace(/[{()}]/g, '').split(',');
        // Get each enum option and save it under enumOptions
        tableAttributesInfo.secondaryAttributes.push(new SecondaryTableAttribute(
          secondaryAttributesInfoArray[0],
          this.parseTableTypeString(secondaryAttributesInfoArray[1]),
          secondaryAttributesInfoArray[2],
          secondaryAttributesInfoArray[3],
          undefined,
          undefined,
          parseInt(decimalAttributes[0]),
          parseInt(decimalAttributes[1])
          ));
      }
      else {
        tableAttributesInfo.secondaryAttributes.push(new SecondaryTableAttribute(
          secondaryAttributesInfoArray[0],
          this.parseTableTypeString(secondaryAttributesInfoArray[1]),
          secondaryAttributesInfoArray[2],
          secondaryAttributesInfoArray[3]
          ));
      }
    }
    return tableAttributesInfo;
  }

  /**
   * Function to deal figure out what is the datatype given a string
   * @param tableTypeString The table type in string that was return from the api call
   */
  parseTableTypeString(tableTypeString: string): TableAttributeType {
    if (tableTypeString === 'tinyint') {
      return TableAttributeType.TINY;
    }
    else if (tableTypeString === 'tinyint unsigned') {
      return TableAttributeType.TINY_UNSIGNED;
    }
    else if (tableTypeString === 'smallint') {
      return TableAttributeType.SMALL;
    }
    else if (tableTypeString === 'smallint unsigned') {
      return TableAttributeType.SMALL_UNSIGNED;
    }
    else if (tableTypeString === 'medium') {
      return TableAttributeType.MEDIUM;
    }
    else if (tableTypeString === 'medium unsigned') {
      return TableAttributeType.MEDIUM_UNSIGNED;
    }
    else if (tableTypeString === 'big') {
      return TableAttributeType.BIG_UNSIGNED;
    }
    else if (tableTypeString === 'big unsigned') {
      return TableAttributeType.BIG_UNSIGNED;
    }
    else if (tableTypeString === 'int') {
      return TableAttributeType.INT;
    }
    else if (tableTypeString === 'int unsigned') {
      return TableAttributeType.INT_UNSIGNED;
    }
    else if (tableTypeString.substr(0, 7) === 'decimal') {
      return TableAttributeType.DECIMAL;
    }
    else if (tableTypeString === 'decimal unsigned') { 
      // Depricated in SQL 8.0
      return TableAttributeType.DECIMAL_UNSIGNED;
    }
    else if (tableTypeString === 'float') {
      return  TableAttributeType.FLOAT;
    }
    else if (tableTypeString === 'float unsigned') {
      return TableAttributeType.FLOAT_UNSIGNED;
    }
    else if (tableTypeString === 'double') {
      return TableAttributeType.DOUBLE;
    }
    else if (tableTypeString === 'bool') {
      return TableAttributeType.BOOL;
    }
    else if (tableTypeString.substring(0, 4) ==='char') {
      return TableAttributeType.CHAR;
    }
    else if (tableTypeString.substring(0, 7) ==='varchar') {
      return TableAttributeType.VAR_CHAR;
    }
    else if (tableTypeString === 'uuid') {
      return TableAttributeType.UUID;
    }
    else if (tableTypeString === 'date') {
      return TableAttributeType.DATE;
    }
    else if (tableTypeString === 'datetime') {
      return TableAttributeType.DATETIME;
    }
    else if (tableTypeString === 'time') {
      return TableAttributeType.TIME;
    }
    else if (tableTypeString === 'timestamp') {
      return TableAttributeType.TIMESTAMP;
    }
    else if (tableTypeString.substring(0, 4) === 'enum') {
      return TableAttributeType.ENUM;
    }
    else if (tableTypeString === 'blob' || tableTypeString === 'longblob') {
      return TableAttributeType.BLOB;
    }
    
    throw Error('Unsupported TableAttributeType: ' + tableTypeString);
  }

  getCurrentView() {
    if (!this.state.isLoading) {
      if (this.props.selectedTableName === '') {
        return <div className="errorMessage">Select a Table to see contents</div>
      } 
      else if (this.state.errorMessage) {
        return <div className="errorMessage">{this.state.errorMessage}</div>
      }
      else {
        if (this.state.currentView === CurrentView.TABLE_CONTENT) {
          return (
            <TableContent 
                token = {this.props.token} 
                selectedSchemaName = {this.props.selectedSchemaName} 
                selectedTableName = {this.props.selectedTableName} 
                selectedTableType = {this.props.selectedTableType}
                contentData = {this.state.tableContentData} 
                currentPageNumber = {this.state.currentPageNumber}
                maxPageNumber = {this.state.maxPageNumber}
                totalNumOfTuples = {this.state.totalNumOfTuples}
                tuplePerPage = {this.state.numberOfTuplesPerPage}
                tableAttributesInfo = {this.state.tableAttributesInfo}
                setPageNumber = {this.setPageNumber}
                setNumberOfTuplesPerPage = {this.setNumberOfTuplesPerPage}
                fetchTableContent = {this.fetchTableContent}
                setRestrictions = {this.setRestrictions}
            />
          )
        }
        else if (this.state.currentView === CurrentView.TABLE_INFO) {
          return <TableInfo infoDefData = {this.state.tableInfoData}/>
        }

        // Error out cause the view selected is not valid
        throw Error('Invalid View Selected');
      }
    } else {
      return (
        <div className="loadingArea">
          <div className="loadingMessage">Loading...</div>
        </div>
      )
    }
  }

  render() {
    return (
      <div className="table-view">
        <div className="nav-tabs">
          <button className={this.state.currentView === CurrentView.TABLE_CONTENT ? "tab inView" : "tab"} onClick={() => this.switchCurrentView(CurrentView.TABLE_CONTENT)} disabled={this.props.selectedTableName === ''}>View Content</button>
          <button className={this.state.currentView === CurrentView.TABLE_INFO ? "tab inView" : "tab"} onClick={() => this.switchCurrentView(CurrentView.TABLE_INFO)} disabled={this.props.selectedTableName === ''}>Table Information</button>
        </div>

        <div className="view-area"> {this.getCurrentView()}
        </div>
      </div>
    )
  }
}

export default TableView;