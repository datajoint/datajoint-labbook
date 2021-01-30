import TableAttributeType from '../enums/TableAttributeType';

/**
 * Parent class for table attributes, typically never used directly
 */
class TableAttribute {
    attributeName: string;
    attributeType: TableAttributeType;
    stringTypeAttributeLengthInfo?: number;
    enumOptions?: Array<string>;
  
    constructor(attributeName: string, attributeType: TableAttributeType, stringTypeAttributeLengthInfo?: number, enumOptions?: Array<string>) {
      this.attributeName = attributeName;
      this.attributeType = attributeType;
      this.stringTypeAttributeLengthInfo = stringTypeAttributeLengthInfo;
      this.enumOptions = enumOptions;
    }
  }

export default TableAttribute;