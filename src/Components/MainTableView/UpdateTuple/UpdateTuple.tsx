import React from 'react';
import TableAttribute from '../DataStorageClasses/TableAttribute';
import TableAttributesInfo from '../DataStorageClasses/TableAttributesInfo';
import PrimaryTableAttribute from '../DataStorageClasses/PrimaryTableAttribute';
import TableAttributeType from '../enums/TableAttributeType';
import SecondaryTableAttribute from '../DataStorageClasses/SecondaryTableAttribute';

import './UpdateTuple.css'

interface UpdateTupleProps {
  token: string;
  selectedSchemaName:string;
  selectedTableName: string;
  tableAttributesInfo?: TableAttributesInfo;
  selectedTableEntry: any; // Tuple that that is checked
  fetchTableContent: () => void;
  clearTupleSelection: () => void;
  updateInAction: (isWaiting: boolean) => void; // Callback for loading animation status
}

interface UpdateTupleState {
  tupleBuffer: any; // Tuple buffer to stored the values typed in by the user. Type any used here as there are many possible types with all the available input blocks
  errorMessage: string; // Error message string for failed inserts
  updateAccessible: boolean; // disables submit button if any of the dependencies are inaccessible
}

/**
 * Component for Update tuples in a given table
 */
export default class UpdateTuple extends React.Component<UpdateTupleProps, UpdateTupleState> {
  constructor(props: UpdateTupleProps) {
    super(props);
    this.state = {
      tupleBuffer: {},
      errorMessage: '',
      updateAccessible: false
    }

    this.onSubmit = this.onSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.resetToNull = this.resetToNull.bind(this);
  }

  /**
   * Handle cases with enums on load by setting the default value to the first enum option and when there is a selectedTableEntry
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

    // Check if there is a selectedTableEntry, if so update tuple buffer with it
    if (this.props.selectedTableEntry !== undefined) {
      this.setState({tupleBuffer: this.props.selectedTableEntry});
    }
  }

  /**
   * Checks for any updated table selection, if yes, copies over the selected table entry into the update field
   * @param prevProps 
   * @param prevState 
   */
  componentDidUpdate(prevProps: UpdateTupleProps, prevState: UpdateTupleState) {
    // break if there has been no change to the tuple selection 
    if (this.props.selectedTableEntry === prevProps.selectedTableEntry || this.props.selectedTableEntry === undefined) {
      return;
    } 
    else {
      this.setState({tupleBuffer: this.props.selectedTableEntry});
    }
  }

  /**
   * Helper function to handle attribute changes by updating tupleBuffer accordingly
   * @param attributeName Attribute name of the change, this is used to access the tupleBuffer object members to set the value
   * @param event Event object that come from the onChange function
   */
  handleChange(event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>, attributeName: string) {
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
  onSubmit(event: React.FormEvent<HTMLFormElement>) {
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
        // Construct the insert string 
        tupleBuffer[tableAttribute.attributeName] = tupleBuffer[tableAttribute.attributeName + '__date'] + ' ' + tupleBuffer[tableAttribute.attributeName + '__time'];

        // Delete extra fields from tuple
        delete tupleBuffer[tableAttribute.attributeName + '__date'];
        delete tupleBuffer[tableAttribute.attributeName + '__time'];
      }
    }
    
    // Check primary attributes first that everything is filled out correctly in tupleBuffer
    for (let primaryAttribute of this.props.tableAttributesInfo.primaryAttributes) {
      // Check if attribute exist, if not then complain
      if (!tupleBuffer.hasOwnProperty(primaryAttribute.attributeName) && primaryAttribute.autoIncrement === false) {
        this.setState({errorMessage: 'Missing require field: ' + primaryAttribute.attributeName});
        return;
      }
    }

