'use strict';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as Express from 'express';
import * as Http from 'http';

import {
  getAccessToken,
  PASSWORD_CREDENTIALS_GRANT,
  SERVICES_REALM } from '../../src/oauth-tooling';

chai.use(chaiAsPromised);
const expect = chai.expect;

// Setup API server
function setupTestEnvironment(authHeader: string, authServerApp: Express.Application) {
  authServerApp.post('/oauth2/access_token', function(req, res) {
    let valid = req.headers['authorization'] === authHeader;
    if (valid) {
      res
        .status(200)
        .send({ 'access_token': '4b70510f-be1d-4f0f-b4cb-edbca2c79d41' });
    } else {
      res
        .status(401)
        .send('Unauthorized');
    }
  });
}

describe('getAccessToken', () => {

  let authenticationServer: Http.Server;
  let authServerApp: Express.Application;

  // Setup AuthServer
  beforeEach(() => {
    authServerApp = Express();
    authenticationServer = authServerApp.listen(30001);
  });

  // stop server after test
  afterEach(() => {
    authenticationServer.close();
  });

  it('should become the access token', function() {

    //given
    setupTestEnvironment('Basic c3R1cHNfY2FtcC1mcm9udGVuZF80NTgxOGFkZC1jNDdkLTQ3MzEtYTQwZC1jZWExZmZkMGUwYzk6Nmk1Z2hCI1MyaUJLKSVidGI3JU14Z3hRWDcxUXIuKSo=', authServerApp);

    //when
    let bearer = getAccessToken({
      realm: SERVICES_REALM,
      scopes: ['campaing.edit_all', 'campaign.read_all'],
      accessTokenEndpoint: 'http://127.0.0.1:30001/oauth2/access_token',
      credentialsDir: 'integration-test/data/credentials',
      grantType: PASSWORD_CREDENTIALS_GRANT
    })
      .then((token) => {
        return token;
      });

    //then
    return expect(bearer).to.become('4b70510f-be1d-4f0f-b4cb-edbca2c79d41');
  });

  it('should become an undefined access token', function() {

    //given
    setupTestEnvironment('invalid', authServerApp);

    //when
      let bearer = getAccessToken({
        realm: SERVICES_REALM,
        scopes: ['campaing.edit_all', 'campaign.read_all'],
        accessTokenEndpoint: 'http://127.0.0.1:30001/oauth2/access_token',
        credentialsDir: 'integration-test/data/credentials',
        grantType: PASSWORD_CREDENTIALS_GRANT
      })
     .then((token) => {
       return token;
      });

    //then
    return expect(bearer).to.become(undefined);
  });
});
