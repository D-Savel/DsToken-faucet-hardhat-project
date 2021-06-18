// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./DsToken.sol";

/// @title Faucet
/// @author D.Savel
/// @notice This Faucet Contract is used with ERC20 contract (Dstoken.sol), with 3 days delay between each faucet offer for the same address.
/// @dev This contract connect to Dstoken.sol ERC20 contract.

contract Faucet {
    /// @dev ERC20 contract choose for Faucet
    DsToken private _dsToken;

    mapping(address => uint256) private _faucetDelay;

    address private _tokenContractAddress;
    address private _tokenOwner;
    uint256 private _faucetAmount;
    uint256 private constant _DELAY = 3 days;

    /**
     * @dev Construtor intancies the tokens owner (seller) and link to ERC20 (DsToken).
     * @param tokenContractAddress_ the address of tokens owner in ERC20 contract.
     * @param faucetAmount_ the faucet amount.
     */

    constructor(address tokenContractAddress_, uint256 faucetAmount_) {
        _tokenContractAddress = tokenContractAddress_; //Token smartcontract address
        _dsToken = DsToken(tokenContractAddress_); // Token smartcontract link
        _tokenOwner = _dsToken.tokenOwner();
        _faucetAmount = faucetAmount_;
    }

    /**
     * @notice Public function to offer the faucet amount tokens, this function is callable only :
     * if user address has not grab faucet tokens since last 3 days.
     * if user address is not the Tokens Owner.
     * @dev buyTokens call transferFrom function from ERC20 DsToken contract.
     * it tranfers tokens from tokens owner to user address
     */
    function grabTokens() public returns (bool) {
        require(msg.sender != _tokenOwner, "Faucet: Tokens owner can not buy his tokens");
        if (_faucetDelay[msg.sender] == 0) {
            _faucetDelay[msg.sender] = block.timestamp;
        }
        require(
            _faucetDelay[msg.sender] <= block.timestamp,
            "Faucet: You have already grabbed tokens since last 3 days"
        );
        _dsToken.transferFrom(_tokenOwner, msg.sender, _faucetAmount);
        _faucetDelay[msg.sender] = block.timestamp + _DELAY;
        return true;
    }

    /// @notice Returns the faucet Amount.
    function faucetAmount() public view returns (uint256) {
        return _faucetAmount;
    }

    /// @notice Returns delay between to faucet offer.
    function faucetDelay() public pure returns (uint256) {
        return _DELAY;
    }

    /// @notice Returns the delay for next faucet offer for user address.
    /// @param account address for which is return the delay for next faucet offer.
    /// @dev The faucet delay value is a timestamp in seconds.
    function faucetDelayOf(address account) public view returns (uint256) {
        return _faucetDelay[account];
    }

    /// @notice Returns Tokens owner Address.
    /// @dev The Tokens owner is assigned in DsToken ERC20 contract.
    function tokenOwner() public view returns (address) {
        return _tokenOwner;
    }

    /// @notice Returns DsToken ERC20 contract address.
    function tokenContractAddress() public view returns (address) {
        return _tokenContractAddress;
    }
}
