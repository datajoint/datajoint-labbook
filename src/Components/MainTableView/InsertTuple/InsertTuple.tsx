import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons'
import TableAttribute from '../DataStorageClasses/TableAttribute';
import TableAttributesInfo from '../DataStorageClasses/TableAttributesInfo';
import PrimaryTableAttribute from '../DataStorageClasses/PrimaryTableAttribute';
import TableAttributeType from '../enums/TableAttributeType';
import './InsertTuple.css'
import SecondaryTableAttribute from '../DataStorageClasses/SecondaryTableAttribute';

interface InsertTupleProps {
  token: string;
  selectedSchemaName:string;
  selectedTableName: string;
  tableAttributesInfo?: TableAttributesInfo;
  selectedTableEntry?: any; // Tuple that that is checked. Type any used here as there are many possible types with all the available input blocks
  fetchTableContent: () => void;
  clearTupleSelection: () => void;
  insertInAction: (isWaiting: boolean) => void; // for loading/waiting animation while insert takes place
}

interface InsertTupleState {
  tupleBuffer: any; // Tuple buffer to stored the values typed in by the user. Type any used here as there are many possible types with all the available input blocks
  errorMessage: string; // Error message string for failed inserts
}

/**
 * Class component to insertion of tuples
 */
export default class InsertTuple extends React.Component<InsertTupleProps, InsertTupleState> {
  constructor(props: InsertTupleProps) {
    super(props);
    this.state = {
      tupleBuffer: {},
      errorMessage: ''
    }

    this.onSubmit = this.onSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.copyTuple = this.copyTuple.bind(this);
    this.resetToNull = this.resetToNull.bind(this);
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
  handleChange(event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>, attributeName: string) {
    // Create a copy, update the object, then set state
    let tupleBuffer = Object.assign({}, this.state.tupleBuffer);
    tupleBuffer[attributeName] = event.target.value;
    this.setState({tupleBuffer: tupleBuffer});
  }

  /**
   * Helper function to handle copy over of the selected tuple into the insert fields by updating the tupleBuffer state.
   * @param tupleToInsert user selected tuple (single entry for now) to be copied over
   */
  copyTuple(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault();
    // Get the tuple and set it as tupleBuffer
    if (this.props.selectedTableEntry.length !== 0) {
      this.setState({tupleBuffer: this.props.selectedTableEntry});
    }
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
      if (primaryAttribute.attributeType !== TableAttributeType.BLOB) {
        if (!tupleBuffer.hasOwnProperty(primaryAttribute.attributeName) && primaryAttribute.autoIncrement === false) {
          this.setState({errorMessage: 'Missing require field: ' + primaryAttribute.attributeName});
          return;
        }
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
      else if (tupleBuffer[secondaryAttribute.attributeName] === '=NULL=' && secondaryAttribute.nullable) {
        delete tupleBuffer[secondaryAttribute.attributeName];
      }
      else {
        this.setState({errorMessage: 'Missing require field: ' + secondaryAttribute.attributeName});
      }
    }

    // start insert in action wait animation and stop when api responds
    this.props.insertInAction(true);

    // All checks passed thus attempt insert
    fetch(`${process.env.REACT_APP_DJLABBOOK_BACKEND_PREFIX}/insert_tuple`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token},
      body: JSON.stringify({schemaName: this.props.selectedSchemaName, tableName: this.props.selectedTableName, tuple: tupleBuffer})
    })
    .then(result => {
      this.props.insertInAction(false);
      // Check for error mesage 500, if so throw and error
      if (result.status === 500) {
        result.text()
        .then(errorMessage => {throw new Error(errorMessage)})
        .catch((error) => {
          this.setState({errorMessage: error.message});
        });
      }
      return result.text();
    })
    .then(result => {
      // Insert was sucessful, tell TableView to fetch the content again
      this.setState({tupleBuffer: {}})
      this.props.clearTupleSelection();
      this.props.fetchTableContent();
    })
    .catch((error) => {
      this.props.insertInAction(false);
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
      <div>
        <h1>Insert</h1>
        <form onSubmit={this.onSubmit}>
          <div className="inputRow">
            {
              // Deal with primary attirbutes
              this.props.tableAttributesInfo?.primaryAttributes.map((primaryTableAttribute) => {
                return(
                  <div className='fieldUnit' key={primaryTableAttribute.attributeName}>
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
          {
            this.props.selectedTableEntry !== undefined ?
            <div className="copyOverPrompt">
              <FontAwesomeIcon className="icon" icon={faExclamationCircle}/>
              <span>Table entry selection detected. Copy over for a quick prefill?</span>
              <button onClick={(event) => this.copyTuple(event)}>Copy Over</button>
            </div> :
            ''
          } 
          <input className="confirmActionButton insert" type='submit' value='Insert'></input>
        </form>
        {this.state.errorMessage ? (
          <div>{this.state.errorMessage}<button className="dismiss" onClick={() => this.setState({errorMessage: ''})}>dismiss</button></div>
        ) : ''}
      </div>
    )
  }
}