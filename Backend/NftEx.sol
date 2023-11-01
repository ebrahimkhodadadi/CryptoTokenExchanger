// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NftEx is ERC721, Ownable {
    uint256 public mintPrice = 0.0002 * 10 ** (18);
    uint256 public totalSupply;
    uint256 public maxSupply;
    bool public isMintEnabled;
    mapping(address => uint256) public mintWallets;

    constructor() ERC721("ATASIN", "ATA") Ownable(msg.sender) {
        maxSupply = 3;
        totalSupply = 0;
        isMintEnabled = true;
        _safeMint(msg.sender, totalSupply);
        totalSupply++;
    }

    function accessMintEnabled() external onlyOwner {
        isMintEnabled = !isMintEnabled;
    }

    function mint() external payable {
        require(isMintEnabled, "mint is not enabled!");
        require(mintWallets[msg.sender] < 1, "exceeds max per wallet");
        require(msg.value == mintPrice, "wrong price!");
        require(totalSupply < maxSupply, "sorry!sold out!");
        mintWallets[msg.sender]++;
        totalSupply++;
        uint256 tokenId = totalSupply;
        payable(owner()).transfer(msg.value);
        _safeMint(msg.sender, tokenId);
    }
}
