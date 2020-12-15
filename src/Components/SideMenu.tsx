import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSortAmountDown, faEye, faEyeSlash, faSortAmountUp, faSortAlphaDown, faSortAlphaUp } from '@fortawesome/free-solid-svg-icons'
import './SideMenu.css';

class SideMenu extends React.Component {
  render() {
    return (
      <div className="side-full-menu">
          <ListSchemas />
          <ListTables />
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

class ListTables extends React.Component {
    handleSortTable(value: string) {
        console.log('handling sort table: ', value);
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
                        <div className="sort-field-head"><label>Showing All Part Tables</label></div>
                        <div className="icon-container"><FontAwesomeIcon className="eye-icon" icon={faEyeSlash} /></div>
                    </div>
                </div>
                <div className="table-listing">

                </div>
            </div>
        )
    }
}
export default SideMenu;