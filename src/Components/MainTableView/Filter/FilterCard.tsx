import React from 'react';
import RestrictionType from '../enums/RestrictionType'
import Restriction from '../DataStorageClasses/Restriction'
import TableAttribute from '../DataStorageClasses/TableAttribute'
import TableAttributesInfo from '../DataStorageClasses/TableAttributesInfo'
import TableAttributeType from '../enums/TableAttributeType';

import './FilterCard.css'

type FilterCardState = {
  tableAttributes: Array<TableAttribute>,
}

class FilterCard extends React.Component<{index: number, restriction: Restriction, tableAttributesInfo?: TableAttributesInfo, updateRestriction: any}, FilterCardState> {
  constructor(props: any) {
    super(props);

    this.state = {
      tableAttributes: [],
    }

    this.getAttributeNameSelectBlock = this.getAttributeNameSelectBlock.bind(this);
    this.handleAttributeSelection = this.handleAttributeSelection.bind(this);
    this.handleOperatorSelection = this.handleOperatorSelection.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleEnableChange = this.handleEnableChange.bind(this);
  }

  componentDidMount() {
    // Update the tableAttribute list
    let tableAttributes: Array<TableAttribute> = this.props.tableAttributesInfo?.primaryAttributes as Array<TableAttribute>;
    tableAttributes = tableAttributes.concat(this.props.tableAttributesInfo?.secondaryAttributes as Array<TableAttribute>);

    let filterableAttributes = []

    for (let tableAttribute of tableAttributes) {
      if (tableAttribute.attributeType === TableAttributeType.BLOB) {
        continue;
      }
      filterableAttributes.push(tableAttribute);
    }
    this.setState({tableAttributes: filterableAttributes});
    console.log(this.props.restriction)
  }

  handleAttributeSelection(event: any) {
    let restriction = Object.assign({}, this.props.restriction);
    restriction.tableAttribute = this.state.tableAttributes[event.target.value];
    this.props.updateRestriction(this.props.index, restriction);
  }

  handleOperatorSelection(event: any) {
    let restriction = Object.assign({}, this.props.restriction);
    restriction.restrictionType = parseInt(event.target.value);
    this.props.updateRestriction(this.props.index, restriction);
  }

  handleValueChange(attributeName: string, event: any) {
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

  handleEnableChange(event: any) {
    let restriction = Object.assign({}, this.props.restriction);
    restriction.isEnable = event.target.checked;
    this.props.updateRestriction(this.props.index, restriction);
  }

  getAttributeNameSelectBlock() {
    if (this.props.tableAttributesInfo === undefined) {
      return(<div></div>)
    }

    return(
      <select defaultValue='' onChange={this.handleAttributeSelection}>
        <option value='' disabled></option>
        {this.state.tableAttributes.map((tableAttribute, index) => {
          return(<option value={index} key={tableAttribute.attributeName}>{tableAttribute.attributeName}</option>)
        })}
      </select>
    )
  }

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
      </div>
    )
  }
}

export default FilterCard