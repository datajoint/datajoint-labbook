import React from 'react';
import TableAttributesInfo from '../DataStorageClasses/TableAttributesInfo'
import Restriction from '../DataStorageClasses/Restriction'
import FilterCard from './FilterCard'

type FilterState = {
  restrictions: Array<Restriction>,
}

class Filter extends React.Component<{tableAttributesInfo?: TableAttributesInfo, fetchTableContent: any}, FilterState> {
  constructor(props: any) {
    super(props);
    this.state = {
      restrictions: [],
    }
    this.addRestriction = this.addRestriction.bind(this);
    this.updateRestriction = this.updateRestriction.bind(this);
  }

  addRestriction() {
    let restrictions: Array<Restriction> = Object.assign([], this.state.restrictions);
    restrictions.push(new Restriction());
    this.setState({restrictions: restrictions});
  }

  updateRestriction(index: number, restriction: Restriction) {
    let restrictions: Array<Restriction> = Object.assign([], this.state.restrictions);
    restrictions[index] = restriction;
    this.setState({restrictions: restrictions})
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    // If state didn't change then don't do anything
    if (prevState == this.state) {
      return;
    }

    // Check if any of the restrictions are valid, if so then send them to TableView fetchTuples
    let validRestrictions: Array<Restriction> = []
    for (let restriction of this.state.restrictions) {
      if (restriction.tableAttribute !== undefined && restriction.restrictionType !== undefined && restriction.value !== undefined) {
        // Valid restriction, thus add it to the list
        validRestrictions.push(restriction);
      }
    }

    // Call fetch content if there is at lesat one valid restriction
    if (validRestrictions.length >= 0) {
      this.props.fetchTableContent(validRestrictions);
    }
  }

  render() {
    return(
      <div>
        <div>Filter Component</div>
        <button onClick={this.addRestriction}>+</button>
        <div>
          {this.state.restrictions.map((restriction, index) => {
            return(<FilterCard index={index} restriction={restriction} tableAttributesInfo={this.props.tableAttributesInfo} updateRestriction={this.updateRestriction}></FilterCard>)
          })}
        </div>
      </div>
    )
  }
}

export default Filter