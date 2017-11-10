pragma solidity ^0.4.2;

import "./ConvertLib.sol";

contract Lightning
{
    address public owner1; // utilisateur 1
    address public owner2; // utilisateur 2

    bool public payedOwner1; // le owner1 a t-il deposé ses ETH
    bool public payedOwner2; // le owner1 a t-il deposé ses ETH

    uint public montantTotal; // montant total d'ETH deposés sur le contract
    uint public endDate; // data de fin du contract

    mapping(address => uint) balances; // balances gerant le montant des owner
                                       // en fonciton de leur addresse


    function Lightning ()
    {
        endDate = now + 1 days;
    }

    modifier isOwner(){ // modifier pour verifier que le sender est bien un des deux users
          require((msg.sender == owner1) || (msg.sender == owner2));
            _;
    }

    modifier beforeEndDate() {
      // modifier pour verifier que nous navons pas depasser la date de fin
        require(now < endDate);
        _;
    }

    // le owner1 depose de l'argent sur le smart-contract
    function putMoney1(uint amount) payable returns(bool sufficient)
    {
      if (!payedOwner1) {
        owner1 = msg.sender;
        balances[owner1] = msg.value;
        montantTotal += balances[owner1];
        payedOwner1 = true; }
        return true;
      }

      // le owner2 depose de l'argent sur le smart-contract
      function putMoney2(uint amount) payable returns(bool sufficient)
      {
       if (!payedOwner2) {
          owner2 = msg.sender;
          balances[owner2] = msg.value;
          montantTotal += balances[owner2];
          payedOwner2 = true; }
          return true;
        }

    // retourne la balance du contract (ou aurait pu utliser egalement this.balance)
    function getBalanceContract(address addr) constant returns(uint) {
			return montantTotal;
		}

		// retourne la balance du owner
		function getBalance(address addr) constant returns(uint) {
			return balances[addr];
		}

    // retourne les deux bool pour savoir si owner1 et owner2 ont payés separement
    function getIsPayedOwner(address addr) constant returns(bool,bool) {
      return (payedOwner1,payedOwner2);
		}

    // retourne un bool pour savoir si owner1 et owner2 ont payés tous les deux
    function getIsPayedTotal(address addr) constant returns(bool) {
      if (payedOwner1 && payedOwner2) return true;
      else return false;
		}

    // retrait pour chacun des owners
    function cashBack(uint amount1, uint amount2) beforeEndDate isOwner returns(bool sufficient)
    {
          balances[owner1] = 0;
          payedOwner1 = false;
          owner1.transfer(amount1);
          balances[owner2] = 0;
          payedOwner2 = false;
          owner2.transfer(amount2);
          montantTotal =0;
          return true;
    }

}
