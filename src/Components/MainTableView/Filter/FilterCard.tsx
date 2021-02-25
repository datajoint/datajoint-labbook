import React from 'react';
import RestrictionType from '../enums/RestrictionType'
import Restriction from '../DataStorageClasses/Restriction'
import TableAttribute from '../DataStorageClasses/TableAttribute'
import TableAttributeType from '../enums/TableAttributeType';

import './FilterCard.css'

type FilterCardState = {
}

/**
 * Component to handle creation of the input forms require for each restriction
 */
class FilterCard extends React.Component<{index: number, restriction: Restriction, tableAttributes: Array<TableAttribute>, updateRestriction: any, deleteFilterCard: any}, FilterCardState> {
  constructor(props: any) {
    super(props);

    this.getAttributeNameSelectBlock = this.getAttributeNameSelectBlock.bind(this);
    this.handleAttributeSelection = this.handleAttributeSelection.bind(this);
    this.handleOperatorSelection = this.handleOperatorSelection.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleEnableChange = this.handleEnableChange.bind(this);
  }

  /**
   * Handle attribute selection by making a copy of the restriction object, updating it, then send it to parent updateRestriction method
   * @param event 
   */
  handleAttributeSelection(event: any) {
    let restriction = Object.assign({}, this.props.restriction);
    restriction.tableAttribute = this.props.tableAttributes[event.target.value];
    this.props.updateRestriction(this.props.index, restriction);
  }

  /**
   * Handle operator selection by making a copy of the restriction object, updating it, then send it to parent updateRestriction method
   * @param event 
   */
  handleOperatorSelection(event: any) {
    let restriction = Object.assign({}, this.props.restriction);
    restriction.restrictionType = parseInt(event.target.value);
    this.props.updateRestriction(this.props.index, restriction);
  }

  /**
   * Handle value of input field by making a copy of the restriction object, updating it, then send it to parent updateRestriction method
   * NOTE: This should be passed into TableAttribute getInputField static function which use this as a call back
   * @param attributeName
   * @param event 
   */
  handleValueChange(event: any, attributeName: string) {
    let restriction = Object.assign({}, this.props.restriction);
    
    // Handle speical case with DateTime
    if (restriction.tableAttribute?.attributeType === TableAttributeType.DATETIME) {
      // Defined the value attribute if it is undefined as an array
      if (restriction.value === undefined) {
        restriction.value = ['', ''];
      }

      // Figure out if it is date or time and put it in the value as ['date', 'time']
      const subComponentName = attributeName.substr(attributeName.length - 6)

      if (subComponentName === '__date') {
        restriction.value[0] = event.target.value;
      }
      else if (subComponentName === '__time') {
        restriction.value[1] = event.target.value;
      }
      else {
        throw Error('Unknown Component for date time attribute')
      }
    }
    else {
      restriction.value = event.target.value;
    }
    
    this.props.updateRestriction(this.props.index, restriction)
  }

  /**
   * Deals with the user wanting to enable or disable a restriction, same logic as a attribute selection and so on
   * @param event 
   */
  handleEnableChange(event: any) {
    let restriction = Object.assign({}, this.props.restriction);
    restriction.isEnable = event.target.checked;
    this.props.updateRestriction(this.props.index, restriction);
  }

  /**
   * Helper function for getting the select block for all avaliable attributes for restriction
   */
  getAttributeNameSelectBlock() {
    return(
      <select defaultValue='' onChange={this.handleAttributeSelection}>
        <option value='' disabled></option>
        {this.props.tableAttributes.map((tableAttribute, index) => {
          return(<option value={index} key={tableAttribute.attributeName}>{tableAttribute.attributeName}</option>)
        })}
      </select>
    )
  }

  /**
   * Helper function for getting the operator selection block
   */
  getOperatorSelectBlock() {
    return(
      <select defaultValue='' onChange={this.handleOperatorSelection}>
        <option value='' disabled></option>
        <option value={RestrictionType.EQUAL}>=</option>
        <option value={RestrictionType.NOT_EQUAL}>!=</option>
        <option value={RestrictionType.LESS_THAN}>&lt;</option>
        <option value={RestrictionType.LESS_THAN_AND_EQUAL_TO}>&lt;=</option>
        <option value={RestrictionType.GREATER_THAN}>&gt;</option>
        <option value={RestrictionType.GREATER_THAN_AND_EQUAL_TO}>&gt;=</option>
      </select>
    )
  }

  /**
   * Helper function for getting the input block by taking advantage of TableAttribute.getAttributeInputBlock
   */
  getInputBlock() {
    // Check if tableAttribute is undefined, if so return disable input
    if (this.props.restriction.tableAttribute === undefined || this.props.restriction.restrictionType === undefined) {
      return(<input disabled></input>);
    }
    // Get the input block by using the tableAttribute helper funcition
    return (TableAttribute.getAttributeInputBlock(this.props.restriction.tableAttribute, this.props.restriction.value, undefined, this.handleValueChange))
  }

  render() {
    return(
      <div className="filterCardDiv">
        <form className="filterCardForm">
          <input type="checkbox" checked={this.props.restriction.isEnable} onChange={this.handleEnableChange}></input>
          <label>Attribute Name</label>
          {this.getAttributeNameSelectBlock()}
          <label>Operator</label>
          {this.getOperatorSelectBlock()}
          <label>Value</label>
          {this.getInputBlock()}
        </form>
        <button className="filterCardDeleteButton" type="button" onClick={() => this.props.deleteFilterCard(this.props.index)}>Delete</button>
      </div>
    )
  }
}

export default FilterCard