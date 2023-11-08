// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/ReentrancyGuard.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Context.sol";

contract ExchangeToken is ReentrancyGuard, Context { 
    // specify that the order can split to multiple part (multiple) or not
    enum orderType {
        single,
        multiple
    }

    // order status
    enum status {
        waiting,
        partly,
        done
    }

    // in Ether main means 1 Ether and sub means 1 wei
    // in ABCoin main means 1 ABCoin and sub means 1/10**18
    enum amountUnit {
        main,
        sub
    }

    struct Order {
        // for sell orders amount determine how ABCoin will be transfered
        // for buy orders amount determine how Ether will be transfered
        uint256 amount;
        // rate: rate = 100001 means 100.001 ABCoin = 1 Ether
        uint256 rate;
        orderType oType;
        uint8 rank;
        status orderStatus;
    }

    // every one can register just one sell bid and one buy bid at any time
    mapping (address => Order) public buyOrders;

    mapping (address => Order) public sellOrders;

    // the rank of a completed order sets to 0 and the other orders ranks set to 1 .. number of bids
    mapping (uint8 => address) public buyRanking;

    mapping (uint8 => address) public sellRanking;

    // this wallets save the tokens and Ethers amount of customers
    mapping (address => uint256) public etherWallet;

    mapping (address => uint256) public tokenWallet;

    //order booking
    address[] public buyOrderBooking;

    address[] public sellOrderBooking;

    // defined ABCoin token smart contract address
    IERC20 public _tokenAddr;

    uint8 private _tokenDecimals;

    // wallets of this contract
    address payable public _contractWallet;

    address public _contractTokenWallet;

    address public Owner;

    uint8 public sellOrderCount = 0;

    uint8 public buyOrderCount = 0;

    modifier onlyOwner {
        require(_msgSender() == Owner, "you do not access!");
        _;
    }

    event showOrder(uint256 Amount, uint256 Rate, orderType oType);

    constructor(IERC20 tokenAddr, uint8 tokenDecimals) {
        require(address(tokenAddr) != address(0), "0 address!");

        _tokenAddr = tokenAddr;
        _tokenDecimals = tokenDecimals;
        Owner = _msgSender();
        _contractTokenWallet = address(this);
        _contractWallet = payable(_contractTokenWallet);
    }

    // customrs must firstly transfer their Ethers or ABCoins to the contract by this functions
    function etherApprove() external nonReentrant payable {
        etherWallet[_msgSender()] += msg.value;
    }

    function tokenApprove(uint256 _amount, amountUnit _unit) external {
        if (_unit == amountUnit.main){
            _tokenAddr.transferFrom(_msgSender(), _contractTokenWallet, _amount * (10 **_tokenDecimals));
            tokenWallet[_msgSender()] += _amount *  (10 **_tokenDecimals);
        } else {
            _tokenAddr.transferFrom(_msgSender(), _contractTokenWallet, _amount);
            tokenWallet[_msgSender()] += _amount;
        }
    }

    // customers can finally claim their Ethers or ABCoins by this functions
    function etherWithdraw(address payable _to, uint256 _amount, amountUnit _unit) external nonReentrant payable onlyOwner {
        if (_unit == amountUnit.main) {
            _amount = _amount * (10 ** 18);
        }
        require(etherWallet[_to] >= _amount, "not enough Ether in your account!");
        _to.transfer(_amount);
        etherWallet[_to] -= _amount;
    }

    function tokenWithdraw(address _to, uint256 _amount, amountUnit _unit) public onlyOwner {
        if (_unit == amountUnit.main) {
            _amount = _amount * (10 ** _tokenDecimals);
        }
        require(tokenWallet[_to] >= _amount, "not enough Token in your account!");
        _tokenAddr.transferFrom(_contractTokenWallet, _to, _amount);
        tokenWallet[_to] -= _amount;
    }

    // bidding
    function addBuyOrder(uint256 order_amount, amountUnit order_unit, uint256 order_Rate, orderType order_Type) external {
        if (order_unit == amountUnit.main) {
            _addBuyOrder(_msgSender(), order_amount * (10 ** 18), order_Rate, order_Type);
            buyOrderCount ++;
        } else {
            _addBuyOrder(_msgSender(), order_amount, order_Rate, order_Type);
            buyOrderCount ++;
        }
    }

    function _addBuyOrder(address _buyerAddr, uint256 _buyAmount, uint256 _rate, orderType _orderType) private {
        require(etherWallet[_buyerAddr] >= _buyAmount, "not enough Ether!");
        etherWallet[_buyerAddr] -= _buyAmount;
        buyOrders[_buyerAddr].amount = _buyAmount;
        buyOrders[_buyerAddr].rate = _rate;
        buyOrders[_buyerAddr].oType = _orderType;
        buyOrders[_buyerAddr].orderStatus = status.waiting;
        buyOrderBooking.push(_buyerAddr);
        uint8 _rank = 0;
        for (uint8 i = 0; i < buyOrderBooking.length; i++) {
            if (buyOrders[buyOrderBooking[i]].orderStatus != status.done) {
                if (buyOrders[buyOrderBooking[i]].rate <= _rate) {
                    _rank += 1;
                } else {
                    buyOrders[buyOrderBooking[i]].rank += 1;
                }
            }
        }
        buyOrders[_buyerAddr].rank = _rank;
        for (uint8 i = 0; i < buyOrderBooking.length; i++) {
            buyRanking[buyOrders[buyOrderBooking[i]].rank] = buyOrderBooking[i];
        }
        _buyMatching(_buyerAddr, _buyAmount, _rate);
    }

    // matching
    function _buyMatching(address _buyerAddr, uint256 _buyAmount, uint256 _rate) private {
        if (sellOrderBooking.length != 0) {
            for (uint8 i = 1; i <= sellOrderBooking.length; i++) {
                if (sellOrders[sellRanking[i]].rate >= _rate) {
                    uint256 Amt = convertEthertoABCoin(_buyAmount, sellOrders[sellRanking[i]].rate, _tokenDecimals);
                    if (Amt == sellOrders[sellRanking[i]].amount) {
                        sellOrders[sellRanking[i]].orderStatus = status.done;
                        sellOrders[sellRanking[i]].rank = 0;
                        sellOrders[sellRanking[i]].amount = 0;
                        buyOrders[_buyerAddr].orderStatus = status.done;
                        buyOrders[_buyerAddr].rank = 0;
                        buyOrders[_buyerAddr].amount = 0;
                        etherWallet[sellRanking[i]] += _buyAmount;
                        tokenWallet[_buyerAddr] += Amt;
                        _buyAmount = 0;
                        Amt = 0;
                    } else if (Amt < sellOrders[sellRanking[i]].amount && sellOrders[sellRanking[i]].oType == orderType.multiple) {
                        sellOrders[sellRanking[i]].orderStatus = status.partly;
                        sellOrders[sellRanking[i]].amount -= Amt;
                        buyOrders[_buyerAddr].orderStatus = status.done;
                        buyOrders[_buyerAddr].rank = 0;
                        buyOrders[_buyerAddr].amount = 0;
                        etherWallet[sellRanking[i]] += _buyAmount;
                        tokenWallet[_buyerAddr] += Amt;
                    } else if (Amt > sellOrders[sellRanking[i]].amount && buyOrders[_buyerAddr].oType == orderType.multiple) {
                        sellOrders[sellRanking[i]].orderStatus = status.done;
                        sellOrders[sellRanking[i]].rank = 0;
                        buyOrders[_buyerAddr].orderStatus = status.partly;
                        buyOrders[_buyerAddr].amount -= convertABCointoEther(sellOrders[sellRanking[i]].amount, sellOrders[sellRanking[i]].rate, _tokenDecimals);
                        _buyAmount = buyOrders[_buyerAddr].amount;
                        etherWallet[sellRanking[i]] += convertABCointoEther(sellOrders[sellRanking[i]].amount, sellOrders[sellRanking[i]].rate, _tokenDecimals);
                        tokenWallet[_buyerAddr] += sellOrders[sellRanking[i]].amount;
                        sellOrders[sellRanking[i]].amount = 0;
                    }
                }
            }
        }
    }

    // bidding
    function addSellOrder(uint256 order_amount, amountUnit order_unit, uint256 order_Rate, orderType order_Type) external {
        if (order_unit == amountUnit.main) {
            _addSellOrder(_msgSender(), order_amount * (10 ** _tokenDecimals), order_Rate, order_Type);
            sellOrderCount ++;
        } else {
            _addSellOrder(_msgSender(), order_amount, order_Rate, order_Type);
            sellOrderCount ++;
        }
    }

    function _addSellOrder(address _sellerAddr, uint256 _sellAmount, uint256 _rate, orderType _orderType) private {
        require(tokenWallet[_sellerAddr] >= _sellAmount, "not enough Token!");
        tokenWallet[_sellerAddr] -= _sellAmount;
        sellOrders[_sellerAddr].amount = _sellAmount;
        sellOrders[_sellerAddr].rate = _rate;
        sellOrders[_sellerAddr].oType = _orderType;
        sellOrders[_sellerAddr].orderStatus = status.waiting;
        sellOrderBooking.push(_sellerAddr);
        uint8 _rank = 0;
        for (uint8 i = 0; i < sellOrderBooking.length; i++) {
            if (sellOrders[sellOrderBooking[i]].orderStatus != status.done) {
                if (sellOrders[sellOrderBooking[i]].rate >= _rate) {
                    _rank += 1;
                } else {
                    sellOrders[sellOrderBooking[i]].rank += 1;
                }
            }
        }
        sellOrders[_sellerAddr].rank = _rank;
        for (uint8 i = 0; i < sellOrderBooking.length; i++) {
            sellRanking[sellOrders[sellOrderBooking[i]].rank] = sellOrderBooking[i];
        }
        _sellMatching(_sellerAddr, _sellAmount, _rate);
    }

    // matching
    function _sellMatching(address _sellerAddr, uint256 _sellAmount, uint256 _rate) private {
        if (buyOrderBooking.length != 0) {
            for (uint8 i = 1; i <= buyOrderBooking.length; i++) {
                if (buyOrders[buyRanking[i]].rate <= _rate) {
                    uint256 Amt = convertABCointoEther(_sellAmount, buyOrders[buyRanking[i]].rate, _tokenDecimals);
                    if (Amt == buyOrders[buyRanking[i]].amount) {
                        buyOrders[buyRanking[i]].orderStatus = status.done;
                        buyOrders[buyRanking[i]].rank = 0;
                        buyOrders[buyRanking[i]].amount = 0;
                        sellOrders[_sellerAddr].orderStatus = status.done;
                        sellOrders[_sellerAddr].rank = 0;
                        sellOrders[_sellerAddr].amount = 0;
                        tokenWallet[buyRanking[i]] += _sellAmount;
                        etherWallet[_sellerAddr] += Amt;
                        _sellAmount = 0;
                        Amt = 0;
                    } else if (Amt < buyOrders[buyRanking[i]].amount && buyOrders[buyRanking[i]].oType == orderType.multiple) {
                        buyOrders[buyRanking[i]].orderStatus = status.partly;
                        buyOrders[buyRanking[i]].amount -= Amt;
                        sellOrders[_sellerAddr].orderStatus = status.done;
                        sellOrders[_sellerAddr].rank = 0;
                        sellOrders[_sellerAddr].amount = 0;
                        tokenWallet[buyRanking[i]] += _sellAmount;
                        etherWallet[_sellerAddr] += Amt;
                    } else if (Amt > buyOrders[buyRanking[i]].amount && sellOrders[_sellerAddr].oType == orderType.multiple) {
                        buyOrders[buyRanking[i]].orderStatus = status.done;
                        buyOrders[buyRanking[i]].rank = 0;
                        sellOrders[_sellerAddr].orderStatus = status.partly;
                        sellOrders[_sellerAddr].amount -= convertEthertoABCoin(buyOrders[buyRanking[i]].amount, buyOrders[buyRanking[i]].rate, _tokenDecimals);
                        _sellAmount = sellOrders[_sellerAddr].amount;
                        tokenWallet[buyRanking[i]] += convertEthertoABCoin(buyOrders[buyRanking[i]].amount, buyOrders[buyRanking[i]].rate, _tokenDecimals);
                        etherWallet[_sellerAddr] += buyOrders[buyRanking[i]].amount;
                        buyOrders[buyRanking[i]].amount = 0;
                    }
                }
            }
        }
    }

    // unit convertor
    function convertEthertoABCoin(uint256 _EtherAmount, uint256 _rate, uint8 _tDecimals) public pure returns (uint256 _ABCoinAmount) {
        return _EtherAmount * _rate * (10 ** (_tDecimals - 18)) / 1000;
    }

    // unit convertor
    function convertABCointoEther(uint256 _ABCoinAmount, uint256 _rate, uint8 _tDecimals) public pure returns (uint256 _EtherAmount) {
        return _ABCoinAmount * (10 ** (18 - _tDecimals)) * 1000 / _rate ;
    }

    // show orders
    function ShowBuyOrders() external {
        for (uint8 i = 0; i < buyOrderBooking.length; i++) {
            if (buyOrders[buyOrderBooking[i]].orderStatus != status.done) {
                emit showOrder(buyOrders[buyOrderBooking[i]].amount,
                buyOrders[buyOrderBooking[i]].rate,
                buyOrders[buyOrderBooking[i]].oType);
            }
        }
    }

    // show orders
    function ShowSellOrders() external {
        for (uint8 i = 0; i < sellOrderBooking.length; i++) {
            if (sellOrders[sellOrderBooking[i]].orderStatus != status.done) {
                emit showOrder(sellOrders[sellOrderBooking[i]].amount,
                sellOrders[sellOrderBooking[i]].rate,
                sellOrders[sellOrderBooking[i]].oType);
            }
        }
    }

    receive() external payable {
        etherWallet[_msgSender()] += msg.value;
    }
}