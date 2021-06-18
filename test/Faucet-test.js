/* eslint-disable no-undef */
const { expect } = require('chai');

describe('Faucet', function () {
  let DsToken, dsToken, Faucet, faucet, dev, tokenOwnerTest, faucetOwner, alice, bob;
  const INITIAL_SUPPLY = 10000000000;
  const FAUCET_AMOUNT = 100;

  beforeEach(async function () {
    // dsToken deployment
    [tokenOwnerTest, faucetOwner, dev, alice, bob] = await ethers.getSigners();
    DsToken = await ethers.getContractFactory('DsToken');
    dsToken = await DsToken.connect(dev).deploy(tokenOwnerTest.address, INITIAL_SUPPLY);
    await dsToken.deployed();

    // faucet deployment
    Faucet = await ethers.getContractFactory('Faucet');
    faucet = await Faucet.connect(faucetOwner).deploy(dsToken.address, FAUCET_AMOUNT);
    await faucet.deployed();
  });

  describe('Faucet deployement', function () {
    it('should faucet tokenOwner be dsToken tokenOwner ', async function () {
      expect(await dsToken.tokenOwner()).to.equal(tokenOwnerTest.address);
    });
    it('should faucet tokenContractAddress be dsToken contract address', async function () {
      expect(await faucet.tokenContractAddress()).to.equal(dsToken.address);
    });
    it('should faucet delay is 3 days', async function () {
      expect(await faucet.faucetDelay()).to.equal(259200);
    });
  });

  describe('Faucet function', function () {
    beforeEach(async function () {
      // approve smartcontract address for buying tokens
      await dsToken.connect(tokenOwnerTest).approve(faucet.address, INITIAL_SUPPLY);
    });
    describe('grabTokens', function () {
      it(`should balance user increase ${FAUCET_AMOUNT} DST and delay faucet for user addrress increase of 3 days`,
        async function () {
          const block = await (ethers.provider.getBlock());
          const FAUCET_DELAY = (block.timestamp) + 259200;
          const currentAliceBalance = await dsToken.balanceOf(alice.address);
          await (faucet.connect(alice)).grabTokens();
          expect(await dsToken.balanceOf(alice.address)).to.equal(currentAliceBalance.add(FAUCET_AMOUNT));
          expect(await faucet.faucetDelayOf(alice.address)).to.above(FAUCET_DELAY);
        });
      it('should tokens owner balance decrease grabbed faucet tokens amount', async function () {
        const currentTokenOwnerBalance = await dsToken.balanceOf(tokenOwnerTest.address);
        await faucet.connect(alice).grabTokens();
        expect(await dsToken.balanceOf(tokenOwnerTest.address))
          .to.equal(currentTokenOwnerBalance.sub(FAUCET_AMOUNT));
      });
      it('should revert for tokenOwner', async function () {
        await expect(faucet.connect(tokenOwnerTest).grabTokens())
          .to.be.revertedWith('Faucet: Tokens owner can not buy his tokens');
      });
      it('should revert for trying grabing faucet Tokens again before 3 days faucet delay', async function () {
        await expect(faucet.connect(bob).grabTokens());
        await expect(faucet.connect(bob).grabTokens())
          .to.be.revertedWith('Faucet: You have already grabbed tokens since last 3 days');
      });
      it('should autorize  user grabing faucet Tokens again after 3 days delay is past', async function () {
        await faucet.connect(bob).grabTokens();
        await ethers.provider.send('evm_increaseTime', [259201]); // 3 days + 1 sec.= 259201 seconds
        await ethers.provider.send('evm_mine');
        const currentBobBalance = await dsToken.balanceOf(alice.address);
        expect(await dsToken.balanceOf(bob.address)).to.equal(currentBobBalance.add(FAUCET_AMOUNT));
      });
      it('should emit tranfer event', async function () {
        expect(await faucet.connect(bob).grabTokens())
          .to.emit(dsToken, 'Transfer').withArgs(tokenOwnerTest.address, bob.address, FAUCET_AMOUNT);
      });
    });
    describe('faucetDelayOf', function () {
      it('should return timeStamp increase of 3 days after grabing tokens',
        async function () {
          const block = await (ethers.provider.getBlock());
          const FAUCET_DELAY = (block.timestamp) + 259200;
          console.log(FAUCET_DELAY, '3 days Delay block');
          await (faucet.connect(alice)).grabTokens();
          console.log((await faucet.faucetDelayOf(alice.address)).toString(), 'Alice Delay block+1sec');
          expect(await faucet.faucetDelayOf(alice.address)).to.above(FAUCET_DELAY);
        });
    });
    describe('TokenOwner', function () {
      it('should return Dstoken TokenOwner',
        async function () {
          console.log(await faucet.tokenOwner(), 'TokenOwner Address');
          expect(await faucet.tokenOwner()).to.equal(await dsToken.tokenOwner());
        });
    });
  });
});
