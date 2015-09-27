'use strict';

let db = require('../db/dbClient')();

class FormsRepository {
  constructor() { this.db = db; }
}
