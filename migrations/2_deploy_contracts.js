var ConvertLib = artifacts.require("./ConvertLib.sol");
var MetaCoin = artifacts.require("./MetaCoin.sol");
var Lightning = artifacts.require("./Lightning.sol");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, MetaCoin, Lightning);
  deployer.deploy(MetaCoin);
  deployer.deploy(Lightning);
};

/*
var shishi = artifacts.require("./shishi.sol");

module.exports = function(deployer) {
  deployer.deploy(shishi);
};
*/
