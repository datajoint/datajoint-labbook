import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheckCircle, faStopCircle} from '@fortawesome/free-solid-svg-icons'
import "./CheckDependency.css";

/**
 * list of allowed states on this check dependency component
 */
type checkDependencyState = {
  dependencies: any, // list of dependencies fetched from API
  checkDependencyStatusMessage: string, // for GUI to show
  isGettingDependencies: boolean, // for loading animation status
}

class CheckDependency extends React.Component<{token: string, selectedSchemaName: string, selectedTableName: string, tupleToCheckDependency?: any, confirmAction: any}, checkDependencyState> {
  constructor(props: any) {
    super(props);
    this.state = {
      dependencies: undefined,
      checkDependencyStatusMessage: '',
      isGettingDependencies: false,
    }
  }

  /**
   * Function to check table dependencies for the selected table entry
   * @param entry
   */
  getDependencies(entry: any) {
    console.log("entry[0]: ", entry[0])
    let processedEntry = entry[0]?.primaryEntries // TODO: make sure deleteTuple component only gets one entry staged for deletion to begin with

    // set status true for isGettingDependencies, switch to false once api responds
    this.setState({isGettingDependencies: true})

    // TODO: Run api fetch for list of dependencies/permission
    console.log('token: ', this.props.token)
    console.log('print base64: ', Buffer.from(JSON.stringify(processedEntry)).toString('base64'))
    fetch(`/api/record/dependency?schema_name=${this.props.selectedSchemaName}&table_name=${this.props.selectedTableName}&restriction=${Buffer.from(JSON.stringify(processedEntry)).toString('base64')}`, 
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token },
      // body: JSON.stringify({schemaName: this.props.selectedSchemaName, tableName: this.props.selectedTableName, restriction: processedEntry})
    })
      .then(result => {
        console.log("result: ", result)
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
        console.log('received result: ', result.dependencies)
        this.setState({dependencies: result.dependencies});
      })
      .catch((error) => {
        console.error(error.message);
        this.setState({dependencies: undefined});
      })
  
  }
  
  render() {
    return(
    <div className="checkDependencyContainer">
      {/* TODO: replace with proper animation */}
      {this.state.isGettingDependencies ? <p>Checking dependency...(imagine a wheel turning)...</p>: '' }
      {!this.state.dependencies ? 
      <button className="checkDependencies" onClick={() => this.getDependencies(Object.values(this.props.tupleToCheckDependency))}>Check Dependencies</button>
      : (<div className="dependencies">
          <h5 className="depedencyWarning">Deleting this entry will affect the following tables: </h5>
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
          <p>Are you sure you want to delete this entry?</p>
          <div className="actionButtons">
            <button className="confirmAction" onClick={() => this.props.confirmAction()}>Confirm</button>
            <button className="cancelAction" onClick={() => this.setState({dependencies: undefined})}>Cancel</button>
          </div>
          {this.state.checkDependencyStatusMessage ? (
            <div className="errorMessage">{this.state.checkDependencyStatusMessage}<button className="dismiss" onClick={() => this.setState({checkDependencyStatusMessage: ''})}>dismiss</button></div>
          ): ''}
        </div>)}
    </div>
    )
  }
}
  
export default CheckDependency;