// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/jumbotron.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import metacoin_artifacts from '../../build/contracts/MetaCoin.json'
import lightning_artifacts from '../../build/contracts/Lightning.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var MetaCoin = contract(metacoin_artifacts);
var Lightning = contract(lightning_artifacts);
window.MetaCoin = MetaCoin;
window.Lightning = Lightning;

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;
var account1;
var account2;

var moneyUser1=0;
var moneyUser2=0;
var modeLightning = false;
var nbTx = 0;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    MetaCoin.setProvider(web3.currentProvider);
    Lightning.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];
      account1 = accounts[1];
      account2 = accounts[2];

      self.refreshBalance();
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  refreshBalance: function() {
    var self = this;
    var light;

    // get user1 acount contract
    Lightning.deployed().then(function(instance) {
      light = instance;
      return light.getBalance.call(account1, {from: account1});
    }).then(function(value) {
      var balance_element = document.getElementById("balanceOwner1");
      balance_element.innerHTML = value.valueOf()/1000000000000000000;
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });

    // get user2 acount contract
    Lightning.deployed().then(function(instance) {
      light = instance;
      return light.getBalance.call(account2, {from: account2});
    }).then(function(value) {
      var balance_element = document.getElementById("balanceOwner2");
      balance_element.innerHTML = value.valueOf()/1000000000000000000;
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });

    // get if user1/user2 already paid
    Lightning.deployed().then(function(instance) {
      light = instance;
      return light.getIsPayedOwner.call(account1, {from: account1});
    }).then(function(value) {
      //var balance_element = document.getElementById("votedOwner1");
      if (value[0].valueOf()) document.getElementById("send1").disabled = true;
      else document.getElementById("send1").disabled = false;
      //balance_element.innerHTML = value[0].valueOf();

      //var balance_element = document.getElementById("votedOwner2");
      if (value[1].valueOf()) document.getElementById("send2").disabled = true;
      else document.getElementById("send2").disabled = false;
      //balance_element.innerHTML = value[1].valueOf();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance;  log.");
    });

    // get is user1 and user2 already paid
    Lightning.deployed().then(function(instance) {
      light = instance;
      return light.getIsPayedTotal.call(account1, {from: account1});
    }).then(function(value) {
      if (value.valueOf()) {
        if (modeLightning == false) self.transfer();
       document.getElementById('eth1').style.visibility = 'hidden';
      document.getElementById('eth2').style.visibility = 'visible';
     }
       else {
         document.getElementById('eth1').style.visibility = 'visible';
         document.getElementById('eth2').style.visibility = 'hidden';
       }
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });

    // get user1 ETH balance
    var balance_element = document.getElementById("balanceAdressOwner1");
    balance_element.innerHTML = web3.eth.getBalance(account1).toNumber()/1000000000000000000;

    // get user2 ETH balance
    var balance_element = document.getElementById("balanceAdressOwner2");
    balance_element.innerHTML = web3.eth.getBalance(account2).toNumber()/1000000000000000000;


   // get balance contract
    Lightning.deployed().then(function(instance) {
      light = instance;
      return light.getBalanceContract.call(account2, {from: account2});
    }).then(function(value) {
      var balance_element = document.getElementById("contractBalance");
      balance_element.innerHTML = value.valueOf()/1000000000000000000;
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });

  },


// fonction appelee lors du passage sur le lightning network
 transfer: function() {
   var self = this;
   console.log('ok');
   this.setStatus("Tansfer ETH to Lightning Network");
   moneyUser1 = parseFloat(document.getElementById("balanceOwner1").textContent);
   moneyUser2= parseFloat(document.getElementById("balanceOwner2").textContent);
  modeLightning = true;
  var balance1 = document.getElementById("balanceOwner11");
  var balance2 = document.getElementById("balanceOwner22");
  var nbtransac = document.getElementById("nb_tx");
  balance1.innerHTML = moneyUser1;
  balance2.innerHTML = moneyUser2;
  nbtransac.innerHTML = nbTx;
 },

//fonction pour transfer des ETH au smartcontract
sendMoney: function(owner) {
  var self = this;
  if (owner == 'owner1') // si owner1
  { // on recupere l'amount a transferer
    var amount = parseFloat(document.getElementById("amount1").value);
    Lightning.deployed().then(function(instance) {
      var light = instance;
      // on appele la fonction
      return light.putMoney1(amount, {from: account1, gas: 200000 ,value: web3.toWei(amount, "ether")});
    }).then(function() {
      self.setStatus("Transfer ETH owner1 done!");
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  }
  else if (owner == 'owner2') // si owner2
  {
    var amount = parseFloat(document.getElementById("amount2").value);
    //var password = parseInt(document.getElementById("password2").value);
    Lightning.deployed().then(function(instance) {
      var light = instance;
      return light.putMoney2(amount, {from: account2, gas: 200000 ,value: web3.toWei(amount, "ether")});
    }).then(function() {
      self.setStatus("Transfer ETH owner2 done!");
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  }
},


// fonction pour transferer de l'argent sur lightning
sendMoneyLightning: function(owner) {
  var self = this;
  if (owner == 'owner1') // si owner1
  { // on recupere l'amount a transferer
    var amount = parseFloat(document.getElementById("amount11").value);
    if ((moneyUser1-amount) >= 0) // on verifie que le transfer est possible
    {
      moneyUser1 -= amount;
      moneyUser2 += amount;
      nbTx++;
      self.setStatus("Transfer done!");
    }
    else // sinon on envoi une error
    {
      self.setStatus("Error sending coin");
    }

  }
  else if (owner == 'owner2') // si owner2
  { // on recupere l'amount a transferer
  var amount = parseFloat(document.getElementById("amount22").value);
  if ((moneyUser2-amount) >= 0)
  {
    moneyUser1 += amount;
    moneyUser2 -= amount;
    nbTx++;
    self.setStatus("Transfer done!");
  }
  else
  {
    self.setStatus("Error sending coin");
  }
  }
  // on affiche a l'ecran
  var balance1 = document.getElementById("balanceOwner11");
  var balance2 = document.getElementById("balanceOwner22");
  var nbtransac = document.getElementById("nb_tx");
  balance1.innerHTML = moneyUser1;
  balance2.innerHTML = moneyUser2;
  nbtransac.innerHTML = nbTx;
},



// fonction pour recuperer l'argent
cashBack: function() {
  var self = this;
  console.log('cashback');
  this.setStatus("Initiating transaction... (please wait)");
  var light;
  Lightning.deployed().then(function(instance) {
    light = instance;
    var amount = parseFloat(document.getElementById("amount1").value);
    console.log(moneyUser1);
    console.log(moneyUser2);
    return light.cashBack(web3.toWei(moneyUser1, "ether"),web3.toWei(moneyUser2, "ether"), {from: account1});
  }).then(function(value) {
    if (value == false)
    {
      self.setStatus("Error retrait");
    }
    else {self.setStatus("Retrait done!");
    moneyUser1 = 0;
    moneyUser2 = 0;
    modeLightning = 0;
    nbTx = 0;
    var nbtransac = document.getElementById("nb_tx");
    nbtransac.innerHTML = nbTx;}

    self.refreshBalance();
  }).catch(function(e) {
    console.log(e);
    self.setStatus("Error sending coin; see log.");
  });
//  web3.eth.sendTransaction({ from: account1, to: "0xb0d5fd753457b5e74685b897c40b490762ec466b", value: web3.toWei(amount, "ether") });

},
};


window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
