process.env.NODE_ENV = 'test';


let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');

let should = chai.should();

chai.use(chaiHttp);

describe('Customer', () => {
  beforeEach((done) => {
    done();
  });

  // test auth user
});


