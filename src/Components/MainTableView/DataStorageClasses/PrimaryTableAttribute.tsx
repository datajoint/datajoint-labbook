import TableAttribute from './TableAttribute';
import TableAttributeType from '../enums/TableAttributeType'

/**
 * Class for Primary attributes of a table, only has the additional field of autoIncrement for int type keys
 */
class PrimaryTableAttribute extends TableAttribute {
    autoIncrement: boolean; // Note this is only valid if the attributeType is int type
  
    constructor(
      attributeName: string, 
      attributeType: TableAttributeType,
      autoIncrement: boolean,
      stringTypeAttributeLengthInfo?: number,
      enumOptions?: Array<string>,
      decimalNumDigits?: number,
      decimalNumDecimalDigits?: number
      ) {
      super(attributeName, attributeType, stringTypeAttributeLengthInfo, enumOptions, decimalNumDigits, decimalNumDecimalDigits);
      this.autoIncrement = autoIncrement;
    }
  }

export default PrimaryTableAttribute;