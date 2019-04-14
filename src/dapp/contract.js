import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
        //this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {

            this.owner = accts[0];

            let counter = 1;

            while (this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while (this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });

    }

    regeisterAirline(airline, callback) {
        let self = this;
        self.flightSuretyApp.methods
            .registerAirline(airline)
            .send({ from: self.owner }, (error, result) => {
                callback(error, result);
            });
    }

    fundAirline(airline, seedFund, callback) {
        let self = this;
        let seed = web3.toWei(seedFund.toString(), 'ether');
        console.log('Send seed funding : ' + seed);
        self.flightSuretyApp.methods
            .fundAirline()
            .send({ from: airline, value: seed }, (error, result) => {
                callback(error, result);
            });
    }

    isOperational(callback) {
        let self = this;
        self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner }, callback);
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        }
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner }, (error, result) => {
                console.log('fetchFlightStatus result : ' + result);
                callback(result);
            });
    }

    fetchFlightInfo(callback) {
        let self = this;
        // Subscribe for FlightStatusInfo events
        this.flightSuretyApp.events.FlightStatusInfo({
            fromBlock: "latest"
        }, function (error, event) {
            if (error) console.log('Error in getting Flight status : ' + error)
            else {
                console.log('Event type is : ' + event.event)
                if (event.event === 'FlightStatusInfo') {
                    console.log('Event (FlightStatusInfo) emited from smart contract : ' + JSON.stringify(event.returnValues))

                    let result = {
                        //airline: event.returnValues.airline,
                        flight: event.returnValues.flight,
                        timestamp: event.returnValues.timestamp,
                        statusCode: event.returnValues.statusCode, // statusCode
                        index: event.returnValues.index // index requested
                    }
                    callback(error, result);
                    console.log('Event (FlightStatusInfo) emited from smart contract : ' + JSON.stringify(result))
                }
            }
        });
    }

    onEventAirlineRegistered(callback) {
        let self = this;
        this.flightSuretyApp.events.AirlineRegistered({
            fromBlock: "latest"
        }, function (error, event) {
            console.log('Event type is : ' + event.event)
            if (error) console.log('Error in reading event : ' + error)
            else {
                if (event.event === 'AirlineRegistered') {
                    console.log('Event (AirlineRegistered) emited from smart contract : ' + JSON.stringify(event.returnValues))

                    // let result = {
                    //     //airline: event.returnValues.airline,
                    //     flight: event.returnValues.flight,
                    //     timestamp: event.returnValues.timestamp,
                    //     statusCode: event.returnValues.statusCode, // statusCode
                    //     index: event.returnValues.index // index requested
                    // }
                    // callback(error, result);
                    console.log('Event (AirlineRegistered) emited from smart contract : ' + JSON.stringify(result))
                }
            }
        });
    }

    onEventAirlineFunded(callback) {
        let self = this;
        this.flightSuretyApp.events.AirlineFunded({
            fromBlock: "latest"
        }, function (error, event) {
            console.log('Event type is : ' + event.event)
            if (error) console.log('Error in reading event : ' + error)
            else {
                if (event.event === 'AirlineFunded') {
                    let result = {
                        event: event.event,
                        airline: event.returnValues.airline,
                        fund: event.returnValues.fund
                    }
                    callback(error, result);
                    console.log('Event (AirlineFunded) emited from smart contract : ' + JSON.stringify(event.returnValues))
                }
            }
        });
    }

}