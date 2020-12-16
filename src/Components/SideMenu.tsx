import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSortAmountDown, faEye, faEyeSlash, faSortAmountUp, faSortAlphaDown, faSortAlphaUp } from '@fortawesome/free-solid-svg-icons'
import './SideMenu.css';

class SideMenu extends React.Component {
  render() {
    return (
      <div className="side-full-menu">
          <ListSchemas />
          <ListTables focusSchema=''/>
      </div>

    )
  }
}


class ListSchemas extends React.Component {
    componentDidMount() {
        fetch('/api/list_schemas', {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        })
            .then(result => result.json())
            .then(result => {
                console.log('schema: ', result)

            })
            .catch((error) => {
                console.log('Problem fetching schema list');
                console.error('Error: ', error);
            })
    }

    handleSortSchema(value: string) {
        console.log('handling sort schema. Sort by: ', value)
        
    }

    
    render() {
        return (
            <div className="schema-menu">
                <div className="search-schema-field">
                    <input type="text" placeholder="Search Schema"/>
                    <FontAwesomeIcon className="search-icon" icon={faSearch} />
                </div>
                <div className="sort-schema-field">
                    <div className="sort-field-head"><FontAwesomeIcon className="sort-icon" icon={faSortAmountDown} /><label>Sort<br />Schema</label></div>
                    <select className="sort-schema-options" onChange={(e)=>this.handleSortSchema(e.target.value)}>
                        <option value="az">Alphabetical (A-Z)</option>
                        <option value="za">Alphabetical (Z-A)</option>
                        {/* <option value="tb">Topological (top-bottom)</option> */}
                        {/* <option value="bt">Topological (bottom-top)</option> */}
                    </select>
                </div>
                <div className="schema-listing">

                </div>
            </div>
        )
    }
}

type DJGUITableMenuState = {
    viewAllPartTables: boolean;
}
class ListTables extends React.Component<{focusSchema: string}, DJGUITableMenuState> {
    constructor(props: any) {
        super(props);
        this.state = {
            viewAllPartTables: true
        }
    }
    handleSortTable(value: string) {
        console.log('handling sort table: ', value);
    }
    toggleAllPartTableView() {
        console.log('current view all part table state', this.state.viewAllPartTables)
        this.setState({viewAllPartTables : !this.state.viewAllPartTables})
    }
    render() {
        return (
            <div className="table-menu">
                <div className="table-view-controls">
                    <div className="sort-table-field">
                        <div className="sort-field-head">
                            <FontAwesomeIcon className="sort-icon" icon={faSortAmountDown} />
                            <label>Sort<br />Table</label>
                        </div>
                        <select className="sort-table-options" onChange={(e)=>this.handleSortTable(e.target.value)}>
                            <option value="tier">Tier</option>
                            <option value="az">Alphabetical (A-Z)</option>
                            <option value="za">Alphabetical (Z-A)</option>
                            <option value="tb">Topological (top-bottom)</option>
                            <option value="bt">Topological (bottom-top)</option>
                        </select>
                    </div>
                    <div className="view-all-part-tables">
                        <div className="sort-field-head">
                            <label>{this.state.viewAllPartTables ? 'Showing': 'Hiding'} All Part Tables</label>
                        </div>
                        <div className="icon-container" onClick={()=>this.toggleAllPartTableView()}>
                            {this.state.viewAllPartTables ? 
                            <FontAwesomeIcon className="eye-icon" icon={faEyeSlash} />
                            : <FontAwesomeIcon className="eye-icon" icon={faEye} />}
                            
                        </div>
                    </div>
                </div>
                <div className="table-listing">

                </div>
            </div>
        )
    }
}
export default SideMenu;