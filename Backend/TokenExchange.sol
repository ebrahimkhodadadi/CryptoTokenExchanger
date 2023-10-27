// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract TokenExchange {
    IERC20 public abcToken;
    IERC721 public nftContract;

    constructor(address _abcToken, address _nftContract) {
        abcToken = IERC20(_abcToken);
        nftContract = IERC721(_nftContract);
    }

    function exchangeAbcToEther(uint256 abcAmount) public {
        //TODO: Implement the logic to exchange ABCoin for Ether.
    }

    function exchangeAbcToNft(uint256 abcAmount, uint256 tokenId) public {
        //TODO: Implement the logic to exchange ABCoin for NFT.
    }

    function exchangeNftToEther(uint256 tokenId) public {
        //TODO: Implement the logic to exchange NFT for Ether.
    }

    function exchangeNftToAbc(uint256 tokenId) public {
        //TODO: Implement the logic to exchange NFT for ABCoin.
    }
}
