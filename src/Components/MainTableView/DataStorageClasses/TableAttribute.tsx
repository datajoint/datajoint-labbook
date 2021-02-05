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
  }

export default TableAttribute;