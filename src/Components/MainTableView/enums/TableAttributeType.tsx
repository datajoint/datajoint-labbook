// Struct and enums to handle table attributes
enum TableAttributeType {
    TINY = 0,
    TINY_UNSIGNED = 1,
    SMALL = 2,
    SMALL_UNSIGNED = 3,
    MEDIUM = 4,
    MEDIUM_UNSIGNED = 5,
    BIG = 6,
    BIG_UNSIGNED = 7,
    INT = 8,
    INT_UNSIGNED = 9,
    DECIMAL = 10,
    DECIMAL_UNSIGNED = 11,
    FLOAT = 12,
    FLOAT_UNSIGNED = 13,
    BOOL = 14,
    CHAR = 15,
    VAR_CHAR = 16,
    UUID = 17,
    DATE = 18,
    DATETIME = 19,
    TIMESTAMP = 20,
    ENUM = 21
  }

export default TableAttributeType;