import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);


const ACCOUNT_OFFSET = 10; // first 10 accounts are reserved for airlines
const ORACLES_COUNT = 20;
let oracle_accounts = [];

console.log('Start server');

function initAccounts() {
  return new Promise((resolve, reject) => {
    web3.eth.getAccounts((error, accounts) => {
      console.log('Total accounts : ' + accounts.length)
      if (accounts.length < ORACLES_COUNT + ACCOUNT_OFFSET) {
        throw "Increase the number of accounts"
      }

      // Register App as authorized caller
      flightSuretyData.methods
        .authorizeCaller(config.appAddress)
        .send({ from: accounts[0] })
        .then(result => {
          console.log('App registered as authorized caller')
        });

      resolve(accounts);

    }).catch(err => {
      reject(err);
    });
  });
}

function initOracles(accounts) {
  return new Promise((resolve, reject) => {
    console.log('Initialized Oracles');
    resolve(true);
  });
}


initAccounts()
  .then(accounts => {    
    initOracles(accounts).then(oracles => {
    })
      .then(() => {        
        initREST();
      });
  });

flightSuretyApp.events.OracleRequest({
  fromBlock: 0
}, function (error, event) {
  if (error) console.log(error)
  console.log(event)
});


// Initialize rest endpoints
const app = express();
function initREST() {
  console.log('Initialized rest API');
  app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
  })
}

export default app;
