import RestrictionType from '../enums/RestrictionType'
import TableAttribute from './TableAttribute'

/**
 * Class to handle the datastorage of restrctions FilterCards
 */
export default class Restriction {
  id: number
  tableAttribute?: TableAttribute
  restrictionType?: RestrictionType
  value?: any
  isEnable: boolean

  /**
   * @param id Unique indentify to be use for react keys so react can keep track of who is who
   * @param tableAttribute Table attribute object
   * @param restrictionType  Restrction type enum operation
   * @param value Value of wanted restriction
   * @param isEnable For toggling if the user wants to enable restriction or not
   */
  constructor(id:number, tableAttribute?: TableAttribute, restrictionType?: RestrictionType, value?: any, isEnable: boolean = true) {
    this.id = id;
    this.tableAttribute = tableAttribute;
    this.restrictionType = restrictionType;
    this.value = value;
    this.isEnable = isEnable;
  }

  /**
   * Helper function for translating the enums to string for api query
   * @param restrictionType enum of RestrictionType
   */
  static getRestrictionTypeString(restrictionType?: RestrictionType) {
    if (restrictionType === undefined) {
      return '';
    }
    else if (restrictionType === RestrictionType.EQUAL) {
      return '=';
    }
    else if (restrictionType === RestrictionType.NOT_EQUAL) {
      return '!='
    }
    else if (restrictionType === RestrictionType.LESS_THAN) {
      return '<';
    }
    else if (restrictionType === RestrictionType.LESS_THAN_AND_EQUAL_TO) {
      return '<='
    }
    else if (restrictionType === RestrictionType.GREATER_THAN) {
      return '>'
    }
    else if (restrictionType === RestrictionType.GREATER_THAN_AND_EQUAL_TO) {
      return '>='
    }

    throw Error('Unsupported Restriction Type for translation')
  }
}