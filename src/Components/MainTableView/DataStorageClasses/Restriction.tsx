import RestrictionType from '../enums/RestrictionType'
import TableAttribute from './TableAttribute'

class Restriction {
  tableAttribute?: TableAttribute
  restrictionType?: RestrictionType
  value?: any
  isEnable: boolean

  constructor(tableAttribute?: TableAttribute, restrictionType?: RestrictionType, value?: any, isEnable: boolean = true) {
    this.tableAttribute = tableAttribute;
    this.restrictionType = restrictionType;
    this.value = value;
    this.isEnable = isEnable;
  }

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

export default Restriction