import * as fs from 'fs';

export default class DummyDB {
  data = {};
  path = 'output/db.json'

  constructor() {
    try {
      if (fs.existsSync(this.path)) {
        console.log('DB file exists');
        this.data = JSON.parse(fs.readFileSync(this.path, 'utf8'));
      }
    } catch (err) {
      console.log('DB file does not exist');
    }

    this.syncDB();
  }
  
  getUser(email) {
    return this.data[email];
  }

  syncDB() {
    fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2));
  }
}
