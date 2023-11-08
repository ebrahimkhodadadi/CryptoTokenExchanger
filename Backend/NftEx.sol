// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NftEx is ERC721, Ownable {
    uint256 public mintPrice = 0.002 * 10 ** (18);
    uint256 public totalSupply;
    uint256 public maxSupply;
    bool public isMintEnabled;
    mapping(address => uint256) public mintWallets;
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC721("ATASIN", "ATA") Ownable(msg.sender) {
        maxSupply = 1000;
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
        require(mintWallets[msg.sender] < 10, "exceeds max per wallet");
        require(msg.value == mintPrice, "wrong price!");
        require(totalSupply < maxSupply, "sorry!sold out!");
        mintWallets[msg.sender]++;
        totalSupply++;
        uint256 tokenId = totalSupply;
        payable(owner()).transfer(msg.value);
        _safeMint(msg.sender, tokenId);
    }

    function _setTokenURI(
        uint256 tokenId,
        string memory _tokenURI
    ) external onlyOwner {
        _tokenURIs[tokenId] = _tokenURI;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        string memory _tokenURI = _tokenURIs[tokenId];
        return _tokenURI;
    }
}

//abcoin:0xD2Dd1c7637B182086e56A0C0A0526fe5c9f4bf6B
//nft:0xF6e738A967bEF4c8033ec9cCa4888687ec62AE87
//market:0x4291888ecd6b6332B815dF69FB52082e24D3e61A
