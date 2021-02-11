import RestrictionType from '../enums/RestrictionType'
import TableAttribute from './TableAttribute'

class Restriction {
  tableAttribute?: TableAttribute
  restrictionType?: RestrictionType
  value?: any

  constructor(tableAttribute?: TableAttribute, restrictionType?: RestrictionType, value?: any) {
    this.tableAttribute = tableAttribute;
    this.restrictionType = restrictionType;
    this.value = value;

    this.getRestrictionTypeString = this.getRestrictionTypeString.bind(this);
  }

  getRestrictionTypeString() {
    if (this.restrictionType === undefined) {
      return '';
    }
    else if (this.restrictionType === RestrictionType.EQUAL) {
      return '=';
    }
    else if (this.restrictionType === RestrictionType.NOT_EQUAL) {
      return '!='
    }
    else if (this.restrictionType === RestrictionType.LESS_THAN) {
      return '<';
    }
    else if (this.restrictionType === RestrictionType.LESS_THAN_AND_EQUAL_TO) {
      return '<='
    }
    else if (this.restrictionType === RestrictionType.GREATER_THAN) {
      return '>'
    }
    else if (this.restrictionType === RestrictionType.GREATER_THAN_AND_EQUAL_TO) {
      return '>='
    }
  }
}

export default Restriction