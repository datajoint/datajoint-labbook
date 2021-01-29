import { table } from 'console';
import React from 'react';

type deleteTupleState = {
  dependencies: any,
  deleteStatusMessage: string,
  checkingDependency: boolean,
  deletingEntry: boolean
}

class DeleteTuple extends React.Component<{stagedEntry?: any, tableName: string, schemaName: string, token: string}, deleteTupleState> {
  constructor(props: any) {
    super(props);
    this.state = {
      dependencies: undefined,
      deleteStatusMessage: '',
      checkingDependency: false,
      deletingEntry: false
    }
  }

  /**
   * Function to check table dependencies for the selected entry, fake API for now
   * 
   */
  handleDependencyCheck(entry: any) {
    // console.log('handling dependency: ', entry)
    let processedEntry = entry[0]?.primaryEntries // TODO: make sure deleteTuple component only gets one entry staged for deletion to begin with

    // set status true for checkingDependency, switch to false once api responds
    this.setState({checkingDependency: true})

    // TODO: Run api fetch for list of dependencies/permission
    fetch('/api/check_dependencies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token },
      body: JSON.stringify({schemaName: this.props.schemaName, tableName: this.props.tableName, tuple: processedEntry})
    })
      .then(result => {
        // Check for error mesage 500, if so throw error, but for now, send back dummy
        if (result.status === 500) {
          // throw new Error(result.statusText);
        }
        
        // set check status to done
        this.setState({checkingDependency: false})

        // return dummy result;
        return [{name: 'schema.someTable', entryCount: 39}, {name: 'schema.anotherTable', entryCount: 12}]
      })
      .then(result => {
        // console.log('received fake result: ', result)
        this.setState({dependencies: result});
      })
      .catch((error) => {
        console.error('Error: ', error);
        this.setState({dependencies: undefined});
      })
  }

  /**
   * Function to delete the selected entry after user is presented with potential dependencies and confirms
   * 
   */
  handleTupleDeletion(entry: any) {
    let processedEntry = entry[0]?.primaryEntries // TODO: again, assuming component is only assuming 1 staged entry

    // set status true for deleting entry, switch to false once api responds
    this.setState({deletingEntry: true})

    // TODO: Run api fetch for list of dependencies/permission
    fetch('/api/delete_tuple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token },
      body: JSON.stringify({schemaName: this.props.schemaName, tableName: this.props.tableName, restrictionTuple: processedEntry})
    })
      .then(result => {
        // set deleting status to done
        this.setState({deletingEntry: false, dependencies: undefined})

        // Check for error mesage 500, if so throw error - shouldn't happen as often once real dependency check is in place
        if (result.status === 500) {
          throw Error(`${result.status} - ${result.statusText}`)
        }
        
        // return result - expecting a Delete Succesful string
        return result.text()
      })
      .then(result => {
        this.setState({deleteStatusMessage: result});
      })
      .catch(error => {
        console.error(error);
        this.setState({deleteStatusMessage: error.message});
      })
  }

  closeMessage() {
    this.setState({deleteStatusMessage: ''})
  }

  render() {
    return(
      <div className="deleteWorkZone">
        <div className="stagedEntryCheck">
          <p>Delete this entry?</p>
          {Object.values(this.props.stagedEntry).map((entry: any) => {
            return (
              <div>
                {/* <p>{JSON.stringify(entry)}</p> */}
                <table className="stagedEntry">
                  <thead>
                    <tr>
                    {Object.keys(entry?.primaryEntries).map((primaries: any) => {
                      return (<th className="primaryKey">{primaries}</th>)
                    })}
                    {Object.keys(entry?.secondaryEntries).map((secondaries: any) => {
                      return (<th className="secondaryKey">{secondaries}</th>)
                    })}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                    {Object.values(entry?.primaryEntries).map((primaries: any) => {
                      return (<td className="primaryEntry">{primaries}</td>)
                    })}
                    {Object.values(entry?.secondaryEntries).map((secondaries: any) => {
                      return (<td className="secondaryEntry">{secondaries}</td>)
                    })}
                    </tr>
                  </tbody>
                </table>
              </div>
            )
          })}
          {this.state.dependencies ? '' :
          <button className="checkDependencies" onClick={() => this.handleDependencyCheck(Object.values(this.props.stagedEntry))}>Check Dependencies</button>
          }

          {this.state.checkingDependency ? <p>Checking dependency...(imagine a wheel turning)...</p>: '' }
          
        </div>
        {this.state.dependencies ? (
          <div className="dependencies">
            <h5 className="depedencyWarning">Deleting this entry will affect the following (dummy): </h5>
            <ul>
            {this.state.dependencies.map((item: any) => {
              return (<li key={item?.name}>{item?.name} / {item?.entryCount} entries</li>)
            })}
            </ul>
            <p>Are you sure you want to delete this entry?</p>
            <button className="confirmDelete" onClick={() => this.handleTupleDeletion(Object.values(this.props.stagedEntry))}>Confirm Delete</button>
          </div>
        ) : ''}
        {this.state.deletingEntry ? <p>Deleting entry might take a while...(replace with wheel)</p>: '' }
        {this.state.deleteStatusMessage ? (
          <div>{this.state.deleteStatusMessage}<span><button onClick={() => this.closeMessage()}>dismiss</button></span></div>
        ) : ''}
        
      
      </div>
    )
  }
  
}

export default DeleteTuple;