import React from 'react';
import "./DeleteTuple.css";
import TableAttribute from '../DataStorageClasses/TableAttribute';
import TableAttributesInfo from '../DataStorageClasses/TableAttributesInfo';
import TableAttributeType from '../enums/TableAttributeType';

import CheckDependency from '../CheckDependency';
import PrimaryTableAttribute from '../DataStorageClasses/PrimaryTableAttribute';
import SecondaryTableAttribute from '../DataStorageClasses/SecondaryTableAttribute';

/**
 * list of allowed states on this delete tuple component
 */
type deleteTupleState = {
  dependencies: Array<any>, // list of dependencies fetched from API
  deleteStatusMessage: string, // for GUI to show
  isGettingDependencies: boolean, // for loading animation status
  isDeletingEntry: boolean // for loading animation status
  deleteAccessible: boolean // valdiation result of accessibility from check dependency component
}

class DeleteTuple extends React.Component<{
    token: string, 
    selectedSchemaName: string, 
    selectedTableName: string, 
    tableAttributesInfo?: TableAttributesInfo, 
    fetchTableContent: any, 
    clearEntrySelection: any,
    selectedTableEntry?: any
  },
  deleteTupleState> {
  constructor(props: any) {
    super(props);
    this.state = {
      dependencies: [],
      deleteStatusMessage: '',
      isGettingDependencies: false,
      isDeletingEntry: false,
      deleteAccessible: false,
    }

    this.getTableView = this.getTableView.bind(this);
    this.handleTupleDeletion = this.handleTupleDeletion.bind(this);
  }

  /**
   * Check if new table selection has been made
   * @param prevProps 
   * @param prevState 
   */
  componentDidUpdate(prevProps: any, prevState: any) {
    if (this.props.selectedTableEntry === prevProps.selectedTableEntry) {
      return;
    }
    else if (this.props.selectedTableEntry === undefined) {
      this.setState({deleteStatusMessage: ''})
    }    
  }

  /**
   * Function to delete the selected table entry after user is presented with potential dependencies and confirms
   */
  handleTupleDeletion() {
    // Construct the tupleToDelete object which is basically only the primary keys
    if (this.props.tableAttributesInfo === undefined) {
      return;
    }

    if (this.props.selectedTableEntry === undefined) {
      return;
    }
    
    // Build the tuple to delete which is basically this.props.selectedTableEntry but only the primary keys
    let tupleToDelete: any = {};

    // Loop through and deal with date, datetime, and timestamp formats
    for (let primaryTableAttribute of this.props.tableAttributesInfo.primaryAttributes) {
      if (primaryTableAttribute.attributeType === TableAttributeType.DATE) {
        // Convert date to DJ date format
        tupleToDelete[primaryTableAttribute.attributeName] = TableAttribute.parseDateToDJFormat(tupleToDelete[primaryTableAttribute.attributeName])
      }
      else if (primaryTableAttribute.attributeType === TableAttributeType.DATETIME || primaryTableAttribute.attributeType === TableAttributeType.TIMESTAMP) {
        // Convert to DJ friendly datetime format
        tupleToDelete[primaryTableAttribute.attributeName] = TableAttribute.parseDateTimeToDJFormat(tupleToDelete[primaryTableAttribute.attributeName])
      }
      else {
        tupleToDelete[primaryTableAttribute.attributeName] = this.props.selectedTableEntry[primaryTableAttribute.attributeName]
      }
    }

    // set status true for deleting entry, switch to false once api responds
    this.setState({isDeletingEntry: true})

    // TODO: Run api fetch for list of dependencies/permission
    fetch(`${process.env.REACT_APP_DJLABBOOK_BACKEND_PREFIX}/delete_tuple`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token},
      body: JSON.stringify({schemaName: this.props.selectedSchemaName, tableName: this.props.selectedTableName, restrictionTuple: tupleToDelete})
    })
      .then(result => {
        // set deleting status to done
        this.setState({isDeletingEntry: false, dependencies: []})

        // Check for error mesage 500, if so throw error - shouldn't happen as often once real dependency check is in place
        if (result.status === 500) {
          throw Error(`${result.status} - ${result.statusText}`)
        }
        
        // return result - expecting a Delete Succesful string
        return result.text()
      })
      .then(result => {
        this.setState({deleteStatusMessage: result});

        // clear staged entry upon successful delete
        this.props.clearEntrySelection();

        // update table content reflecting the successful delete
        this.props.fetchTableContent();

      })
      .catch(error => {
        this.setState({deleteStatusMessage: error.message});
      })
  }

  /** store the returned list of dependencies
   *  @param list // list of dependencies that CheckDependency component returns
   */
  handleDependencies(list: Array<any>) {
    this.setState({dependencies: list})
  }

  getTableView() {
    // Get the selected table entry
    var tuple = Object.assign({}, this.props.selectedTableEntry);
    // Remove __date and __time if exists
    for (let tupleKey of Object.keys(tuple)) {
      if (tupleKey.substring(tupleKey.length - 6) === '__date' || tupleKey.substring(tupleKey.length - 6) === '__time') {
        delete tuple[tupleKey];
      }
    }

    // Generate the table view
    return(
      <table className="tupleToDelete">
        <thead>
          {this.props.tableAttributesInfo?.primaryAttributes.map((primaryAttribute: PrimaryTableAttribute) => {
              return <th key={primaryAttribute.attributeName} className="primaryKey">{primaryAttribute.attributeName}</th>
            }
          )}
          {this.props.tableAttributesInfo?.secondaryAttributes.map((secondaryAttribute: SecondaryTableAttribute) => {
              return <th key={secondaryAttribute.attributeName} className="secondaryKey">{secondaryAttribute.attributeName}</th>
            }
          )}
        </thead>
        <tbody>
          {Object.keys(tuple).map((key: any, index: number) => {
              return <td key={key} className="dataEntry">{tuple[key]}</td>
            }
          )}
        </tbody>
      </table>
    )
  }

  render() {
    return(
      <div className="deleteWorkZone">
      {this.props.selectedTableEntry ?
        <div>  
          <p>Are you sure you want to delete this entry?</p>
          <div className="tupleToDeleteCheck">
            {this.getTableView()}
          </div>
          <div className="actionButtons">
            <button className="confirmActionButton delete" onClick={() => this.handleTupleDeletion()} >Confirm Delete</button>
            <button className="cancelActionButton" onClick={() => {this.setState({dependencies: []}); this.props.clearEntrySelection();}}>Cancel</button>
          </div>
          <div className="deleting">
          {this.state.isDeletingEntry ? <p>Deleting entry might take a while...</p>: '' } {/* TODO: replace with proper animation */}
          {this.state.deleteStatusMessage ? (
            <div className="errorMessage">{this.state.deleteStatusMessage}<button className="dismiss" onClick={() => this.setState({deleteStatusMessage: ''})}>dismiss</button></div>
          ) : ''}
          </div>
        </div> 
        : <p>Select a table entry from below to delete</p>}
      </div>
    )
  }
}

export default DeleteTuple;