import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheckCircle, faStopCircle} from '@fortawesome/free-solid-svg-icons'
import "./CheckDependency.css";

import TableAttribute from './DataStorageClasses/TableAttribute';
import TableAttributesInfo from './DataStorageClasses/TableAttributesInfo';
import TableAttributeType from './enums/TableAttributeType';


/**
 * list of allowed states on this check dependency component
 */
type checkDependencyState = {
  dependencies: Array<any>, // list of dependencies fetched from API
  checkDependencyStatusMessage: string, // for GUI to show
  isGettingDependencies: boolean, // for loading animation status
}

class CheckDependency extends React.Component<{token: string, selectedSchemaName: string, selectedTableName: string, tableAttributesInfo?: TableAttributesInfo, tupleToCheckDependency?: any, clearList: boolean, dependenciesReady: any, allAccessible: any}, checkDependencyState> {
  constructor(props: any) {
    super(props);
    this.state = {
      dependencies: [],
      checkDependencyStatusMessage: '',
      isGettingDependencies: false,
    }
  }

  /**
   * Checks whether parent component asked to clear the list of dependencies
   * @param prevProps 
   * @param prevState 
   */
  componentDidUpdate(prevProps: any, prevState: any) {
    if (prevProps.clearList !== this.props.clearList && this.props.clearList) {
      this.setState({dependencies: []})
    }
  }

  /**
   * Function to check table dependencies for the selected table entry
   * @param entry
   */
  getDependencies(entry: any) {
    // set status true for isGettingDependencies, switch to false once api responds
    this.setState({isGettingDependencies: true})

    // Check that tableAttirbutesInfo is not undefined
    if (this.props.tableAttributesInfo === undefined) {
      return;
    }

    // Copy the current state of processedEntry for processing for submission
    let processedEntry = Object.assign({}, entry[0]?.primaryEntries);

    // Loop through and deal with date, datetime, and timestamp formats
    let tableAttributes: Array<TableAttribute> = this.props.tableAttributesInfo?.primaryAttributes as Array<TableAttribute>;
    for (let tableAttribute of tableAttributes) {
      if (tableAttribute.attributeType === TableAttributeType.DATE) {
        // Convert date to DJ date format
        processedEntry[tableAttribute.attributeName] = TableAttribute.parseDateToDJFormat(processedEntry[tableAttribute.attributeName])
      }
      else if (tableAttribute.attributeType === TableAttributeType.DATETIME || tableAttribute.attributeType === TableAttributeType.TIMESTAMP) {
        // Convert to DJ friendly datetime format
        processedEntry[tableAttribute.attributeName] = TableAttribute.parseDateTimeToDJFormat(processedEntry[tableAttribute.attributeName])
      }
    }

    fetch(`/api/record/dependency?schemaName=${this.props.selectedSchemaName}&tableName=${this.props.selectedTableName}&restriction=${encodeURIComponent(btoa(JSON.stringify(processedEntry)))}`, 
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token },
    })
      .then(result => {
        // Check for error message 500, if so throw and display error, stop loading animation
        if (result.status === 500) {
          result.text().then(errorMessage => {
            throw new Error(errorMessage)
          }).catch(error => {
            this.setState({checkDependencyStatusMessage: error.message, isGettingDependencies: false})
            return
          })
        }
        
        // set check status to done
        this.setState({isGettingDependencies: false})

        return result.json()
      })
      .then(result => {
        let accessibleValidation: Array<boolean> = []
        result.dependencies.forEach((dependency: any) => {
          accessibleValidation.push(dependency.accessible)
        })
        this.setState({dependencies: result.dependencies});

        this.props.dependenciesReady(result.dependencies);
        this.props.allAccessible(accessibleValidation.every(Boolean));
      })
      .catch((error) => {
        this.setState({dependencies: [], checkDependencyStatusMessage: error.message});
      })
  }

  clearDependencies() {
    this.setState({dependencies: []})
  }

  render() {
    return(
    <div className="checkDependencyContainer">
      {/* TODO: replace with proper animation */}
      {this.state.isGettingDependencies ? <p>Checking dependency...(imagine a wheel turning)...</p>: '' }
      {Object.entries(this.state.dependencies).length === 0 ? 
      (<button className="checkDependencies" onClick={(event) => {event.preventDefault(); this.getDependencies(Object.values(this.props.tupleToCheckDependency))}}>Check Dependencies</button>)
      : (<div className="dependencies">
          <h5 className="depedencyWarning">Manipulating this entry will affect the following tables: </h5>
          <ul className="dependencyList">
          {this.state.dependencies.map((item: any) => {
            return (
              <li className="dependencyItem" key={item?.schema+item?.table}>
                {item?.accessible ? <FontAwesomeIcon className="icon accessible" icon={faCheckCircle} /> : <FontAwesomeIcon className="icon inaccessible" icon={faStopCircle} />}
                [{item?.schema}] {item?.table} / {item?.count} {item?.count > 1 ? 'entries': 'entry'}
              </li>
            )
          })}
          </ul>
          {this.state.checkDependencyStatusMessage ? (
            <div className="errorMessage">{this.state.checkDependencyStatusMessage}<button className="dismiss" onClick={() => this.setState({checkDependencyStatusMessage: ''})}>dismiss</button></div>
          ): ''}
        </div>)}
    </div>
    )
  }
}
  
export default CheckDependency;