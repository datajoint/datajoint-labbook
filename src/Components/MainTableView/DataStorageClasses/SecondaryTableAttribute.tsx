import TableAttribute from './TableAttribute';
import TableAttributeType from '../enums/TableAttributeType'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faRedoAlt} from '@fortawesome/free-solid-svg-icons'

/**
 * Class for secondary attributes of a table, deals with cases of it being nullable, defaultValue
 */
export default class SecondaryTableAttribute extends TableAttribute {
  nullable: boolean;
  defaultValue?: string;

  /**
   * Constructor for Secondary Table
   * @param attributeName Name of attribute
   * @param attributeType Type of attribute
   * @param nullable Either true or false
   * @param defaultValue Default value if exist
   * @param stringTypeAttributeLengthInfo Valid when the type is either a char or varchar undefined
   * @param enumOptions Valid when type is of enum, should be Array<string> undefined
   * @param decimalNumDigits Valid when type is decimal otherwise undefined
   * @param decimalNumDecimalDigits Valid when type is decimal otherwise undefined
   */
  constructor(attributeName: string,
    attributeType: TableAttributeType,
    nullable: boolean,
    defaultValue?: string,
    stringTypeAttributeLengthInfo?: number,
    enumOptions?: Array<string>,
    decimalNumDigits?: number,
    decimalNumDecimalDigits?: number
    ) {
    super(attributeName, attributeType, stringTypeAttributeLengthInfo, enumOptions, decimalNumDigits, decimalNumDecimalDigits);
    this.nullable = nullable;
    this.defaultValue = defaultValue === null || defaultValue === 'null' ? undefined : defaultValue;
  }

  /**
   * Function to generate html label block for a given sedcondary attribute
   * @param secondaryTableAttribute 
   * @param resetToNullCallback Call back function for reset it back to null
   * @returns 
   */
  static getAttributeLabelBlock(secondaryTableAttribute: SecondaryTableAttribute, resetToNullCallback: (tableAttribute: SecondaryTableAttribute) => void) {
    const typeString = super.getTypeString(secondaryTableAttribute);
    var resetButtonText = 'nullable';

    if (secondaryTableAttribute.defaultValue !== undefined) {
      resetButtonText = 'default';
    }
    
    return(
      <div className="attributeHead">
        <label className="secondary-attribute-label" htmlFor={secondaryTableAttribute.attributeName}>{secondaryTableAttribute.attributeName + ' (' + typeString + ')'}</label>
        { 
            secondaryTableAttribute.nullable || secondaryTableAttribute.defaultValue ? 
            <div className="nullableControls">
              <div className="nullableTag">{resetButtonText}</div>
              <FontAwesomeIcon className="resetIcon" icon={faRedoAlt} onClick={() => {resetToNullCallback(secondaryTableAttribute)}} />
            </div> : ''
        }
      </div>
    )
  }

  /**
   * Construct input block based on secondaryTableAttribute by extracting it type and other information
   * @param secondaryTableAttribute 
   * @param currentValue CurrentValue of the input block for binding. Type any used here as there are many possible types with all the available input blocks
   * @param handleChange Call back function for when the value of the input block changes
   * @returns 
   */
  static getSecondaryAttributeInputBlock(secondaryTableAttribute: SecondaryTableAttribute, currentValue: any, handleChange: (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>, attributeName: string) => void) {
    return super.getAttributeInputBlock(secondaryTableAttribute, currentValue, secondaryTableAttribute.defaultValue, handleChange);
  }
}