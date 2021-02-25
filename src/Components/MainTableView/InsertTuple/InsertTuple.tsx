import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faRedoAlt, faTrashAlt, faPlusCircle, faExclamationCircle} from '@fortawesome/free-solid-svg-icons'
import TableAttribute from '../DataStorageClasses/TableAttribute';
import TableAttributesInfo from '../DataStorageClasses/TableAttributesInfo';
import PrimaryTableAttribute from '../DataStorageClasses/PrimaryTableAttribute';
import TableAttributeType from '../enums/TableAttributeType';
import './InsertTuple.css'
import SecondaryTableAttribute from '../DataStorageClasses/SecondaryTableAttribute';

type insertTupleState = {
  tupleBuffer: any // Object to stored the values typed in by the user
  errorMessage: string // Error message string for failed inserts
}

/**
 * Class component to insertion of tuples
 * 
 * @param token JWT token for authentaction
 * @param selectedSchemaName Name of selected schema
 * @param selectedTableName Name of selected table
 * @param tableAttributesInfo A TableAttributeInfo object that contains everything about both primary and secondary attributes of the table
 * @param fetchTableContent Callback function to tell the parent component to update the contentData
 * @param tuplesToInsert List of selected tuples to be copied over for quick insert field fill-in. For now, starting with just 1.
 */
class InsertTuple extends React.Component<{token: string, selectedSchemaName:string, selectedTableName: string, tableAttributesInfo?: TableAttributesInfo, fetchTableContent: any, tuplesToInsert?: any,}, insertTupleState> {
  constructor(props: any) {
    super(props);
    this.state = {
      tupleBuffer: {},
      errorMessage: ''
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
  }

  /**
   * Helper function to handle attribute changes by updating tupleBuffer accordingly
   * @param attributeName Attribute name of the change, this is used to access the tupleBuffer object members to set the value
   * @param event Event object that come from the onChange function
   */
  handleChange(event: any, attributeName: string) {
    // Create a copy, update the object, then set state
    let tupleBuffer = Object.assign({}, this.state.tupleBuffer);
    tupleBuffer[attributeName] = event.target.value;
    this.setState({tupleBuffer: tupleBuffer});
  }

  /**
   * Helper function to handle copy over of the selected tuple into the insert fields by updating the tupleBuffer state.
   * TODO: Does not work for date, time, datetime fill at the moment, figure out conversion.
   * @param tupleToInsert user selected tuple (single entry for now) to be copied over
   */
  copyTuple(event: any, tupleToInsert: any) {
    event.preventDefault();
    let tupleBuffer = Object.assign({}, this.state.tupleBuffer);
    Object.values(tupleToInsert).forEach((columns: any) => {
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
   * On submit handle function which checks that all attributes of the tupleBuffer object are filled out correctly
   * based upon the info provided by this.props.tableAttributeInfo such as nullable? autoIncrement?, etc.
   * @param event Event object from the standard OnSubmit function
   */
  onSubmit(event: any) {
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
    fetch(`${process.env.REACT_APP_DJLABBOOK_BACKEND_PREFIX}/insert_tuple`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token},
      body: JSON.stringify({schemaName: this.props.selectedSchemaName, tableName: this.props.selectedTableName, tuple: tupleBuffer})
    })
    .then(result => {
      // Check for error mesage 500, if so throw and error
      if (result.status === 500) {
        result.text().then(errorMessage => {throw new Error(errorMessage)});
      }
      return result.text();
    })
    .then(result => {
      // Insert was sucessful, tell TableView to fetch the content again
      this.props.fetchTableContent();
    })
    .catch((error) => {
      this.setState({errorMessage: error});
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

  render() {
    return (
      <div>
        <h1>Insert</h1>
        <form onSubmit={this.onSubmit}>
          <div className="inputRow">
            { 
              // only show copy over/delete row icons when ready for multiple insert
              this.props.tuplesToInsert.length > 1 ?
              (<div className="rowControls">
                <FontAwesomeIcon className="deleteRow icon" icon={faTrashAlt} />
                <FontAwesomeIcon className="addRow icon" icon={faPlusCircle} />
              </div>) : ''
            }
            {
              // Deal with primary attirbutes
              this.props.tableAttributesInfo?.primaryAttributes.map((primaryTableAttribute) => {
                return(
                  <div className='fieldUnit' key={primaryTableAttribute.attributeName}>
                    {PrimaryTableAttribute.getAttributeLabelBlock(primaryTableAttribute)}
                    {PrimaryTableAttribute.getAttributeInputBlock(primaryTableAttribute, this.state.tupleBuffer[primaryTableAttribute.attributeName], this.handleChange)}
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
          {
            Object.entries(this.props.tuplesToInsert).length ?
            <div className="copyOverPrompt">
              <FontAwesomeIcon className="icon" icon={faExclamationCircle}/>
              <span>Table entry selection detected. Copy over for a quick prefill?</span>
              <button onClick={(event) => this.copyTuple(event, this.props.tuplesToInsert)}>Copy Over</button>
            </div> :
            ''
          } 
          <input className="submitButton" type='submit' value='Submit'></input>
        </form>
        <div>{this.state.errorMessage}</div>
      </div>
    )
  }
}

export default InsertTuple;