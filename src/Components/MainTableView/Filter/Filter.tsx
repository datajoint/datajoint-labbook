import React from 'react';
import TableAttributesInfo from '../DataStorageClasses/TableAttributesInfo'
import Restriction from '../DataStorageClasses/Restriction'
import FilterCard from './FilterCard'
import TableAttribute from '../DataStorageClasses/TableAttribute'
import TableAttributeType from '../enums/TableAttributeType';
import './Filter.css'

interface FilterProps {
  tableAttributesInfo?: TableAttributesInfo;
  setRestrictions: (restrictions: Set<Restriction>) => void;
}

interface FilterState {
  restrictionsBuffer: Array<Restriction>; // Array of Restrictions objects
  tableAttributes: Array<TableAttribute>; // List of TableAttributes which is derive from primary_attribute + secondary_attributes
  currentRestrictionIDCount: number; // Used to give a unique ID to each restriction object to allow react to keep track of what is being deleted
  restrictionChangeTimeout: ReturnType<typeof setTimeout>;
}

/**
 * Filter component that is in charge of managing one to many FilterCards as well as the data store beind them
 */
export default class Filter extends React.Component<FilterProps, FilterState> {
  constructor(props: FilterProps) {
    super(props);
    this.state = {
      restrictionsBuffer: [new Restriction(0)],
      tableAttributes: [],
      currentRestrictionIDCount: 1,
      restrictionChangeTimeout: setTimeout(() => {}, 0)
    }
    this.addRestriction = this.addRestriction.bind(this);
    this.updateRestriction = this.updateRestriction.bind(this);
    this.deleteFilterCard = this.deleteFilterCard.bind(this);
  }

  /**
   * Add a restriction with the currentRestrictionIDCount as its ID then increment and update the state
   */
  addRestriction() {
    let restrictions: Array<Restriction> = Object.assign([], this.state.restrictionsBuffer);
    restrictions.push(new Restriction(this.state.currentRestrictionIDCount));
    this.setState({restrictionsBuffer: restrictions, currentRestrictionIDCount: this.state.currentRestrictionIDCount + 1});
  }

  /**
   * 
   * @param index Location of the data in the restriction array to be modified
   * @param restriction The new restriction to replace the old restriction object
   */
  updateRestriction(index: number, restriction: Restriction) {
    let restrictions: Array<Restriction> = Object.assign([], this.state.restrictionsBuffer);
    restrictions[index] = restriction;
    this.setState({restrictionsBuffer: restrictions});
  }

  /**
   * 
   * @param index Location of the restriction object to be deleted
   */
  deleteFilterCard(index: number) {
    let restrictions: Array<Restriction> = Object.assign([], this.state.restrictionsBuffer);
    restrictions.splice(index, 1)
    this.setState({restrictionsBuffer: restrictions});
  }

  /**
   * Handles computing the tableAttributes array given the primary and secondary attributes
   */
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
  }

  /**
   * Upon state change of restrictions, check if any of them are valid, if so then call the fetchTableContent function appropriately
   * @param prevProps 
   * @param prevState 
   */
  componentDidUpdate(prevProps: FilterProps, prevState: FilterState) {
    // If state didn't change then don't do anything
    if (prevState.restrictionsBuffer === this.state.restrictionsBuffer) {
      return;
    }

    // Cancel timer and create a new one
    clearTimeout(this.state.restrictionChangeTimeout);

    const restrictionChangeTimeout = setTimeout(() => {
      // Check if any of the restrictions are valid, if so then send them to TableView fetchTuples
      let validRestrictions: Set<Restriction> = new Set();
      for (let restriction of this.state.restrictionsBuffer) {
        if (restriction.tableAttribute !== undefined && restriction.restrictionType !== undefined && restriction.value !== undefined && restriction.isEnable === true) {

          // Check if it is of date time varient
          if (restriction.tableAttribute.attributeType === TableAttributeType.DATETIME) {
            if (restriction.value[0] === '' || restriction.value[1] === '') {
              // Not completed yet thus break out
              continue;
            }
          }

          // Valid restriction, thus add it to the list
          validRestrictions.add(restriction);
        }
      }

      // Call fetch content if there is at lesat one valid restriction
      if (validRestrictions.size >= 0) {
        this.props.setRestrictions(validRestrictions);
      }
    }, 1000);

    this.setState({restrictionChangeTimeout: restrictionChangeTimeout});
  }

  render() {
    return(
      <div className="filterComponentDiv">
        <h1 className="actionTitle">Filter</h1>
        <div className="filterCardsDiv">
          {this.state.restrictionsBuffer.map((restriction, index) => {
            return(<FilterCard key={restriction.id} index={index} restriction={restriction} tableAttributes={this.state.tableAttributes} updateRestriction={this.updateRestriction} deleteFilterCard={this.deleteFilterCard}></FilterCard>)
          })}
        </div>
        <div className="filterComponentFilterCardAddDiv"><button onClick={this.addRestriction}>+</button></div>
      </div>
    )
  }
}