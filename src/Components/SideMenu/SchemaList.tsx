import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch, faSortAmountDown} from '@fortawesome/free-solid-svg-icons'

/**
 * SchemaList: list of schema names, by default it assumes the backend returns in alphabetical ascending order
 * selectedSchema: Name of the current selected schema
 */
type SchemaListState = {
  schemaList: Array<string>,
  restrictiedSchemaList: Array<string>,
  searchString: string,
  selectedSchemaIndex: number
}

class SchemaList extends React.Component<{token: string, currentlySelectedSchema: string, handleSchemaSelection: (schemaName: string) => void}, SchemaListState> {
  constructor(props: any) {
    super(props);
    this.state = {
      schemaList: [],
      restrictiedSchemaList: [],
      searchString: '',
      selectedSchemaIndex: -1
    }

    this.flipSchemaOrder = this.flipSchemaOrder.bind(this);
    this.handleSchemaSelection = this.handleSchemaSelection.bind(this);
    this.handleSearchStringChange = this.handleSearchStringChange.bind(this);
  }

  /**
   * Upon being mounted query the backend for list of schemas that is avaliable on the database
   */
  componentDidMount() {
    fetch(`${process.env.REACT_APP_DJLABBOOK_BACKEND_PREFIX}/list_schemas`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token }
    })
      .then(result => result.json())
      .then(result => {
        this.setState({schemaList: result.schemaNames, restrictiedSchemaList: result.schemaNames});
      })
      .catch(error => {
        console.error('Error: ', error);
      })
  }

  /**
   * Due to the assumtion that schemaList is initally in alphabetical ascending order and that there is only two option to sort
   * the list that is ascending and decensding with ascending by default, we can take advantage by this by just simply fliping the list when
   * the user change between the two sort mode. We also need to change the selected schema index accordingly which is simply just lengtOfArray - currentIndex - 1
   */
  flipSchemaOrder() {
    this.setState({
      restrictiedSchemaList: this.state.restrictiedSchemaList.reverse(),
      selectedSchemaIndex: this.state.restrictiedSchemaList.length - this.state.selectedSchemaIndex - 1
    });
  }

  /**
   * Function to handle schema selection from the user
   * 
   * @param schemaIndex Index of the selected schema
   */
  handleSchemaSelection(schemaIndex: number) {
    // Check if the schema is already selected, if so do nothing
    if (this.state.restrictiedSchemaList[schemaIndex] !== this.props.currentlySelectedSchema) {
      // Schema selected was different thus we need to udpate the selected schema index and call the parent handleSchemaSelection with the name
      this.setState({selectedSchemaIndex: schemaIndex});
      this.props.handleSchemaSelection(this.state.restrictiedSchemaList[schemaIndex]);
    }
  }

  handleSearchStringChange(event: any) {
    // Filter our the results based on the search string, assuming it is not empty
    let restrictiedSchemaList = [];

    if (event.target.value !== '') {
      for (let schemaName of this.state.schemaList) {
        if (schemaName.toLocaleLowerCase().includes(event.target.value.toLocaleLowerCase())) {
          restrictiedSchemaList.push(schemaName);
        }
      }

      this.setState({searchString: event.target, restrictiedSchemaList: restrictiedSchemaList});
    }
    else {
      this.setState({restrictiedSchemaList: this.state.schemaList});
    }
  }

  render() {
    return (
      <div className="schema-menu">
        <div className="search-schema-field">
          <input type="text" onChange={this.handleSearchStringChange} placeholder="Search Schema"/>
          <FontAwesomeIcon className="search-icon" icon={faSearch}/>
        </div>
        <div className="sort-schema-field">
          <div className="sort-field-head"><FontAwesomeIcon className="sort-icon" icon={faSortAmountDown} /><label>Sort<br />Schema</label></div>
          <select className="sort-schema-options" onChange={() => this.flipSchemaOrder()}>
            <option value="az">Alphabetical (A-Z)</option>
            <option value="za">Alphabetical (Z-A)</option>
          </select>
        </div>
        <div className="schema-listing">
          {this.state.restrictiedSchemaList.map((schema: string, schemaIndex: number) => {
            return (
              <div className={this.state.selectedSchemaIndex === schemaIndex ? 'schema-name selected' : 'schema-name'} key={schemaIndex} onClick={() => this.handleSchemaSelection(schemaIndex)} >{schema}</div>
            )
          })}
        </div>
      </div>
    )
  }
}

export default SchemaList