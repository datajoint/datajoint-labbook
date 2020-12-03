class DatabaseConnectionInfo {
  databaseAddress: string;
  username: string;
  password: string;

  constructor(databaseAddress: string, username: string, password: string) {
    this.databaseAddress = databaseAddress;
    this.username = username;
    this.password = password;
  }
}

export default DatabaseConnectionInfo;