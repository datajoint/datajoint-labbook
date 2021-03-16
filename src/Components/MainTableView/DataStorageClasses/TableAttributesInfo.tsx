import PrimaryTableAttribute from './PrimaryTableAttribute';
import SecondaryTableAttribute from './SecondaryTableAttribute';

/**
 * Datastorage class for grouping up and storing all the primary and secondary attributes infos of a given table
 */
export default class TableAttributesInfo {
  primaryAttributes: Array<PrimaryTableAttribute>;
  secondaryAttributes: Array<SecondaryTableAttribute>;

  /**
   * Constructor for TableAttribteInfo
   * @param primaryAttributes Array of primary attributes of the given table
   * @param secondaryAttributes Array of secondary attribute of the given table
   */
  constructor(primaryAttributes: Array<PrimaryTableAttribute>, secondaryAttributes: Array<SecondaryTableAttribute>) {
    this.primaryAttributes = primaryAttributes;
    this.secondaryAttributes = secondaryAttributes;
  }
}