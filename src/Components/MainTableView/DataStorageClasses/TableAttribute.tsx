import TableAttributeType from '../enums/TableAttributeType';

/**
 * Parent class for table attributes, typically never used directly
 */
class TableAttribute {
    attributeName: string;
    attributeType: TableAttributeType;
    stringTypeAttributeLengthInfo?: number;
    enumOptions?: Array<string>;
    decimalNumDigits?: number;
    decimalNumDecimalDigits?: number;
  
    constructor(
      attributeName: string,
      attributeType: TableAttributeType,
      stringTypeAttributeLengthInfo?: number,
      enumOptions?: Array<string>,
      decimalNumDigits?: number,
      decimalNumDecimalDigits?: number
      ) {
      this.attributeName = attributeName;
      this.attributeType = attributeType;
      this.stringTypeAttributeLengthInfo = stringTypeAttributeLengthInfo;
      this.enumOptions = enumOptions;
      this.decimalNumDigits = decimalNumDigits;
      this.decimalNumDecimalDigits = decimalNumDecimalDigits
    }

    static getAttributeInputBlock(tableAttribute: TableAttribute, currentValue: any, defaultValue: string = '', handleChange: any) {
      let type: string = ''
      let typeString: string = ''
      let min: string = '0';
      let max: string = '0';
  
      // Determine type and any other attributes that need to be set based on that
      if (tableAttribute.attributeType === TableAttributeType.TINY) {
        type = 'number';
        typeString = 'tiny';
        min = '128';
        max = '-127';
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
            <input type='number' value={currentValue} defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={handleChange.bind(this, tableAttribute.attributeName)}></input>
          </div>
        );
      }
      else if (tableAttribute.attributeType === TableAttributeType.FLOAT_UNSIGNED ) {
        return(
          <div className="fieldUnit" key={JSON.stringify(tableAttribute)}>
            <input type='number' value={currentValue} min='0' defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={handleChange.bind(this, tableAttribute.attributeName)}></input>
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
            <input type='number' value={currentValue} step={stepValueString} min={('-' + maxValueString)} max={maxValueString} defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={handleChange.bind(this, tableAttribute.attributeName)}></input>
          </div>
        );
      }
      else if (tableAttribute.attributeType === TableAttributeType.BOOL) {
        if (defaultValue === '') {
          defaultValue = 'false'
        }
        return(
          <div className="fieldUnit" key={JSON.stringify(tableAttribute)}>
            <select defaultValue={defaultValue}>
              <option selected={!currentValue} value='false'></option>
              <option selected={currentValue} value='true'></option>
            </select>
          </div>
        );
      }
      else if (tableAttribute.attributeType === TableAttributeType.CHAR) {
        return (
          <div className="fieldUnit" key={JSON.stringify(tableAttribute)}>
            <input type='text' value={currentValue} defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={handleChange.bind(this, tableAttribute.attributeName)}></input>
          </div>
        );
      }
      else if (tableAttribute.attributeType === TableAttributeType.VAR_CHAR) {
        return (
          <div className="fieldUnit" key={JSON.stringify(tableAttribute)}>
            <input type='text' value={currentValue} defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={handleChange.bind(this, tableAttribute.attributeName)}></input>
          </div>
        );
      }
      else if (tableAttribute.attributeType === TableAttributeType.UUID) {
        return (
          <div className="fieldUnit" key={JSON.stringify(tableAttribute)}>
            <input type='text' value={currentValue} defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={handleChange.bind(this, tableAttribute.attributeName)}></input>
          </div>
        );
      }
      else if (tableAttribute.attributeType === TableAttributeType.DATE) {
        return (
          <div className="fieldUnit" key={JSON.stringify(tableAttribute)}>
            <input type='date' defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={handleChange.bind(this, tableAttribute.attributeName)}></input>
          </div>
        )
      }
      else if (tableAttribute.attributeType === TableAttributeType.DATETIME) {
        return (
          <div className="fieldUnit" key={JSON.stringify(tableAttribute)}>
            <div className="dateTimeFields">
              <input type='date' defaultValue={defaultValue} id={tableAttribute.attributeName + '__date'} onChange={handleChange.bind(this, tableAttribute.attributeName + '__date')}></input>
              <input type='time' step="1" defaultValue={defaultValue} id={tableAttribute.attributeName + '__time'} onChange={handleChange.bind(this, tableAttribute.attributeName + "__time")}></input>
            </div>
          </div>
        );
      }
      else if (tableAttribute.attributeType === TableAttributeType.TIME) {
        return (
          <div className="fieldUnit" key={JSON.stringify(tableAttribute)}>
            <input type='text' defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={handleChange.bind(this, tableAttribute.attributeName)}></input>
          </div>
        );
      }
      else if (tableAttribute.attributeType === TableAttributeType.TIMESTAMP) {
        return (
          <div className="fieldUnit" key={JSON.stringify(tableAttribute)}>
            <div className="dateTimeFields">
              <input type='date' defaultValue={defaultValue} id={tableAttribute.attributeName + '__date'} onChange={handleChange.bind(this, tableAttribute.attributeName + '__date')}></input>
              <input type='time' step="1" defaultValue={defaultValue} id={tableAttribute.attributeName + '__time'} onChange={handleChange.bind(this, tableAttribute.attributeName + "__time")}></input>
            </div>
          </div>
        );
      }
      else if (tableAttribute.attributeType === TableAttributeType.ENUM) {
        return (
          <div className="fieldUnit" key={JSON.stringify(tableAttribute)}>
            <select onChange={handleChange.bind(this, tableAttribute.attributeName)}> {
              tableAttribute.enumOptions?.map((enumOptionString: string) => {
                return(<option selected={currentValue === enumOptionString} key={enumOptionString} value={enumOptionString}>{enumOptionString}</option>);
            })}
            </select>
          </div>
        )
      }
  
      // Handle number return types
      if (type === 'number') {
        return (
        <div className="fieldUnit" key={JSON.stringify(tableAttribute)}>
          <input value={currentValue} type={type} min={min} max={max} defaultValue={defaultValue} id={tableAttribute.attributeName} onChange={handleChange.bind(this, tableAttribute.attributeName)}></input>
        </div>
        )
      }
  
      throw Error('Unsupported Type found for attribute: ' + tableAttribute.attributeName);
    }
  }

export default TableAttribute;