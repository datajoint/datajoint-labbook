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

  /**
   * Helper function to deal with the creation of the lables to go with the inputs creatd in the getAttributeInputBlock
   * @param tableAttribute Table attribute object so the function can extract the attributeName (Could add special label/look CSS for differnet types later on)
   * @param typeString The string to put in () for the user to see of what type the attribute is
   */
  getAttributeLabelBlock(tableAttribute: any, typeString: string) {
    return (
      <div className="attributeHead">
        <label style={tableAttribute.constructor === PrimaryTableAttribute ? {color: '#399E5A', fontWeight: 'bolder'} : {color: 'inherit', fontWeight: 'normal'}} htmlFor={tableAttribute.attributeName}>{tableAttribute.attributeName + ' (' + typeString + ')'}</label>
        {tableAttribute.constructor === SecondaryTableAttribute && tableAttribute.nullable ? 
          <div className="nullableControls">
            <div className="nullableTag">nullable</div>
            <FontAwesomeIcon className="resetIcon" icon={faRedoAlt} onClick={() => {this.resetToNull(tableAttribute)}} />
          </div> : ''
        }
      </div>
    );
  }

  /**
   * Helper rendering function to handle the create of Input and its corresponding Label.
   * Primary keys are uneditable in update mode.
   * @param tableAttribute Table attribute object so the function can extract the attributeName and attributeType
   * @param defaultValue Default value of any to set the input component to, assuming that the input type supports a default value
   */
  getAttributeInputBlock(tableAttribute: TableAttribute, defaultValue: string = '') {
    let type: string = ''
    let typeString: string = ''
    let min: string = '0';
    let max: string = '0';

    // Determine type and any other attributes that need to be set based on that
    if (tableAttribute.attributeType === TableAttributeType.TINY) {
      type = 'number';
      typeString = 'tiny';
      min = '128';
      max = '127';
    }
    else if (tableAttribute.attributeType === TableAttributeType.TINY_UNSIGNED) {
      type = 'number';
      typeString = 'tiny unsigned';
      min = '0';
      max = '255';
    }
    else if (tableAttribute.attributeType === TableAttributeType.SMALL) {
      type = 'number';
      typeString = 'small';
      min = '-32768';
      max = '32767';
    }
    else if (tableAttribute.attributeType === TableAttributeType.SMALL_UNSIGNED) {
      type = 'number';
      typeString = 'small unsigned';
      min = '0';
      max = '65535';
    }
    else if (tableAttribute.attributeType === TableAttributeType.MEDIUM) {
      type = 'number';
      typeString = 'medium';
      min = '-8388608';
      max = '8388607';
    }
    else if (tableAttribute.attributeType === TableAttributeType.MEDIUM_UNSIGNED) {
      type = 'number';
      typeString = 'medium unsigned';
      min = '0';
      max = '16777215';
    }
    else if (tableAttribute.attributeType === TableAttributeType.BIG) {
      type = 'number';
      typeString = 'big';
      min = '-9223372036854775808';
      max = '9223372036854775807';
    }
    else if (tableAttribute.attributeType === TableAttributeType.BIG_UNSIGNED) {
      type = 'number';
      typeString = 'big unsigned';
      min = '0';
      max = '18446744073709551615';
    }
    else if (tableAttribute.attributeType === TableAttributeType.INT) {
      type = 'number';
      typeString = 'tiny';
      min = '-2147483648';
      max = '2147483647';
    }
    else if (tableAttribute.attributeType === TableAttributeType.INT_UNSIGNED) {
      type = 'number';
      typeString = 'tiny';
      min = '0';
      max = '4294967295';
    }
    else if (tableAttribute.attributeType === TableAttributeType.FLOAT) {
      return(
        <div className="fieldUnit" key={JSON.stringify(tableAttribute)}>
          {this.getAttributeLabelBlock(tableAttribute, 'float')}
          <input type='number' disabled={tableAttribute.constructor === PrimaryTableAttribute ? true: false} value={this.state.tupleBuffer[tableAttribute.attributeName]} defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={this.handleChange.bind(this, tableAttribute.attributeName)}></input>
        </div>
      );
    }
    else if (tableAttribute.attributeType === TableAttributeType.FLOAT_UNSIGNED ) {
      return(
        <div className="fieldUnit" key={JSON.stringify(tableAttribute)}>
          {this.getAttributeLabelBlock(tableAttribute, 'float unsigned')}
          <input type='number' disabled={tableAttribute.constructor === PrimaryTableAttribute ? true: false} value={this.state.tupleBuffer[tableAttribute.attributeName]} min='0' defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={this.handleChange.bind(this, tableAttribute.attributeName)}></input>
        </div>
      );
    }
    else if (tableAttribute.attributeType === TableAttributeType.DECIMAL) {
      // Check that decimalNumdigits, and decimalNumDecimalDigits are not undefined
      if (tableAttribute.decimalNumDigits === undefined || tableAttribute.decimalNumDecimalDigits === undefined) {
        throw Error('Decimal attributes of decimalNumDigits or decimalNumDecimalDigits are undefined');
      }

      // Generate max number input for the given params
      let maxValueString: string = '';
      let stepValueString : string = '0.';
      // Deal with the leading numbers before the decimal point
      for (let i = 0; i < tableAttribute.decimalNumDigits - tableAttribute.decimalNumDecimalDigits; i++) {
        maxValueString += '9'
      }
      maxValueString += '.'
      
      for (let i = 0; i < tableAttribute.decimalNumDecimalDigits; i++) {
        maxValueString += '9'
      }

      for (let i = 0; i < tableAttribute.decimalNumDecimalDigits - 1; i++) {
        stepValueString += '0'
      }
      stepValueString += '1'

      return(
        <div className="fieldUnit" key={JSON.stringify(tableAttribute)}>
          {this.getAttributeLabelBlock(tableAttribute, 'decimal(' + tableAttribute.decimalNumDigits + ', ' + tableAttribute.decimalNumDecimalDigits)}
          <input type='number' disabled={tableAttribute.constructor === PrimaryTableAttribute ? true: false} value={this.state.tupleBuffer[tableAttribute.attributeName]} step={stepValueString} min={('-' + maxValueString)} max={maxValueString} defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={this.handleChange.bind(this, tableAttribute.attributeName)}></input>
        </div>
      );
    }
    else if (tableAttribute.attributeType === TableAttributeType.BOOL) {
      if (defaultValue === '') {
        defaultValue = 'false'
      }
      return(
        <div className="fieldUnit" key={JSON.stringify(tableAttribute)}>
          {this.getAttributeLabelBlock(tableAttribute, 'bool')}
          <select defaultValue={defaultValue}>
            <option  selected={!this.state.tupleBuffer[tableAttribute.attributeName]} value='false'></option>
            <option selected={this.state.tupleBuffer[tableAttribute.attributeName]} value='true'></option>
          </select>
        </div>
      );
    }
    else if (tableAttribute.attributeType === TableAttributeType.CHAR) {
      return (
        <div className="fieldUnit" key={JSON.stringify(tableAttribute)}>
          {this.getAttributeLabelBlock(tableAttribute, 'char(' + tableAttribute.stringTypeAttributeLengthInfo + ')')}
          <input type='text' disabled={tableAttribute.constructor === PrimaryTableAttribute ? true: false} value={this.state.tupleBuffer[tableAttribute.attributeName]} defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={this.handleChange.bind(this, tableAttribute.attributeName)}></input>
        </div>
      );
    }
    else if (tableAttribute.attributeType === TableAttributeType.VAR_CHAR) {
      return (
        <div className="fieldUnit" key={JSON.stringify(tableAttribute)}>
          {this.getAttributeLabelBlock(tableAttribute, 'varchar(' + tableAttribute.stringTypeAttributeLengthInfo + ')')}
          <input type='text' disabled={tableAttribute.constructor === PrimaryTableAttribute ? true: false} value={this.state.tupleBuffer[tableAttribute.attributeName]} defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={this.handleChange.bind(this, tableAttribute.attributeName)}></input>
        </div>
      );
    }
    else if (tableAttribute.attributeType === TableAttributeType.UUID) {
      return (
        <div className="fieldUnit" key={JSON.stringify(tableAttribute)}>
          {this.getAttributeLabelBlock(tableAttribute, 'UUID')}
          <input type='text' disabled={tableAttribute.constructor === PrimaryTableAttribute ? true: false} value={this.state.tupleBuffer[tableAttribute.attributeName]} defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={this.handleChange.bind(this, tableAttribute.attributeName)}></input>
        </div>
      );
    }
    else if (tableAttribute.attributeType === TableAttributeType.DATE) {
      return (
        <div className="fieldUnit" key={JSON.stringify(tableAttribute)}>
          {this.getAttributeLabelBlock(tableAttribute, 'date')}
          <input type='date' disabled={tableAttribute.constructor === PrimaryTableAttribute ? true: false} defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={this.handleChange.bind(this, tableAttribute.attributeName)}></input>
        </div>
      )
    }
    else if (tableAttribute.attributeType === TableAttributeType.DATETIME) {
      let dateFieldValue = ''
      let timeFieldValue = ''
      if (this.state.tupleBuffer[tableAttribute.attributeName]) {
        dateFieldValue = TableAttribute.parseDateTimeToDJFormat(this.state.tupleBuffer[tableAttribute.attributeName]).split(' ')[0]
        timeFieldValue = TableAttribute.parseDateTimeToDJFormat(this.state.tupleBuffer[tableAttribute.attributeName]).split(' ')[1]
      }
      
      return (
        <div className="fieldUnit" key={JSON.stringify(tableAttribute)}>
          {this.getAttributeLabelBlock(tableAttribute, 'date time')}
          <div className="dateTimeFields">
            <input type='date' disabled={tableAttribute.constructor === PrimaryTableAttribute ? true: false} defaultValue={defaultValue} id={tableAttribute.attributeName + '__date'} onChange={this.handleChange.bind(this, tableAttribute.attributeName + '__date')}></input>
            <input type='time' disabled={tableAttribute.constructor === PrimaryTableAttribute ? true: false} defaultValue={defaultValue} step="1" id={tableAttribute.attributeName + '__time'} onChange={this.handleChange.bind(this, tableAttribute.attributeName + "__time")}></input>
          </div>
        </div>
      );
    }
    else if (tableAttribute.attributeType === TableAttributeType.TIME) {
      let timeFieldValue = ''
      if (this.state.tupleBuffer[tableAttribute.attributeName]) {
        timeFieldValue = TableAttribute.parseTimeString(this.state.tupleBuffer[tableAttribute.attributeName])
      }
      return (
        <div className="fieldUnit" key={JSON.stringify(tableAttribute)}>
          {this.getAttributeLabelBlock(tableAttribute, 'HH:MM:SS')}
          <input type='text' disabled={tableAttribute.constructor === PrimaryTableAttribute ? true: false} defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={this.handleChange.bind(this, tableAttribute.attributeName)}></input>
        </div>
      );
    }
    else if (tableAttribute.attributeType === TableAttributeType.TIMESTAMP) {
      let dateFieldValue = ''
      let timeFieldValue = ''
      if (this.state.tupleBuffer[tableAttribute.attributeName]) {
        dateFieldValue = TableAttribute.parseDateTimeToDJFormat(this.state.tupleBuffer[tableAttribute.attributeName]).split(' ')[0]
        timeFieldValue = TableAttribute.parseDateTimeToDJFormat(this.state.tupleBuffer[tableAttribute.attributeName]).split(' ')[1]
      }
      return (
        <div className="fieldUnit" key={JSON.stringify(tableAttribute)}>
          {this.getAttributeLabelBlock(tableAttribute, 'time stamp')}
          <div className="dateTimeFields">
            <input type='date' disabled={tableAttribute.constructor === PrimaryTableAttribute ? true: false} defaultValue={defaultValue} id={tableAttribute.attributeName + '__date'} onChange={this.handleChange.bind(this, tableAttribute.attributeName + '__date')}></input>
            <input type='time' disabled={tableAttribute.constructor === PrimaryTableAttribute ? true: false} defaultValue={defaultValue} step="1" id={tableAttribute.attributeName + '__time'} onChange={this.handleChange.bind(this, tableAttribute.attributeName + "__time")}></input>
          </div>
        </div>
      );
    }
    else if (tableAttribute.attributeType === TableAttributeType.ENUM) {
      return (
        <div className="fieldUnit" key={JSON.stringify(tableAttribute)}>
          {this.getAttributeLabelBlock(tableAttribute, 'enum')}
          <select onChange={this.handleChange.bind(this, tableAttribute.attributeName)}> {
            tableAttribute.enumOptions?.map((enumOptionString: string) => {
              return(<option selected={this.state.tupleBuffer[tableAttribute.attributeName] === enumOptionString} key={enumOptionString} value={enumOptionString}>{enumOptionString}</option>);
          })}
          </select>
        </div>
      )
    }

    // Handle number return types
    if (type === 'number') {
      return (
      <div className="fieldUnit" key={JSON.stringify(tableAttribute)}>
        {this.getAttributeLabelBlock(tableAttribute, typeString)}
        <input disabled={tableAttribute.constructor === PrimaryTableAttribute ? true: false} value={this.state.tupleBuffer[tableAttribute.attributeName]} type={type} min={min} max={max} defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={this.handleChange.bind(this, tableAttribute.attributeName)}></input>
      </div>
      )
    }

    throw Error('Unsupported Type found for attribute: ' + tableAttribute.attributeName);
  }

  /**
   * Helper function specifically dealing with primary attributes where it checks for autoIncrement, if that is true then return a disable Input
   * @param primaryTableAttribute PrimaryTableAttribute attribute object to mainly check for autoIncrement
   */
  getPrimaryAttributeInputBlock(primaryTableAttribute: PrimaryTableAttribute) {
    if (primaryTableAttribute.autoIncrement === true) {
      return(
        <div className="fieldUnit" key={JSON.stringify(primaryTableAttribute)}>
          {this.getAttributeLabelBlock(primaryTableAttribute, 'Auto Increment')}
          <input disabled></input>
        </div>
      )
    }
    else {
      return this.getAttributeInputBlock(primaryTableAttribute);
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