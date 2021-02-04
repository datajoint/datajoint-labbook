import React from 'react';
import TableAttribute from './DataStorageClasses/TableAttribute';
import TableAttributesInfo from './DataStorageClasses/TableAttributesInfo';
import PrimaryTableAttribute from './DataStorageClasses/PrimaryTableAttribute';
import TableAttributeType from './enums/TableAttributeType';

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
 */
class InsertTuple extends React.Component<{token: string, selectedSchemaName:string, selectedTableName: string, tableAttributesInfo?: TableAttributesInfo, fetchTableContent: any}, insertTupleState> {
  constructor(props: any) {
    super(props);
    this.state = {
      tupleBuffer: {},
      errorMessage: ''
    }

    this.onSubmit = this.onSubmit.bind(this);
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
      if (tableAttribute.attributeType === TableAttributeType.DATE) {
        // Check if attribute exists, if not break
        if (!tupleBuffer.hasOwnProperty(tableAttribute.attributeName)) {
          break;
        }

        // Covert date to UTC
        let date = new Date(tupleBuffer[tableAttribute.attributeName])
        tupleBuffer[tableAttribute.attributeName] = date.getUTCFullYear() + ':' + date.getUTCMonth() + ':' + date.getUTCDay()
      }
      else if (tableAttribute.attributeType === TableAttributeType.DATETIME || tableAttribute.attributeType === TableAttributeType.TIMESTAMP) {
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
    fetch('/api/insert_tuple', {
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
   * Helper function to deal with the creation of the lables to go with the inputs creatd in the getAttributeInputBlock
   * @param tableAttribute Table attribute object so the function can extract the attributeName (Could add special label/look CSS for differnet types later on)
   * @param typeString The string to put in () for the user to see of what type the attribute is
   */
  getAttributeLabelBlock(tableAttribute: TableAttribute, typeString: string) {
    return <label htmlFor={tableAttribute.attributeName}>{tableAttribute.attributeName + ' (' + typeString + '): '}</label>;
  }

  /**
   * Helper rendering function to handle the create of Input and its corresponding Label
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
    else if (tableAttribute.attributeType === TableAttributeType.FLOAT || tableAttribute.attributeType === TableAttributeType.DECIMAL) {
      return(
        <div>
          {this.getAttributeLabelBlock(tableAttribute, 'decimal')}
          <input type='number' defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={this.handleChange.bind(this, tableAttribute.attributeName)}></input>
        </div>
      );
    }
    else if (tableAttribute.attributeType === TableAttributeType.FLOAT_UNSIGNED || tableAttribute.attributeType === TableAttributeType.DECIMAL_UNSIGNED) { // This is depricated in MYSQL 8.0
      return(
        <div>
          {this.getAttributeLabelBlock(tableAttribute, 'decimal unsigned')}
          <input type='number' min='0' defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={this.handleChange.bind(this, tableAttribute.attributeName)}></input>
        </div>
      );
    }
    else if (tableAttribute.attributeType === TableAttributeType.BOOL) {
      if (defaultValue === '') {
        defaultValue = 'false'
      }
      return(
        <div>
          {this.getAttributeLabelBlock(tableAttribute, 'bool')}
          <select defaultValue={defaultValue}>
            <option value='false'></option>
            <option value='true'></option>
          </select>
        </div>
      );
    }
    else if (tableAttribute.attributeType === TableAttributeType.CHAR) {
      return (
        <div>
          {this.getAttributeLabelBlock(tableAttribute, 'char(' + tableAttribute.stringTypeAttributeLengthInfo + ')')}
          <input type='text' defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={this.handleChange.bind(this, tableAttribute.attributeName)}></input>
        </div>
      );
    }
    else if (tableAttribute.attributeType === TableAttributeType.VAR_CHAR) {
      return (
        <div>
          {this.getAttributeLabelBlock(tableAttribute, 'varchar(' + tableAttribute.stringTypeAttributeLengthInfo + ')')}
          <input type='text' defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={this.handleChange.bind(this, tableAttribute.attributeName)}></input>
        </div>
      );
    }
    else if (tableAttribute.attributeType === TableAttributeType.UUID) { // TODO NEED TO DEAL WITH UUID GENRATION HERE
      return (
        <div>
          {this.getAttributeLabelBlock(tableAttribute, 'UUID')}
          <input disabled></input>
        </div>
      );
    }
    else if (tableAttribute.attributeType === TableAttributeType.DATE) {
      return (
        <div>
          {this.getAttributeLabelBlock(tableAttribute, 'date')}
          <input type='date' defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={this.handleChange.bind(this, tableAttribute.attributeName)}></input>
        </div>
      )
    }
    else if (tableAttribute.attributeType === TableAttributeType.DATETIME) {
      return (
        <div>
          {this.getAttributeLabelBlock(tableAttribute, 'date time')}
          <input type='date' defaultValue={defaultValue} id={tableAttribute.attributeName + '__date'} onChange={this.handleChange.bind(this, tableAttribute.attributeName + '__date')}></input>
          <input type='time' step="1" defaultValue={defaultValue} id={tableAttribute.attributeName + '__time'} onChange={this.handleChange.bind(this, tableAttribute.attributeName + "__time")}></input>
        </div>
      );
    }
    else if (tableAttribute.attributeType === TableAttributeType.TIME) {
      return (
        <div>
          {this.getAttributeLabelBlock(tableAttribute, 'HH:MM:SS')}
          <input type='text' defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={this.handleChange.bind(this, tableAttribute.attributeName)}></input>
        </div>
      );
    }
    else if (tableAttribute.attributeType === TableAttributeType.TIMESTAMP) {
      return (
        <div>
          {this.getAttributeLabelBlock(tableAttribute, 'time stamp')}
          <input type='date' defaultValue={defaultValue} id={tableAttribute.attributeName + '__date'} onChange={this.handleChange.bind(this, tableAttribute.attributeName + '__date')}></input>
          <input type='time' step="1" defaultValue={defaultValue} id={tableAttribute.attributeName + '__time'} onChange={this.handleChange.bind(this, tableAttribute.attributeName + "__time")}></input>
        </div>
      );
    }
    else if (tableAttribute.attributeType === TableAttributeType.ENUM) {
      return (
        <div>
          {this.getAttributeLabelBlock(tableAttribute, 'enum')}
          <select onChange={this.handleChange.bind(this, tableAttribute.attributeName)}> {
            tableAttribute.enumOptions?.map((enumOptionString: string) => {
              return(<option value={enumOptionString}>{enumOptionString}</option>);
          })}
          </select>
        </div>
      )
    }

    // Handle number return types
    if (type === 'number') {
      return (
      <div>
        {this.getAttributeLabelBlock(tableAttribute, typeString)}
        <input type={type} min={min} max={max} defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={this.handleChange.bind(this, tableAttribute.attributeName)}></input>
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
        <div>
          {this.getAttributeLabelBlock(primaryTableAttribute, 'Auto Increment')}
          <input disabled></input>
        </div>
      )
    }
    else {
      return this.getAttributeInputBlock(primaryTableAttribute);
    }
  }

  render() {
    return (
      <div>
        <h1>Insert</h1>
        <form onSubmit={this.onSubmit}>
          {
            // Deal with primary attirbutes
            this.props.tableAttributesInfo?.primaryAttributes.map((primaryTableAttribute) => {
              return(
                this.getPrimaryAttributeInputBlock(primaryTableAttribute)
              )
            })
          }
          {
            // Deal with secondary attributes 
            this.props.tableAttributesInfo?.secondaryAttributes.map((secondaryAttribute) => {
              return(
                this.getAttributeInputBlock(secondaryAttribute)
              )
            })
          }
          <input type='submit' value='Submit'></input>
        </form>
        <div>{this.state.errorMessage}</div>
      </div>
    )
  }
}

export default InsertTuple;