pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    // Mapping to track authorized AppContracts
    mapping(address => bool) private authorizedCallers;
    // Mapping to track voters of operational status

    // All airlines
    mapping(address => Airline) private airlines;
    address[] activeAirlines = new address[](0);    


    struct Airline {
        address airline;
        bool isFunded;
        bool isRegistered;
    }

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
    (
    ) 
    public
    {
        contractOwner = msg.sender;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }


    /**
    *@dev Modifier that check if airline mapping exists or not
    */
    modifier requireRegisteredAirline(address airline)
    {
        require(airlines[airline].airline != address(0), "Caller is not contract owner");
        _;
    }

    /**
    *@dev Modifier that check if caller is authorized
    */
    modifier requireAuthorizedCaller(address caller)
    {
        require(authorizedCallers[caller], "Caller is not authorized");
        _;
    }

    modifier requiredFunded(address airline) {
        if (activeAirlines.length > 0) {
            require(airlines[airline].isFunded, "Airline is not funded");
        }        
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
    public 
    view 
    returns(bool) 
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
    (
        bool mode
    ) 
    external
    requireContractOwner
    {
        require(operational != mode, "Operational status should be different from current status");
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline
    (   
        address airline
    )
    external
    requireIsOperational
    requiredFunded(airline)
    returns (bool success)
    {
        require(!airlines[airline].isRegistered, "Airline is already registered");
        airlines[airline] = Airline(airline, false, true);
        activeAirlines.push(airline);
        return airlines[airline].isRegistered;
    }


   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy
    (                             
    )
    external
    payable
    {

    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
    (
    )
    external
    pure
    {
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
    (
    )
    external
    pure
    {
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fundAirline
    (
        address airline
    )
    public
    payable
    {
        // Credit airline balance
        airlines[airline].isFunded = true;
    }


    function getFlightKey
    (
        address airline,
        string memory flight,
        uint256 timestamp
    )
    pure
    internal
    returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
    external 
    payable 
    {
        fundAirline(msg.sender);
    }

    /**
    * Utility functions
    */

    function authorizeCaller(address contractAddress) external requireContractOwner
    {
        authorizedCallers[contractAddress] = true;
    }

    function deAuthorizeCaller(address contractAddress) external requireContractOwner
    {
        delete authorizedCallers[contractAddress];
    }

    /** Check if airline is present */
    function isAirline(address airline) external returns(bool) {
        return (airlines[airline].airline != address(0));
    }


    /** Get Airline isFunded */
    function isAirlineFunded(address airline) external view returns(bool)
    {
        return airlines[airline].isFunded;
    }

    /** Get Airline balance */
    function getActiveAirlines() external view returns(address[] memory)
    {
        return activeAirlines;
    }




}

