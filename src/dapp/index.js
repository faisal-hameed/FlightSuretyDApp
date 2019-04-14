
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';

(async () => {

    let result = null;

    const FLIGHTS = [
        {
            //airline: contract.airlines[1],
            flight: 'SV-NYC',
            timestamp: Math.floor(Date.now() / 1000 - 250000)
        },
        {
            //airline: contract.airlines[1],
            flight: 'PK-LHR',
            timestamp: Math.floor(Date.now() / 1000 + 250000)
        }
    ]

    let contract = new Contract('localhost', () => {
        DOM.elid('airline-address').value = contract.airlines[0];
        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error, result);
            display('display-wrapper', 'Operational Status', 'Check if contract is operational', [{ label: 'Operational Status', error: error, value: JSON.stringify(result) }]);
        });

        contract.getActiveAirlines((error, result) => {
            console.log('Active airlines', error, result);
            display('airlines-wrapper', 'Existing airlines', '', [{ label: '', error: error, value: result }]);
        });

        // Watch Events
        contract.onEventAirlineRegistered((error, result) => {
            displayResult('Airline Registration', airline + ' : ' + result);
        });
        contract.onEventAirlineFunded((error, result) => {
            displayResult('Airline Funding', JSON.stringify(result));
        });
        contract.onEventFlightRegistered((error, result) => {
            displayResult('Flight Registered', JSON.stringify(result));
        });


        // Read transaction
        contract.fetchFlightInfo((error, result) => {
            display('display-wrapper', 'Flight Info', '', [{ label: 'Flight Info', error: error, value: JSON.stringify(result) }]);
        });


        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                console.log(result);
                display('display-wrapper', 'Oracles', 'Trigger oracles', [{ label: 'Fetch Flight Status', error: error, value: JSON.stringify(result) }]);
            });
        });


        // Register Airline
        DOM.elid('register-airline').addEventListener('click', () => {
            let airline = DOM.elid('airline-address').value;
            // Write transaction
            contract.regeisterAirline(airline, (error, result) => {
                console.log('regeisterAirline : ', result, error);
                displayResult('Airline Registration', airline + ' : pending', error);
            });
        });

        // Register Airline
        DOM.elid('fund-airline').addEventListener('click', () => {
            let airline = DOM.elid('airline-address').value;
            let seedFund = DOM.elid('seed-funding').value;
            // Write transaction
            contract.fundAirline(airline, seedFund, (error, result) => {
                console.log('fundAirline : ', result, error);
                displayResult('Airline Funding ', airline + ' : pending', error);
            });
        });


        // Register Flights
        DOM.elid('get-flights').addEventListener('click', () => {
            let airline = DOM.elid('airline-address').value;
            FLIGHTS.forEach(obj => {
                // Write transaction
                contract.registerFlight(airline, obj.flight, obj.timestamp, (error, result) => {
                    console.log('regeisterFlight : ', result, error);
                    if (error) {
                        displayResult('Flights Registration', '', error);
                    } else {
                        display('flights-wrapper', 'Oracles', 'Trigger oracles', [{ label: 'Fetch Flight Status', error: error, value: JSON.stringify(result) }]);
                    }
                });
            });
        });

    });

})();


function displayResult(title, result, error) {
    console.log('Display error : ' + error);
    let heading = DOM.elid('global-heading');
    heading.innerHTML = title;

    let resultP = DOM.elid('global-result');
    resultP.innerHTML = '';
    if (result) {
        resultP.innerHTML = result;
    }

    let errorP = DOM.elid('global-error');
    errorP.innerHTML = '';
    if (error) {
        errorP.innerHTML = error;
    }

}

function display(id, title, description, results) {
    let displayDiv = DOM.elid(id);
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({ className: 'row' }));
        row.appendChild(DOM.div({ className: 'col-sm-4 field' }, result.label));
        row.appendChild(DOM.div({ className: 'col-sm-8 field-value' }, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}







