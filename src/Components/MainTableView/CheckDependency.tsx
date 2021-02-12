import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheckCircle, faStopCircle} from '@fortawesome/free-solid-svg-icons'
import "./CheckDependency.css";

/**
 * list of allowed states on this check dependency component
 */
type checkDependencyState = {
  dependencies: Array<any>, // list of dependencies fetched from API
  checkDependencyStatusMessage: string, // for GUI to show
  isGettingDependencies: boolean, // for loading animation status
}

class CheckDependency extends React.Component<{token: string, selectedSchemaName: string, selectedTableName: string, tupleToCheckDependency?: any, clearList: boolean, dependenciesReady: any, allAccessible: any}, checkDependencyState> {
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
    let processedEntry = entry[0]?.primaryEntries // TODO: make sure deleteTuple component only gets one entry staged for deletion to begin with

    // set status true for isGettingDependencies, switch to false once api responds
    this.setState({isGettingDependencies: true})

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