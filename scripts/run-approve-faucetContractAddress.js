/* eslint-disable space-before-function-paren */
/* eslint-disable no-undef */
const hre = require('hardhat');

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // Optionnel car l'account deployer est utilisé par défaut
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  // We get the contract to deploy
  const DsToken = await hre.ethers.getContractFactory('DsToken');
  const dsToken = await DsToken.attach('0xe6300dfDbC1199A8cA704851ec5a294b2988898c');

  if (hre.network.name !== 'mainnet') {
    await dsToken.approve('0xc6D7A339B6cdf09995B39c121763fC07821CE528', 1e15);
    const faucetAllowance = await dsToken.allowance(deployer.address, '0xc6D7A339B6cdf09995B39c121763fC07821CE528');
    console.log(faucetAllowance.toString(), ' : Allowance to 0xc6D7A339B6cdf09995B39c121763fC07821CE528');
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
