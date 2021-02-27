import TableAttribute from './TableAttribute';
import TableAttributeType from '../enums/TableAttributeType'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faRedoAlt} from '@fortawesome/free-solid-svg-icons'

/**
 * Class for secondary attributes of a table, deals with cases of it being nullable, defaultValue
 */
class SecondaryTableAttribute extends TableAttribute {
  nullable: boolean;
  defaultValue?: string;

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

  static getAttributeLabelBlock(secondaryTableAttribute: SecondaryTableAttribute, resetToNullCallback: any) {
    const typeString = super.getTypeString(secondaryTableAttribute);
    var resetButtonText = 'nullable';

    // I don't think this detects is correctly
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

  static getAttributeInputBlock(secondaryTableAttribute: SecondaryTableAttribute, currentValue: any, handleChange: any) {
    return super.getAttributeInputBlock(secondaryTableAttribute, currentValue, secondaryTableAttribute.defaultValue, handleChange);
  }
}

export default SecondaryTableAttribute;