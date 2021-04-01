export default class TableListDict {
    part_tables: Array<string>;
    computed_tables: Array<string>;
    manual_tables: Array<string>;
    lookup_tables: Array<string>;
    imported_tables: Array<string>;

    constructor(tableDict: any) {
        this.part_tables = tableDict['part'];
        this.computed_tables = tableDict['computed'];
        this.manual_tables = tableDict['manual'];
        this.lookup_tables = tableDict['lookup'];
        this.imported_tables = tableDict['imported'];
    }
}