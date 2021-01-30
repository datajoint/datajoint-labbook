import PrimaryTableAttribute from './PrimaryTableAttribute';
import SecondaryTableAttribute from './SecondaryTableAttribute';

class TableAttributesInfo {
  primaryAttributes: Array<PrimaryTableAttribute>;
  secondaryAttributes: Array<SecondaryTableAttribute>;

  constructor(primaryAtributes: Array<PrimaryTableAttribute>, secondaryAttributes: Array<SecondaryTableAttribute>) {
    this.primaryAttributes = primaryAtributes;
    this.secondaryAttributes = secondaryAttributes;
  }
}

export default TableAttributesInfo;