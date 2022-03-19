const RyukNFT = artifacts.require("RyukNFT");

module.exports = function (deployer) {
  deployer.deploy(RyukNFT);
};
