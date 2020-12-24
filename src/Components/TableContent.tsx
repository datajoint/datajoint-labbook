import React from 'react';
import './TableContent.css'

class TableContent extends React.Component<{contentData: Array<any>, tableName: string, tableType: string}> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className="table-content-viewer">
                <div className={this.props.tableType==='computed' ? 'content-view-header computed ': this.props.tableType==='imported' ? 'content-view-header imported': this.props.tableType==='lookup' ? 'content-view-header lookup': this.props.tableType==='manual' ? 'content-view-header manual': 'content-view-header part'}>
                    <div className={this.props.tableType==='computed' ? 'computed table-type-tag': this.props.tableType==='imported' ? 'imported table-type-tag': this.props.tableType==='lookup' ? 'lookup table-type-tag': this.props.tableType==='manual' ? 'manual table-type-tag': 'part table-type-tag'}>{this.props.tableType}</div>
                    <h4 className="table-name">{this.props.tableName}</h4>
                    <div className="content-controllers">
                        <button>Filter</button>
                        <button>Insert</button>
                        <button>Update</button>
                        <button>Delete</button>
                    </div>
                </div>
                <div className="edit-zone">Content Edit Zone</div>
                <div className="content-view-area">

                </div>
                <div className="paginator">
                    <p>Total Rows: {this.props.contentData.length}</p>
                </div>
                
                {/* {this.props.contentData.map((tableEntry:any) => {
                    return (
                        <div>{tableEntry}</div>
                    )
                })} */}

            </div>
        ) 
    }
}

export default TableContent;