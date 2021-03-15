import TableAttribute from './TableAttribute';
import TableAttributeType from '../enums/TableAttributeType'

/**
 * Class for Primary attributes of a table, only has the additional field of autoIncrement for int type keys
 */
export default class PrimaryTableAttribute extends TableAttribute {
  autoIncrement: boolean; // Note this is only valid if the attributeType is int type

  /**
   * Constructor for Primary Table
   * @param attributeName Name of attribute
   * @param attributeType Type of attribute
   * @param autoIncrement Either true or false
   * @param defaultValue Default value if exist
   * @param stringTypeAttributeLengthInfo Valid when the type is either a char or varchar undefined
   * @param enumOptions Valid when type is of enum, should be Array<string> undefined
   * @param decimalNumDigits Valid when type is decimal otherwise undefined
   * @param decimalNumDecimalDigits Valid when type is decimal otherwise undefined
   */
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

  /**
   * Function to generate html label block for a given primary attribute
   * @param primaryTableAttribute 
   * @returns HTML <label> block
   */
  static getAttributeLabelBlock(primaryTableAttribute: PrimaryTableAttribute) {
    if (primaryTableAttribute.autoIncrement) {
      return(
        <th className="attributeHead">
          <label className="primary-attribute-label" htmlFor={primaryTableAttribute.attributeName}>Auto Increment</label>
        </th>
      )
    }
    
    const typeString = super.getTypeString(primaryTableAttribute);
    return(
      <th className="attributeHead">
        <label className="primary-attribute-label" htmlFor={primaryTableAttribute.attributeName}>{primaryTableAttribute.attributeName + ' (' + typeString + ')'}</label>
      </th>
    )
  }

  /**
   * Construct input block based on primaryTableAttribute by extracting it type and other information
   * @param tableAttribute 
   * @param currentValue CurrentValue of the input block for binding. Type any used here as there are many possible types with all the available input blocks
   * @param handleChange Call back function for when the value of the input block changes
   * @returns 
   */
  static getPrimaryAttributeInputBlock(tableAttribute: PrimaryTableAttribute, currentValue: any, handleChange: (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>, attributeName: string) => void) {
    if (tableAttribute.autoIncrement) {
      return <input disabled></input>
    }
    
    return super.getAttributeInputBlock(tableAttribute, currentValue, undefined, handleChange)
  }
}