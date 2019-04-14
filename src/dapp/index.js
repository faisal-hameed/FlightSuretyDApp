
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async () => {

    let result = null;

    const FLIGHTS = {
        'NYC': {
            //airline: accounts[1],
            flight: 'SV-NYC',
            timestamp: Date.now() - 250000
        },
        'LHR': {
            //airline: accounts[2],
            flight: 'PK-LHR',
            timestamp: Date.now() + 250000
        }
    }

    let contract = new Contract('localhost', () => {
        DOM.elid('airline-address').value = contract.airlines[1];
        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error, result);
            display('Operational Status', 'Check if contract is operational', [{ label: 'Operational Status', error: error, value: result }]);
        });

        // Watch Events
        contract.onEventAirlineRegistered((error, result) => {
            displayResult('Airline Registration', airline + ' : ' + result);
        });
        contract.onEventAirlineFunded((error, result) => {
            displayResult('Airline Funding', JSON.stringify(result));
        });


        // Read transaction
        contract.fetchFlightInfo((error, result) => {
            display('Flight Info', '', [{ label: 'Flight Info', error: error, value: JSON.stringify(result) }]);
        });


        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                console.log(result);
                display('Oracles', 'Trigger oracles', [{ label: 'Fetch Flight Status', error: error, value: JSON.stringify(result) }]);
            });
        });


        // Register Airline
        DOM.elid('register-airline').addEventListener('click', () => {
            let airline = DOM.elid('airline-address').value;
            // Write transaction
            contract.regeisterAirline(airline, (error, result) => {
                console.log('regeisterAirline : ', result, error);
                if (error) {
                    displayError('Airline Registration', error.message);
                } else {
                    displayResult('Airline Registration', airline + ' : pending');
                }
            });
        });

        // Register Airline
        DOM.elid('fund-airline').addEventListener('click', () => {
            let airline = DOM.elid('airline-address').value;
            let seedFund = DOM.elid('seed-funding').value;
            // Write transaction
            contract.fundAirline(airline, seedFund, (error, result) => {
                console.log('fundAirline : ', result, error);
                if (error) {
                    displayError('Fund Airline', error.message);
                } else {
                    displayResult('Fund Airline', airline);
                }
            });
        });

    });


})();


function displayResult(title, result) {
    let displayDiv = DOM.elid('global-results');
    let section = DOM.section();
    section.appendChild(DOM.h3(title));
    section.appendChild(DOM.h5(result));
    displayDiv.append(section);
}

function displayError(title, error) {
    let displayDiv = DOM.elid('global-error');
    let section = DOM.section();
    section.appendChild(DOM.h3('Error : ' + title));
    section.appendChild(DOM.p(error));
    displayDiv.append(section);
}

function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
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







