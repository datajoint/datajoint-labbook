import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faRedoAlt} from '@fortawesome/free-solid-svg-icons'
import TableAttribute from './DataStorageClasses/TableAttribute';
import TableAttributesInfo from './DataStorageClasses/TableAttributesInfo';
import PrimaryTableAttribute from './DataStorageClasses/PrimaryTableAttribute';
import TableAttributeType from './enums/TableAttributeType';
import './UpdateTuple.css'
import SecondaryTableAttribute from './DataStorageClasses/SecondaryTableAttribute';

import CheckDependency from './CheckDependency';

type updateTupleState = {
  tupleBuffer: any, // Object to stored the values typed in by the user
  errorMessage: string, // Error message string for failed inserts
  dependencies: Array<any>, // list of dependencies pushed from checkDependency Component
  updateAccessible: boolean // disables submit button if any of the dependencies are inaccessible
}

class UpdateTuple extends React.Component<{token: string, selectedSchemaName:string, selectedTableName: string, tableAttributesInfo?: TableAttributesInfo, fetchTableContent: any, tupleToUpdate?: any, clearEntrySelection: any}, updateTupleState> {
  constructor(props: any) {
    super(props);
    this.state = {
      tupleBuffer: {},
      errorMessage: '',
      dependencies: [],
      updateAccessible: false
    }

    this.onSubmit = this.onSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

   /**
   * Handle cases with enums on load by setting the deafult value to the first enum option
   */
  componentDidMount() {
    // Figure out if any of the attribute is enum type, if so set the state ahead of time
    let tableAttributes: Array<TableAttribute> = this.props.tableAttributesInfo?.primaryAttributes as Array<TableAttribute>;
    tableAttributes = tableAttributes.concat(this.props.tableAttributesInfo?.secondaryAttributes as Array<TableAttribute>);
    for (let tableAttribute of tableAttributes) {
      if (tableAttribute.attributeType === TableAttributeType.ENUM) {
        if (tableAttribute.enumOptions === undefined) {
          throw Error('tableAttribute.enumOptions is undefined');
        }

        // Set enum to first value
        let tupleBuffer = Object.assign({}, this.state.tupleBuffer);
        tupleBuffer[tableAttribute.attributeName] = tableAttribute.enumOptions[0];
        this.setState({tupleBuffer})
      }
    }

    let tupleBuffer = Object.assign({}, this.state.tupleBuffer);
      Object.values(this.props.tupleToUpdate).forEach((columns: any) => {
        Object.entries(columns.primaryEntries).forEach((attributeKeyVal: any) => {
          tupleBuffer[attributeKeyVal[0]] = attributeKeyVal[1]
        })
        Object.entries(columns.secondaryEntries).forEach((attributeKeyVal: any) => {
          tupleBuffer[attributeKeyVal[0]] = attributeKeyVal[1]
        })
      })
      this.setState({tupleBuffer: tupleBuffer});
  }

  /**
   * Checks for any updated table selection, if yes, copies over the selected table entry into the update field
   * @param prevProps 
   * @param prevState 
   */
  componentDidUpdate(prevProps: any, prevState: any) {
    // break if there has been no change to the tuple selection 
    if (this.props.tupleToUpdate === prevProps.tupleToUpdate) {
      return;
    } else {
      let tupleBuffer = Object.assign({}, this.state.tupleBuffer);
      Object.values(this.props.tupleToUpdate).forEach((columns: any) => {
        Object.entries(columns.primaryEntries).forEach((attributeKeyVal: any) => {
          tupleBuffer[attributeKeyVal[0]] = attributeKeyVal[1]
        })
        Object.entries(columns.secondaryEntries).forEach((attributeKeyVal: any) => {
          tupleBuffer[attributeKeyVal[0]] = attributeKeyVal[1]
        })
      })
      this.setState({tupleBuffer: tupleBuffer});
    }
  }

  /**
   * Helper function to handle attribute changes by updating tupleBuffer accordingly
   * @param attributeName Attribute name of the change, this is used to access the tupleBuffer object members to set the value
   * @param event Event object that come from the onChange function
   */
  handleChange(attributeName: string, event: any) {
    // Create a copy, update the object, then set state
    let tupleBuffer = Object.assign({}, this.state.tupleBuffer);
    tupleBuffer[attributeName] = event.target.value;
    this.setState({tupleBuffer: tupleBuffer});
  }

  /**
   * On submit handle function which checks that all attributes of the tupleBuffer object are filled out correctly
   * based upon the info provided by this.props.tableAttributeInfo such as nullable? autoIncrement?, etc.
   * @param event Event object from the standard OnSubmit function
   */
  onSubmit(event?: any) {
    event.preventDefault();
    // Check that tableAttirbutesInfo is not undefined
    if (this.props.tableAttributesInfo === undefined) {
      return;
    }

    // Copy the current state of tupleBuffer for processing for submission
    let tupleBuffer = Object.assign({}, this.state.tupleBuffer);

    // Loop through and deal with date, datetime, and timestamp formats
    let tableAttributes: Array<TableAttribute> = this.props.tableAttributesInfo?.primaryAttributes as Array<TableAttribute>;
    tableAttributes = tableAttributes.concat(this.props.tableAttributesInfo?.secondaryAttributes as Array<TableAttribute>);
    for (let tableAttribute of tableAttributes) {
      if (tableAttribute.attributeType === TableAttributeType.DATETIME || tableAttribute.attributeType === TableAttributeType.TIMESTAMP) {
        // Check if attribute exists, if not break
        if (!tupleBuffer.hasOwnProperty(tableAttribute.attributeName + '__date') && !tupleBuffer.hasOwnProperty(tableAttribute.attributeName + 'time')) {
          break;
        }

        // Covert date time to UTC
        let date = new Date(tupleBuffer[tableAttribute.attributeName + '__date'] + 'T' + tupleBuffer[tableAttribute.attributeName + '__time']);

        // Delete extra fields from tuple
        delete tupleBuffer[tableAttribute.attributeName + '__date'];
        delete tupleBuffer[tableAttribute.attributeName + '__time'];

        // Construct the insert string 
        tupleBuffer[tableAttribute.attributeName] = date.getUTCFullYear() + ':' + date.getUTCMonth() + ':' + date.getUTCDay() + ' ' + date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCMinutes();
      }
    }
    
    // Check primary attributes first that everything is filled out correctly in tupleBuffer
    for (let primaryAttribute of this.props.tableAttributesInfo.primaryAttributes) {
      // Check if attribute exist, if not then complain
      if (!tupleBuffer.hasOwnProperty(primaryAttribute.attributeName) && primaryAttribute.autoIncrement === false) {
        this.setState({errorMessage: 'Missing required field: ' + primaryAttribute.attributeName});
        return;
      }
    }

    // Check for secondary attributes are filled out correctly
    for (let secondaryAttribute of this.props.tableAttributesInfo.secondaryAttributes) {
      if (!tupleBuffer.hasOwnProperty(secondaryAttribute.attributeName)) {
        if (secondaryAttribute.nullable === true) {
          // Nullable is allow
          tupleBuffer[secondaryAttribute.attributeName] = 'null';
        }
        else if (secondaryAttribute.defaultValue !== null) {
          // Nullable is not allowed, but there is a default value
          tupleBuffer[secondaryAttribute.attributeName] = secondaryAttribute.defaultValue;
        }
        else {
          // Missing attribute, set error and return
          this.setState({errorMessage: 'Missing require field: ' + secondaryAttribute.attributeName});
          return;
        }
      }
    }

    // All checks passed thus attempt insert
    fetch(`${process.env.REACT_APP_DJLABBOOK_BACKEND_PREFIX}/update_tuple`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token},
      body: JSON.stringify({schemaName: this.props.selectedSchemaName, tableName: this.props.selectedTableName, tuple: tupleBuffer})
    })
    .then(result => {
      // Check for error mesage 500, if so throw and error
      if (result.status === 500) {
        result.text()
        .then(errorMessage => {throw new Error(errorMessage)})
        .catch(error => {
          this.setState({errorMessage: error.message});
        });
      }
      return result.text();
    })
    .then(result => {
      // clear selection and buffer upon successful delete
      this.props.clearEntrySelection();
      this.setState({tupleBuffer: {}})

      // Update was sucessful, tell TableView to fetch the content again
      this.props.fetchTableContent();
    })
    .catch((error) => {
      this.setState({errorMessage: error.message});
    })
  }

  /**
   * Function dealing with when user clicks on the reset icon for nullable input field. 
   * TODO: Align behavior with the edge case specs - whether to null, or fill with default
   * @param tableAttribute Table attribute object so the function can extract the attributeName 
   */
  resetToNull(tableAttribute: any) {
    if (Object.entries(this.state.tupleBuffer).length) {
      let updatedBuffer = Object.assign({}, this.state.tupleBuffer);
      updatedBuffer[tableAttribute.attributeName] = tableAttribute.defaulValue; // set to defaulValue for now
      this.setState({tupleBuffer: updatedBuffer});
    }
  }

  handleDependencies(list: Array<any>) {
    this.setState({dependencies: list})
  }

  render() {
    return (
      <div className="updateActionContainer">
        {
            Object.entries(this.props.tupleToUpdate).length === 0 ?
              <p>Select a table entry from below to update</p>
            :
            <form onSubmit={this.onSubmit}>
            <p className="confirmationText">Update this entry?</p>
            <div className="inputRow">         
              {
                // Deal with primary attirbutes
                this.props.tableAttributesInfo?.primaryAttributes.map((primaryTableAttribute) => {
                  return(
                    <div className='fieldUnit' key={primaryTableAttribute.attributeName}>
                      {PrimaryTableAttribute.getAttributeLabelBlock(primaryTableAttribute)}
                      {PrimaryTableAttribute.getAttributeInputBlock(primaryTableAttribute, this.state.tupleBuffer[primaryTableAttribute.attributeName], undefined, this.handleChange)}
                    </div>
                  )
                })
              }
              {
                // Deal with secondary attributes 
                this.props.tableAttributesInfo?.secondaryAttributes.map((secondaryAttribute) => {
                  return(
                    <div className='fieldUnit' key={secondaryAttribute.attributeName}>
                      {SecondaryTableAttribute.getAttributeLabelBlock(secondaryAttribute, this.resetToNull)}
                      {SecondaryTableAttribute.getAttributeInputBlock(secondaryAttribute, this.state.tupleBuffer[secondaryAttribute.attributeName], undefined, this.handleChange)}
                    </div>
                  )
                })
              }
            </div>
            <CheckDependency token={this.props.token} 
                             selectedSchemaName={this.props.selectedSchemaName}
                             selectedTableName={this.props.selectedTableName}
                             tableAttributesInfo={this.props.tableAttributesInfo}
                             tupleToCheckDependency={Object.values(this.props.tupleToUpdate)}
                             clearList={!Object.entries(this.state.dependencies).length}
                             dependenciesReady={(depList: Array<any>) => this.handleDependencies(depList)} 
                             allAccessible={(bool: boolean) => this.setState({updateAccessible: bool})} />
            {Object.entries(this.state.dependencies).length ? (
              <div>
                <p>Are you sure you want to submit form to update this entry?</p>
                <div className="actionButtons">
                  <input className="submitButton" type="submit" value="Submit" disabled={!this.state.updateAccessible}/>
                  <button className="cancelAction" onClick={() => {this.setState({dependencies: []}); this.props.clearEntrySelection();}}>Cancel</button>
                </div>
              </div>
            ): ''}
          </form>
        } 
        {this.state.errorMessage ? (
          <div className="errorMessage">{this.state.errorMessage}<button className="dismiss" onClick={() => this.setState({errorMessage: ''})}>dismiss</button></div>
        ) : ''}
      </div>
    )
  }
}

export default UpdateTuple;