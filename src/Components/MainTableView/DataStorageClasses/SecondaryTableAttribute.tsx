import TableAttribute from './TableAttribute';
import TableAttributeType from '../enums/TableAttributeType'

/**
 * Class for secondary attributes of a table, deals with cases of it being nullable, defaultValue
 */
class SecondaryTableAttribute extends TableAttribute {
    nullable: boolean;
    defaultValue: string;
  
    constructor(attributeName: string,
      attributeType: TableAttributeType,
      nullable: boolean,
      defaultValue: string,
      stringTypeAttributeLengthInfo?: number,
      enumOptions?: Array<string>,
      decimalNumDigits?: number,
      decimalNumDecimalDigits?: number
      ) {
      super(attributeName, attributeType, stringTypeAttributeLengthInfo, enumOptions, decimalNumDigits, decimalNumDecimalDigits);
      this.nullable = nullable;
      this.defaultValue = defaultValue;
    }
  }

export default SecondaryTableAttribute;