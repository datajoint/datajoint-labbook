import React from 'react';

type deleteTupleState = {
  dependencies: any,
  deleteStatusMessage: string,
  isGettingDependencies: boolean,
  isDeletingEntry: boolean
}

class DeleteTuple extends React.Component<{token: string, selectedSchemaName: string, selectedTableName: string, tupleToDelete?: any, fetchTableContent: any, clearStage: any}, deleteTupleState> {
  constructor(props: any) {
    super(props);
    this.state = {
      dependencies: undefined,
      deleteStatusMessage: '',
      isGettingDependencies: false,
      isDeletingEntry: false
    }
  }

  /**
   * Function to check table dependencies for the selected table entry, fake API for now
   * @param entry
   */
  getDependencies(entry: any) {
    // console.log('handling dependency: ', entry)
    let processedEntry = entry[0]?.primaryEntries // TODO: make sure deleteTuple component only gets one entry staged for deletion to begin with

    // set status true for isGettingDependencies, switch to false once api responds
    this.setState({isGettingDependencies: true})

    // TODO: Run api fetch for list of dependencies/permission
    fetch('/api/check_dependencies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token },
      body: JSON.stringify({schemaName: this.props.selectedSchemaName, tableName: this.props.selectedTableName, tuple: processedEntry})
    })
      .then(result => {
        // Check for error mesage 500, if so throw error, but for now, send back dummy
        if (result.status === 500) {
          // throw new Error(result.statusText);
        }
        
        // set check status to done
        this.setState({isGettingDependencies: false})

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
   * Function to delete the selected table entry after user is presented with potential dependencies and confirms
   * @param entry
   */
  handleTupleDeletion(entry: any) {
    let processedEntry = entry[0]?.primaryEntries // TODO: again, assuming component is only assuming 1 staged entry

    // set status true for deleting entry, switch to false once api responds
    this.setState({isDeletingEntry: true})

    // TODO: Run api fetch for list of dependencies/permission
    fetch('/api/delete_tuple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token },
      body: JSON.stringify({schemaName: this.props.selectedSchemaName, tableName: this.props.selectedTableName, restrictionTuple: processedEntry})
    })
      .then(result => {
        // set deleting status to done
        this.setState({isDeletingEntry: false, dependencies: undefined})

        // Check for error mesage 500, if so throw error - shouldn't happen as often once real dependency check is in place
        if (result.status === 500) {
          throw Error(`${result.status} - ${result.statusText}`)
        }
        
        // return result - expecting a Delete Succesful string
        return result.text()
      })
      .then(result => {
        this.setState({deleteStatusMessage: result});

        // clear staged entry upon successful delete
        this.props.clearStage();

        // update table content reflecting the successful delete
        this.props.fetchTableContent();

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
        <div className="tupleToDeleteCheck">
          <p>Delete this entry?</p>
          {Object.values(this.props.tupleToDelete).map((entry: any) => {
            return (
              <div key={entry}>
                <table className="tupleToDelete">
                  <thead>
                    <tr>
                    {Object.keys(entry?.primaryEntries).map((primaryKey: any) => {
                      return (<th key={primaryKey} className="primaryKey">{primaryKey}</th>)
                    })}
                    {Object.keys(entry?.secondaryEntries).map((secondaryKey: any) => {
                      return (<th key={secondaryKey} className="secondaryKey">{secondaryKey}</th>)
                    })}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                    {Object.values(entry?.primaryEntries).map((primaryVal: any) => {
                      return (<td key={primaryVal} className="primaryEntry">{primaryVal}</td>)
                    })}
                    {Object.values(entry?.secondaryEntries).map((secondaryVal: any) => {
                      return (<td key={secondaryVal} className="secondaryEntry">{secondaryVal}</td>)
                    })}
                    </tr>
                  </tbody>
                </table>
              </div>
            )
          })}
          {this.state.dependencies ? '' :
          <button className="checkDependencies" onClick={() => this.getDependencies(Object.values(this.props.tupleToDelete))}>Check Dependencies</button>
          }
          {/* TODO: replace with proper animation */}
          {this.state.isGettingDependencies ? <p>Checking dependency...(imagine a wheel turning)...</p>: '' }
          
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
            <button className="confirmDelete" onClick={() => this.handleTupleDeletion(Object.values(this.props.tupleToDelete))}>Confirm Delete</button>
          </div>
        ) : ''}
        {this.state.isDeletingEntry ? <p>Deleting entry might take a while...(replace with wheel)</p>: '' } {/* TODO: replace with proper animation */}
        {this.state.deleteStatusMessage ? (
          <div>{this.state.deleteStatusMessage}<span><button onClick={() => this.closeMessage()}>dismiss</button></span></div>
        ) : ''}
      </div>
    )
  }
  
}

export default DeleteTuple;