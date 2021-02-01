import React from 'react';
import "./DeleteTuple.css";

/**
 * list of allowed states on this delete tuple component
 */
type deleteTupleState = {
  dependencies: any, // list of dependencies fetched from API
  deleteStatusMessage: string, // for GUI to show
  isGettingDependencies: boolean, // for loading animation status
  isDeletingEntry: boolean // for loading animation status
}

class DeleteTuple extends React.Component<{token: string, selectedSchemaName: string, selectedTableName: string, tupleToDelete?: any, fetchTableContent: any, clearEntrySelection: any}, deleteTupleState> {
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
    let processedEntry = entry[0]?.primaryEntries // TODO: make sure deleteTuple component only gets one entry staged for deletion to begin with

    // set status true for isGettingDependencies, switch to false once api responds
    this.setState({isGettingDependencies: true})

    // TODO: Run api fetch for list of dependencies/permission
    fetch('/api/list_dependencies', {
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
        this.props.clearEntrySelection();

        // update table content reflecting the successful delete
        this.props.fetchTableContent();

      })
      .catch(error => {
        console.error(error);
        this.setState({deleteStatusMessage: error.message});
      })
  }

  /** 
   * clears the content of status message
   */ 
  closeMessage() {
    this.setState({deleteStatusMessage: ''})
  }

  render() {
    return(
      <div className="deleteWorkZone">
        <div className="tupleToDeleteCheck">
          {Object.values(this.props.tupleToDelete).map((entry: any) => {
            return (
              <div key={entry}>
                <p className="confirmationText">Delete this entry?</p>
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
          {Object.entries(this.props.tupleToDelete).length === 0 && !this.state.dependencies ? <p>Select a table entry to delete.</p> :
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
            <button className="confirmDeletion" onClick={() => this.handleTupleDeletion(Object.values(this.props.tupleToDelete))}>Confirm Delete</button>
          </div>
        ) : ''}
        <div className="deleting">
        {this.state.isDeletingEntry ? <p>Deleting entry might take a while...(replace with wheel)</p>: '' } {/* TODO: replace with proper animation */}
        {this.state.deleteStatusMessage ? (
          <div className="errorMessage">{this.state.deleteStatusMessage}<button className="dismiss" onClick={() => this.closeMessage()}>dismiss</button></div>
        ) : ''}
        </div>
      </div>
    )
  }
  
}

export default DeleteTuple;