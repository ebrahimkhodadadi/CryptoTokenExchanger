// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

//import "@openzeppelin/contracts/access/Ownable.sol";

contract NftMarket is IERC721Receiver, ReentrancyGuard {
    address payable owner;
    uint256 marketFee; //The market receives a fee for selling nfts
    uint256 ItemIdCountable = 0;
    uint256 itemSoldCountable = 0; //how many items sold in this market

    struct List {
        uint itemId;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => List) public listItems;

    event NftListCreated(
        uint indexed itemId,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    function getMarketFee() public view returns (uint256) {
        return marketFee;
    }

    ERC721Enumerable nft;

    constructor(ERC721Enumerable _nft, uint256 _marketFee) {
        owner = payable(msg.sender);
        nft = _nft;
        marketFee = _marketFee;
    }

    //in this fuction we add our nft to marketplace and if it sold out, eth will transfer to seller and nft will transfer to buyer
    function sellNft(
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        require(
            nft.ownerOf(tokenId) == msg.sender,
            "you have not access to this nft"
        );
        require(
            listItems[tokenId].tokenId == 0,
            "this nft is already available in market"
        );
        require(price > 0, "price should be higher than 0");
        require(msg.value == marketFee, "please transfer fee price");
        ItemIdCountable++;
        listItems[ItemIdCountable] = List(
            ItemIdCountable,
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );
        nft.transferFrom(msg.sender, address(this), tokenId); //the seller sends his nft to the contract to be sold*****(owner of nft should approve this contract address to sell his nft!you can do this in nft contract with approveall function)*****
        emit NftListCreated(
            ItemIdCountable,
            tokenId,
            msg.sender,
            address(this),
            price,
            false
        );
    }

    //in this function, a person can buy an NFT with Ethereum
    function buyNftWithEth(uint256 _itemId) public payable nonReentrant {
        List memory selectedItem = listItems[_itemId]; //gets id of the item and stores it
        require(msg.value == selectedItem.price, "transfer total amount!");
        selectedItem.seller.transfer(msg.value); //trasnfer price of nft to seller(eth)
        owner.transfer(marketFee); //transfer market fee to owner of contract
        nft.transferFrom(address(this), msg.sender, selectedItem.tokenId); //transfer nft from contract to buyer
        listItems[_itemId].sold = true;
        itemSoldCountable++;
        delete listItems[_itemId];
    }

    //in this function, we get the list of store nfts
    function getNftItems() public view returns (List[] memory) {
        uint256 nftCount = nft.totalSupply();
        uint currentIndex = 0;
        List[] memory items = new List[](nftCount);
        for (uint i = 0; i < nftCount; i++) {
            if (listItems[i + 1].owner == address(this)) {
                uint currentId = i + 1;
                List storage currentItem = listItems[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function onERC721Received(
        address,
        address from,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        require(from == address(0x0), "Cannot send nfts to Vault directly");
        return IERC721Receiver.onERC721Received.selector;
    }
}
