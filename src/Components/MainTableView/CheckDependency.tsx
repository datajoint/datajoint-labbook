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

class CheckDependency extends React.Component<{token: string, selectedSchemaName: string, selectedTableName: string, tableAttributesInfo: TableAttributesInfo, tupleToCheckDependency?: any, clearList: boolean, dependenciesReady: any, allAccessible: any}, checkDependencyState> {
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
    // let processedEntry = entry[0]?.primaryEntries // TODO: make sure deleteTuple component only gets one entry staged for deletion to begin with
    // console.log('processedEntry: ', processedEntry);
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
        // Check if attribute exists, if not break
        if (!processedEntry.hasOwnProperty(tableAttribute.attributeName)) {
          break;
        }

        // Covert date to UTC
        let date = new Date(processedEntry[tableAttribute.attributeName])
        processedEntry[tableAttribute.attributeName] = date.getUTCFullYear() + ':' + date.getUTCMonth() + ':' + date.getUTCDay()
      }
      else if (tableAttribute.attributeType === TableAttributeType.DATETIME || tableAttribute.attributeType === TableAttributeType.TIMESTAMP) {
        // Check if attribute exists, if not break
        if (!processedEntry.hasOwnProperty(tableAttribute.attributeName + '__date') && !processedEntry.hasOwnProperty(tableAttribute.attributeName + 'time')) {
          break;
        }

        // Covert date time to UTC
        let date = new Date(processedEntry[tableAttribute.attributeName + '__date'] + 'T' + processedEntry[tableAttribute.attributeName + '__time']);

        // Delete extra fields from tuple
        delete processedEntry[tableAttribute.attributeName + '__date'];
        delete processedEntry[tableAttribute.attributeName + '__time'];

        // Construct the insert string 
        processedEntry[tableAttribute.attributeName] = date.getUTCFullYear() + ':' + date.getUTCMonth() + ':' + date.getUTCDay() + ' ' + date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCMinutes();
      }
    }

    fetch(`/api/record/dependency?schemaName=${this.props.selectedSchemaName}&tableName=${this.props.selectedTableName}&restriction=${Buffer.from(JSON.stringify(processedEntry)).toString('base64')}`, 
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token },
      // body: JSON.stringify({schemaName: this.props.selectedSchemaName, tableName: this.props.selectedTableName, restriction: processedEntry})
    })
      .then(result => {
        // Check for error mesage 500, if so throw error, but for now, send back dummy
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