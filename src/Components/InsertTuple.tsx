import React from 'react';
import {TableAttribute, PrimaryTableAttribute, TableAttributesInfo, TableAttributeType, SecondaryTableAttribute} from './TableView'

type insertTupleState = {
  tupleBuffer: any
}

class InsertTuple extends React.Component<{tableAttributesInfo?: TableAttributesInfo}, insertTupleState> {
  constructor(props: any) {
    super(props);
    this.state = {
      tupleBuffer: {}
    }

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    console.log(this.props.tableAttributesInfo);
  }

  handleChange(attributeName: string, event: any) {
    // Check that event.value is not null
    console.log(attributeName);
    console.log(this.state.tupleBuffer);
    
    let tupleBuffer = this.state.tupleBuffer;
    tupleBuffer[attributeName] = event.target.value;
    this.setState({tupleBuffer: tupleBuffer});
  }

  onSubmit(event: any) {

  }

  getAttributeLabelBlock(tableAttribute: TableAttribute, typeString: string) {
    console.log(tableAttribute.attributeName);
    console.log('getAttributelabel')
    return <label htmlFor={tableAttribute.attributeName}>{tableAttribute.attributeName + ' (' + typeString + '): '}</label>;
  }

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
          <input type='text'  defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={this.handleChange.bind(this, tableAttribute.attributeName)}></input>
        </div>
      );
    }
    else if (tableAttribute.attributeType === TableAttributeType.VAR_CHAR) {
      return (
        <div>
          {this.getAttributeLabelBlock(tableAttribute, 'varchar(' + tableAttribute.stringTypeAttributeLengthInfo + ')')}
          <input type='text'  defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={this.handleChange.bind(this, tableAttribute.attributeName)}></input>
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
    else if (tableAttribute.attributeType === TableAttributeType.DATETIME) {
      return (
        <div>
          {this.getAttributeLabelBlock(tableAttribute, 'date time')}
          <input type='date' defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={this.handleChange.bind(this, tableAttribute.attributeName)}></input>
        </div>
      );
    }
    else if (tableAttribute.attributeType === TableAttributeType.TIMESTAMP) {
      return (
        <div>
          {this.getAttributeLabelBlock(tableAttribute, 'time')}
          <input type='time' defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={this.handleChange.bind(this, tableAttribute.attributeName)}></input>
        </div>
      );
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
  }

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

  getSecondaryAttributeInputBlock(secondaryTableAttribute: SecondaryTableAttribute) {
    return this.getAttributeInputBlock(secondaryTableAttribute);
  }

  render() {
    return (
      <div>
        <form>
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
                this.getSecondaryAttributeInputBlock(secondaryAttribute)
              )
            })
          }
          <input type='submit' value='Submit'></input>
        </form>
      </div>
    )
  }
}

export default InsertTuple;