// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract Exchanger is Ownable {
  ERC20 token1;
  ERC20 token2;
  uint256 public token1PerToken2 = 100;

  constructor(address token1Address, address token2Address, address initialOwner) Ownable(initialOwner) {
    token1 = ERC20(token1Address);
    token2 = ERC20(token2Address);
  }

  function exchangeTokens(uint256 token1Amount) public {
    require(token1Amount > 0, "You need to send some Token1 to proceed");
    uint256 amountToExchange = token1Amount * token1PerToken2;

    uint256 vendorBalance = token2.balanceOf(address(this));
    require(vendorBalance >= amountToExchange, "Vendor has insufficient tokens");

    (bool sent) = token1.transferFrom(msg.sender, address(this), token1Amount);
    require(sent, "Failed to transfer token1 from user");

    sent = token2.transfer(msg.sender, amountToExchange);
    require(sent, "Failed to transfer token2 to user");
  }
}
