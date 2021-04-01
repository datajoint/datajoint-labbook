// Struct and enums to handle table attributes
enum TableAttributeType {
    TINY,
    TINY_UNSIGNED,
    SMALL,
    SMALL_UNSIGNED,
    MEDIUM,
    MEDIUM_UNSIGNED,
    BIG,
    BIG_UNSIGNED,
    INT,
    INT_UNSIGNED,
    DECIMAL,
    DECIMAL_UNSIGNED,
    FLOAT,
    FLOAT_UNSIGNED,
    DOUBLE,
    BOOL,
    CHAR,
    VAR_CHAR,
    UUID,
    DATE,
    DATETIME,
    TIME,
    TIMESTAMP,
    ENUM,
    BLOB 
  }

export default TableAttributeType;