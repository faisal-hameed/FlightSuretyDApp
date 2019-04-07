
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  const SEED_FUND = web3.toWei(10, "ether")
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    //await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  //   it(`(multiparty) has correct initial isOperational() value`, async function () {

  //     // Get operating status
  //     let status = await config.flightSuretyData.isOperational.call();
  //     assert.equal(status, true, "Incorrect initial operating status value");

  //   });

  //   it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

  //       // Ensure that access is denied for non-Contract Owner account
  //       let accessDenied = false;
  //       try 
  //       {
  //           await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
  //       }
  //       catch(e) {
  //           accessDenied = true;
  //       }
  //       assert.equal(accessDenied, true, "Access not restricted to Contract Owner");

  //   });

  //   it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

  //       // Ensure that access is allowed for Contract Owner account
  //       let accessDenied = false;
  //       try 
  //       {
  //           await config.flightSuretyData.setOperatingStatus(false);
  //       }
  //       catch(e) {
  //           accessDenied = true;
  //       }
  //       assert.equal(accessDenied, false, "Access not restricted to Contract Owner");

  //   });

  // it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

  //     await config.flightSuretyData.setOperatingStatus(false);

  //     let reverted = false;
  //     try 
  //     {
  //         // This will throw exception due to operational status
  //         await config.flightSuretyData.registerAirline(config.testAddresses[3]);
  //     }
  //     catch(e) {
  //         reverted = true;
  //     }
  //     assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

  //     // Set it back for other tests to work
  //     await config.flightSuretyData.setOperatingStatus(true);

  // });

  it('(airline) can deposit funds', async () => {
    // ARRANGE
    console.log('fuding : ' + SEED_FUND)


    let reverted = false;
    // ACT
    try {
      await config.flightSuretyApp.fundAirline({ from: config.firstAirline, value: SEED_FUND, gasPrice: 0 })
    }
    catch (e) {
      reverted = true
    }
    let isFunded = await config.flightSuretyData.isAirlineFunded.call(config.firstAirline);
    console.log('Airline is funded : ' + isFunded);
    // ASSERT
    assert.equal(isFunded, true, "Airline should be able to deposit funds");

  });


  it('(airline) cannot deposit less than seed funds', async () => {
    // ARRANGE
    const LESS_FUND = web3.toWei(9, "ether")
    console.log('fuding : ' + LESS_FUND)


    let reverted = false;
    // ACT
    try {
      await config.flightSuretyApp.fundAirline({ from: config.firstAirline, value: LESS_FUND, gasPrice: 0 })
    }
    catch (e) {
      reverted = true
    }
    // ASSERT
    assert.equal(reverted, true, "Airline should not be able to deposit less than seed funds");

  });


  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    // ARRANGE
    let newAirline = accounts[4];

    // ACT
    try {
      await config.flightSuretyApp.registerAirline(newAirline, { from: config.firstAirline });
    }
    catch (e) {

    }
    let result = await config.flightSuretyData.isAirline.call(newAirline);

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });



  // TODO nonce error
  // it('(airline) only registered(funded) ailines can register an Airline using registerAirline()', async () => {
  //   // ARRANGE
  //   let newAirline = accounts[5];

  //   // ACT
  //   try {
  //     // First airline is funded
  //     await config.flightSuretyApp.registerAirline(newAirline, { from: config.firstAirline });
  //   }
  //   catch (e) {
  //     console.log(e)
  //   }
  //   let result = await config.flightSuretyData.isAirline.call(newAirline);

  //   // ASSERT
  //   assert.equal(result, true, "Existing Airline should be able to register another airline");

  // });

  // it('(airline) cannot register an Airline twice', async () => {
  //   // ARRANGE
  //   let newAirline = accounts[6];

  //   let success = false;
  //   let reverted = false;
  //   // ACT
  //   try {
  //     await config.flightSuretyApp.fundAirline({ from: config.firstAirline, value: LESS_FUND, gasPrice: 0 })
  //     success = await config.flightSuretyApp.registerAirline.call(newAirline, { from: config.firstAirline });
  //     await config.flightSuretyApp.registerAirline(newAirline, { from: config.firstAirline });
  //   }
  //   catch (e) {
  //     reverted = true;
  //   }

  //   // ASSERT
  //   assert.equal(success[0], true, "First airline should be registered");
  //   assert.equal(reverted, false, "Airline should not be able to register another airline twice");

  // });


});
