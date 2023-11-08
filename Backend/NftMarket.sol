// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

//import "@openzeppelin/contracts/access/Ownable.sol";

contract NftMarket is IERC721Receiver, ReentrancyGuard {
    address payable owner;
    uint256 marketFee; //The market receives a fee for selling nfts
    uint256 ItemIdCountable = 0;
    uint256 ItemIdCountableAbCoin = 0;
    uint256 ItemIdCountableAuction = 0;
    uint256 itemSoldCountable = 0; //how many items sold in this market
    ERC20 token;
    ERC721Enumerable nft;

    struct List {
        uint itemId;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        string image;
    }

    struct auctionStruct {
        uint itemId;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 finishTime;
        mapping(uint256 => bidStruct) bids;
        uint256 totalBids;
        bool sold;
        string image;
    }

    struct bidStruct {
        address payable addressOfBidder;
        uint256 bidPrice;
    }

    mapping(uint256 => List) public listItems;
    mapping(uint256 => List) public listItemsAbcoin;
    mapping(uint256 => auctionStruct) public auctionItems;

    event NftListCreated(
        uint indexed itemId,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    event NftAuctionCreated(
        uint indexed itemId,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 highestPriceBid,
        address addressHighestPriceBid,
        uint256 finishTime,
        bool sold
    );

    function getMarketFee() public view returns (uint256) {
        return marketFee;
    }

    constructor(ERC721Enumerable _nft, ERC20 _token, uint256 _marketFee) {
        owner = payable(msg.sender);
        nft = _nft;
        marketFee = _marketFee;
        token = _token;
    }

    //in this fuction we add our nft to marketplace and if it sold out, eth will transfer to seller and nft will transfer to buyer
    function sellNftWithEth(
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        //mode==0 sell nft with eth  mode==1 sell nft with abcoin
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
        string memory _image = nft.tokenURI(tokenId);
        listItems[ItemIdCountable] = List(
            ItemIdCountable,
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false,
            _image
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

    function sellNftWithAbCoin(
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        //mode==0 sell nft with eth  mode==1 sell nft with abcoin
        require(
            nft.ownerOf(tokenId) == msg.sender,
            "you have not access to this nft"
        );
        require(
            listItemsAbcoin[tokenId].tokenId == 0,
            "this nft is already available in market"
        );
        require(price > 0, "price should be higher than 0");
        require(msg.value == marketFee, "please transfer fee price");
        ItemIdCountableAbCoin++;
        string memory _image = nft.tokenURI(tokenId);
        listItemsAbcoin[ItemIdCountableAbCoin] = List(
            ItemIdCountableAbCoin,
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false,
            _image
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

    //Auction
    function createAuction(
        uint256 tokenId,
        uint256 auctionFinishTimeUnix
    ) public payable nonReentrant {
        require(
            nft.ownerOf(tokenId) == msg.sender,
            "you have not access to this nft"
        );
        require(
            auctionItems[tokenId].tokenId == 0,
            "this nft is already available in market"
        );
        require(msg.value == marketFee, "please transfer fee price");
        require(
            auctionFinishTimeUnix > block.timestamp,
            "auction finish time should be higher than current unix time"
        );
        ItemIdCountable++;
        auctionStruct storage newItem = auctionItems[ItemIdCountable];
        newItem.itemId = ItemIdCountable;
        newItem.tokenId = tokenId;
        newItem.seller = payable(msg.sender);
        newItem.owner = payable(address(this));
        newItem.finishTime = auctionFinishTimeUnix;
        newItem.sold = false;
        newItem.totalBids = 0;
        newItem.image = nft.tokenURI(tokenId);
        nft.transferFrom(msg.sender, address(this), tokenId);
        emit NftAuctionCreated(
            ItemIdCountable,
            tokenId,
            msg.sender,
            address(this),
            0,
            address(this),
            auctionFinishTimeUnix,
            false
        );
    }

    function bidOnItem(uint256 _itemId) public payable nonReentrant {
        auctionStruct storage selectedItem = auctionItems[_itemId]; //gets id of the item and stores it
        require(
            selectedItem.finishTime > block.timestamp,
            "sorry...The auction is over"
        );
        require(msg.value > 0, "bid should be higher than 0");
        selectedItem.totalBids++;
        bidStruct memory _bid = selectedItem.bids[selectedItem.totalBids];
        _bid.addressOfBidder = payable(msg.sender);
        _bid.bidPrice = msg.value;
    }

    function calculateAuctionResult(
        uint256 _itemId
    ) public payable nonReentrant {
        auctionStruct storage selectedItem = auctionItems[_itemId];
        require(
            selectedItem.finishTime < block.timestamp,
            "auction time is not ended"
        );
        uint256 _totalBids = selectedItem.totalBids;
        uint256 maxBid = 0;
        address payable maxBidderAddress;
        require(_totalBids > 0, "no bids");
        for (uint256 i = 1; i <= _totalBids; i++) {
            bidStruct memory _bid = selectedItem.bids[i];
            if (_bid.bidPrice > maxBid) {
                maxBid = _bid.bidPrice;
                maxBidderAddress = _bid.addressOfBidder;
            }
        }
        selectedItem.seller.transfer(maxBid);
        owner.transfer(marketFee);
        nft.transferFrom(address(this), maxBidderAddress, selectedItem.tokenId);
        //give back eth to not success acounts
        if (_totalBids > 1) {
            for (uint256 i = 1; i <= _totalBids; i++) {
                bidStruct memory _bid = selectedItem.bids[i];
                if (_bid.addressOfBidder != maxBidderAddress) {
                    _bid.addressOfBidder.transfer(_bid.bidPrice);
                }
            }
        }
        selectedItem.sold = true;
        itemSoldCountable++;
        delete auctionItems[_itemId];
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

    //in this function, a person can buy an NFT with ABCOIN
    function buyNftWithAbCoin(uint256 _itemId) public payable nonReentrant {
        List memory selectedItem = listItemsAbcoin[_itemId]; //gets id of the item and stores it
        require(
            token.balanceOf(msg.sender) >= selectedItem.price,
            "insufficient token!"
        );
        token.transferFrom(msg.sender, selectedItem.seller, selectedItem.price);
        owner.transfer(marketFee); //transfer market fee to owner of contract
        nft.transferFrom(address(this), msg.sender, selectedItem.tokenId); //transfer nft from contract to buyer
        listItemsAbcoin[_itemId].sold = true;
        itemSoldCountable++;
        delete listItemsAbcoin[_itemId];
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
