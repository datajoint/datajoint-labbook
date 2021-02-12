import React from 'react';
import RestrictionType from '../enums/RestrictionType'
import Restriction from '../DataStorageClasses/Restriction'
import TableAttribute from '../DataStorageClasses/TableAttribute'
import TableAttributesInfo from '../DataStorageClasses/TableAttributesInfo'

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
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    // Update the tableAttribute list
    let tableAttributes: Array<TableAttribute> = this.props.tableAttributesInfo?.primaryAttributes as Array<TableAttribute>;
    tableAttributes = tableAttributes.concat(this.props.tableAttributesInfo?.secondaryAttributes as Array<TableAttribute>);

    this.setState({tableAttributes: tableAttributes});
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

  handleChange(attributeName: string, event: any) {
    let restriction = Object.assign({}, this.props.restriction);
    restriction.value = event.target.value;
    this.props.updateRestriction(this.props.index, restriction)
  }

  getAttributeNameSelectBlock() {
    if (this.props.tableAttributesInfo === undefined) {
      return(<div></div>)
    }

    return(
      <select defaultValue='' onChange={this.handleAttributeSelection}>
        <option value='' disabled></option>
        {this.state.tableAttributes.map((tableAttribute, index) => {
          return(<option value={index}>{tableAttribute.attributeName}</option>)
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
    if (this.props.restriction.tableAttribute === undefined) {
      return(<input disabled></input>);
    }
    // Get the input block by using the tableAttribute helper funcition
    return (TableAttribute.getAttributeInputBlock(this.props.restriction.tableAttribute, this.props.restriction.value, undefined, this.handleChange))
  }

  render() {
    return(
      <div>
        <form>
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