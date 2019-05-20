import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../app';

import {
  authUser,
} from './dummy';

chai.should();
chai.use(chaiHttp);

describe('Repayment Endpoints', () => {
  let authToken;
  before((done) => {
    chai.request(server).post('/api/v2/auth/signin')
      .send(authUser)
      .end((err, res) => {
        authToken = res.body.data.token; // save the token
        done();
      });
  });
  it('Should retrieve repayment history if a loan exists', (done) => {
    chai.request(server)
      .get('/api/v2/loans/2/repayments')
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

  it('Should not retrieve repayment history if a loan doesn\'t exist', (done) => {
    chai.request(server)
      .get('/api/v2/loans/50000/repayments')
      .set('Accept', 'Application/JSON')
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, res) => {
        res.body.should.be.an('Object');
        res.body.should.have.property('status').equal(404);
        res.body.should.have.property('error');
        done();
      });
  });

  it('Should not retrieve repayment history if a loanId is not specified', (done) => {
    chai.request(server)
      .get('/api/v2/loans/dsss/repayments')
      .set('Accept', 'Application/JSON')
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, res) => {
        res.body.should.be.an('Object');
        res.body.should.have.property('status').equal(400);
        res.body.should.have.property('error');
        done();
      });
  });

  it('Should create a loan repayment record.', (done) => {
    const loan = {
      paidAmount: 5000000,
    };
    chai.request(server)
      .post('/api/v2/loans/5/repayment')
      .send(loan)
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

  it('Should not create a loan repayment record if a loan is not approved or doesn\'t exist.', (done) => {
    const loan = {
      paidAmount: 5000000,
    };
    chai.request(server)
      .post('/api/v2/loans/1/repayment')
      .send(loan)
      .set('Accept', 'Application/JSON')
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, res) => {
        res.body.should.be.an('Object');
        res.body.should.have.property('status').equal(404);
        res.body.should.have.property('error');
        done();
      });
  });
});
