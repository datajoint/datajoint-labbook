/**
 * Enum for each type of table supported by datajoint
 */
enum TableType {
    MANUAL = 0,
    COMPUTED = 1,
    LOOKUP = 2,
    IMPORTED = 3,
    PART = 4
  }

export default TableType;