    // Check for secondary attributes are filled out correctly
    for (let secondaryAttribute of this.props.tableAttributesInfo.secondaryAttributes) {
      if (!tupleBuffer.hasOwnProperty(secondaryAttribute.attributeName)) {
        if (secondaryAttribute.nullable === true) {
          // Nullable is allow
          delete tupleBuffer[secondaryAttribute.attributeName];
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
      else if (tupleBuffer[secondaryAttribute.attributeName] === '=NULL=') {
        delete tupleBuffer[secondaryAttribute.attributeName];
      }
    }

    // start update in action wait animation and stop when api responds
    this.props.updateInAction(true);

    // All checks passed thus attempt insert
    fetch(`${process.env.REACT_APP_DJLABBOOK_BACKEND_PREFIX}/update_tuple`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token},
      body: JSON.stringify({schemaName: this.props.selectedSchemaName, tableName: this.props.selectedTableName, tuple: tupleBuffer})
    })
    .then(result => {
      this.props.updateInAction(false);
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
      this.props.clearTupleSelection();
      this.setState({tupleBuffer: {}})

      // Update was sucessful, tell TableView to fetch the content again
      this.props.fetchTableContent();
    })
    .catch((error) => {
      this.props.updateInAction(false);
      this.setState({errorMessage: error.message});
    })
  }

  /**
   * Function dealing with when user clicks on the reset icon for nullable input field. 
   * TODO: Align behavior with the edge case specs - whether to null, or fill with default
   * @param tableAttribute Table attribute object so the function can extract the attributeName 
   */
  resetToNull(tableAttribute: SecondaryTableAttribute) {
    if (Object.entries(this.state.tupleBuffer).length) {
      let tupleBuffer = Object.assign({}, this.state.tupleBuffer);

      if (tableAttribute.defaultValue !== undefined) {
        if (tableAttribute.attributeType === TableAttributeType.DATE) {
          tupleBuffer[tableAttribute.attributeName] = TableAttribute.covertRawDateToInputFieldFormat(tableAttribute.defaultValue);
        }
        else if (tableAttribute.attributeType === TableAttributeType.DATETIME) {
          // Deal with date time string
          const splitResult = tableAttribute.defaultValue.replaceAll('"', '').split(' ');
          tupleBuffer[tableAttribute.attributeName + '__date'] = splitResult[0];
          tupleBuffer[tableAttribute.attributeName + '__time'] = splitResult[1];
        }
        else {
          tupleBuffer[tableAttribute.attributeName] = tableAttribute.defaultValue;
        } 
      }
      else if (tableAttribute.nullable === true) {
        tupleBuffer[tableAttribute.attributeName] = undefined;
      }
       // set to defaulValue for now
      this.setState({tupleBuffer: tupleBuffer});
    }
  }

  render() {
    return (
      <div className="updateActionContainer">
        {
            this.props.selectedTableEntry === undefined ?
              <p>Select a table entry from below to update</p>
            :
            <form onSubmit={this.onSubmit}>
            <p className="confirmationText">Update this entry?</p>
            <div className="inputRow">         
              {
                // Deal with primary attirbutes
                this.props.tableAttributesInfo?.primaryAttributes.map((primaryTableAttribute) => {
                  return(
                    <div className='fieldUnit primary' key={primaryTableAttribute.attributeName}>
                      {PrimaryTableAttribute.getAttributeLabelBlock(primaryTableAttribute)}
                      {PrimaryTableAttribute.getPrimaryAttributeInputBlock(primaryTableAttribute, this.state.tupleBuffer[primaryTableAttribute.attributeName], this.handleChange)}
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
                      {SecondaryTableAttribute.getSecondaryAttributeInputBlock(
                      secondaryAttribute,
                      secondaryAttribute.attributeType === TableAttributeType.DATETIME || secondaryAttribute.attributeType === TableAttributeType.TIMESTAMP? 
                      this.state.tupleBuffer[secondaryAttribute.attributeName + '__date'] + ' ' + this.state.tupleBuffer[secondaryAttribute.attributeName + '__time'] :
                        this.state.tupleBuffer[secondaryAttribute.attributeName], 
                      this.handleChange)}
                    </div>
                  )
                })
              }
            </div>
              <div>
                <p>Are you sure you want to submit form to update this entry?</p>
                <div className="actionButtons">
                  <input className="confirmActionButton update" type="submit" value="Update"/>
                  <button className="cancelActionButton update" onClick={() => {this.props.clearTupleSelection();}}>Cancel</button>
                </div>
              </div>
          </form>
        } 
        {this.state.errorMessage ? (
          <div className="errorMessage">{this.state.errorMessage}<button className="dismiss" onClick={() => this.setState({errorMessage: ''})}>dismiss</button></div>
        ) : ''}
      </div>
    )
  }
}