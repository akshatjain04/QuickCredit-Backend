import chai from 'chai';
import chaiHttp from 'chai-http';
import dummy from './dummy';
import server from '../app';

chai.should();
chai.use(chaiHttp);

describe('Loan Endpoints', () => {
  let authToken;
  before((done) => {
    chai.request(server).post('/api/v2/auth/signin')
      .send(dummy.authUser)
      .end((err, res) => {
        authToken = res.body.data.token; // save the token
        done();
      });
  });

  it('Should retrieve all loans', (done) => {
    chai.request(server)
      .get('/api/v2/loans')
      .set('Accept', 'Application/JSON')
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, res) => {
        res.body.should.be.an('Object');
        res.body.should.have.property('status').equal(200);
        res.body.should.have.property('data');
        res.body.data.should.be.an('array');
        done();
      });
  });

  it('Should retrieve a specific loan', (done) => {
    chai.request(server)
      .get('/api/v2/loans/2')
      .set('Accept', 'Application/JSON')
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, res) => {
        res.body.should.be.an('Object');
        res.body.should.have.property('status').equal(200);
        res.body.should.have.property('data');
        res.body.data.should.be.an('object');
        done();
      });
  });

  it('Should not retrieve a specific loan if a loan doesn\'t exist', (done) => {
    chai.request(server)
      .get('/api/v2/loans/50000')
      .set('Accept', 'Application/JSON')
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, res) => {
        res.body.should.be.an('Object');
        res.body.should.have.property('status').equal(404);
        res.body.should.have.property('error');
        done();
      });
  });

  it('Should not retrieve a specific loan if a loanId is not specified', (done) => {
    chai.request(server)
      .get('/api/v2/loans/dsss')
      .set('Accept', 'Application/JSON')
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, res) => {
        res.body.should.be.an('Object');
        res.body.should.have.property('status').equal(400);
        res.body.should.have.property('error');
        done();
      });
  });

  it('Should create a loan', (done) => {
    chai.request(server)
      .post('/api/v2/loans')
      .send(dummy.newLoan)
      .set('Accept', 'Application/JSON')
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, res) => {
        res.body.should.be.an('Object');
        res.body.should.have.property('status').equal(201);
        res.body.should.have.property('data');
        res.body.data.should.be.an('object');
        done();
      });
  });

  it('Should not create a loan if a user with the email used is not found', (done) => {
    chai.request(server)
      .post('/api/v2/loans')
      .send(dummy.fakeLoan1)
      .set('Accept', 'Application/JSON')
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, res) => {
        res.body.should.be.an('Object');
        res.body.should.have.property('status').equal(404);
        res.body.should.have.property('error');
        done();
      });
  });

  it('Should create a loan if email is not specified in url params', (done) => {
    chai.request(server)
      .post('/api/v2/loans')
      .send(dummy.fakeLoan2)
      .set('Accept', 'Application/JSON')
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, res) => {
        res.body.should.be.an('Object');
        res.body.should.have.property('status').equal(400);
        res.body.should.have.property('error');
        done();
      });
  });

  it('Should approve or reject a specific loan', (done) => {
    chai.request(server)
      .patch('/api/v2/loans/2')
      .send(dummy.LoanStatus)
      .set('Accept', 'Application/JSON')
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, res) => {
        res.body.should.be.an('Object');
        res.body.should.have.property('status').equal(200);
        res.body.should.have.property('data');
        res.body.data.should.be.an('object');
        done();
      });
  });

  it('Should not approve or reject a specific a loan if it is not found', (done) => {
    chai.request(server)
      .patch('/api/v2/loans/50000')
      .send(dummy.LoanStatus)
      .set('Accept', 'Application/JSON')
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, res) => {
        res.body.should.be.an('Object');
        res.body.should.have.property('status').equal(404);
        res.body.should.have.property('error');
        done();
      });
  });

  it('Should not retrieve approve or reject a loan if the loanId is not specified', (done) => {
    chai.request(server)
      .patch('/api/v2/loans/dsss')
      .send(dummy.LoanStatus)
      .set('Accept', 'Application/JSON')
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, res) => {
        res.body.should.be.an('Object');
        res.body.should.have.property('status').equal(400);
        res.body.should.have.property('error');
        done();
      });
  });
});
