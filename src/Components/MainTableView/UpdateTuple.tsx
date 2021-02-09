import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faRedoAlt} from '@fortawesome/free-solid-svg-icons'
import TableAttribute from './DataStorageClasses/TableAttribute';
import TableAttributesInfo from './DataStorageClasses/TableAttributesInfo';
import PrimaryTableAttribute from './DataStorageClasses/PrimaryTableAttribute';
import TableAttributeType from './enums/TableAttributeType';
import './UpdateTuple.css'
import SecondaryTableAttribute from './DataStorageClasses/SecondaryTableAttribute';


type updateTupleState = {
  tupleBuffer: any // Object to stored the values typed in by the user
  errorMessage: string // Error message string for failed inserts
}

class UpdateTuple extends React.Component<{token: string, selectedSchemaName:string, selectedTableName: string, tableAttributesInfo?: TableAttributesInfo, fetchTableContent: any, tuplesToUpdate?: any,}, updateTupleState> {

  render() {
    return (
      <div className="updateActionContainer">
        Test Setup
      </div>
    )
  }
}

export default UpdateTuple;