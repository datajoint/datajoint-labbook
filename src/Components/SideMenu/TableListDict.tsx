export default class TableListDict {
    part_tables: Array<string>;
    computed_tables: Array<string>;
    manual_tables: Array<string>;
    lookup_tables: Array<string>;
    imported_tables: Array<string>;

    constructor(tableDict: any) {
        this.part_tables = tableDict['part_tables'];
        this.computed_tables = tableDict['computed_tables'];
        this.manual_tables = tableDict['manual_tables'];
        this.lookup_tables = tableDict['lookup_tables'];
        this.imported_tables = tableDict['imported_tables'];
    }
}