import React, { useEffect, useState } from 'react';
import './App.css';
import contract from './contracts/NFTCollectible.json';
import NftmarketContract from './contracts/Nftmarket';
import { ethers } from 'ethers';


// TODO: change contract address
const contractAddress = "0x355638a4eCcb777794257f22f50c289d4189F245";
const abi = contract.abi;

function App() {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [signer, setSigner] = useState();
  const [nftMarketContract, setNftMarketContract] = useState();
  const [marketFee, setMarketFee] = useState();
  const [nftItems, setNftItems] = useState([]);
  const [nftItemsAB, setNftItemsAB] = useState([]);
  const [userInputTokenID, setUserInputTokenID] = useState();
  const [userInputPrice, setUserInputPrice] = useState();


  useEffect(() => {
    //checkWalletIsConnected();
    getconnectWalletAddress();
    //getContractPublicObjects();
  }, [])


  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have Metamask installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!")
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  }



  const connectWallet = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        setSigner(provider.getSigner());
        setNftMarketContract(NftmarketContract(provider));
        setCurrentAccount(accounts[0]);
        getContractPublicObjects();
      } catch (err) {
        console.log(err.message);
      }
    } else {
      console.log("Please install MetaMAsk at first!");
    }
  }

  const getconnectWalletAddress = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send('eth_accounts', []);
        if (accounts.length > 0) {
          setSigner(provider.getSigner());
          setNftMarketContract(NftmarketContract(provider));
          setCurrentAccount(accounts[0]);
        } else {
          console.log(" You are not connected to MetaMask! ");
        }

      } catch (err) {
        console.log(err.message);
      }

    } else {
      console.log("Please install MetaMAsk at first!");
    }
  }



  const mintNftHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, abi, signer);

        console.log("Initialize payment");
        let nftTxn = await nftContract.mintNFTs(1, { value: ethers.utils.parseEther("0.01") });

        console.log("Mining... please wait");
        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

      } else {
        console.log("Ethereum object does not exist");
      }

    } catch (err) {
      console.log(err);
    }
  }



  const connectWalletButton = () => {
    return (
      <button onClick={connectWallet} className='cta-button connect-wallet-button'>
        CONNECT WALLET
      </button>
    )
  }

  const mintNftButton = () => {
    return (
      <button onClick={mintNftHandler} className='cta-button mint-nft-button'>
        Mint NFT
      </button>
    )
  }


  const data = [
    {
      name: "sina",
      age: "22"
    },
    {
      name: "sina1",
      age: "atatei"
    },
    {
      name: "sina2",
      age: "atatei"
    },
    {
      name: "sina3",
      age: "atatei"
    }
  ]

  const getContractPublicObjects = async () => {

    try {
      if (!signer) throw new Error("Signer is not set");
      if (!contractAddress) throw new Error("Contract address is not provided");
      const contractFcWithSigner = nftMarketContract.connect(signer);
      const nftItems = await contractFcWithSigner.getNftItems();
      const nftItemAB = await contractFcWithSigner.getNftItemsAB();
      const _fee = await contractFcWithSigner.getMarketFee().toString();
      setNftItems(nftItems);
      setMarketFee(_fee);
      setNftItemsAB(nftItemAB);
      console.log(_fee.toString());
    } catch (err) {
      console.log(err);
    }
  }

  const buyItemEth = async (_id, _value) => {
    try {
      if (!signer) throw new Error("Signer is not set");
      if (!contractAddress) throw new Error("Contract address is not provided");
      const contractFcWithSigner = nftMarketContract.connect(signer);
      let nftTxn = await contractFcWithSigner.buyNftWithEth(_id, { value: _value });
      console.log("please wait");
      await nftTxn.wait();
      console.log("completed")
    } catch (err) {
      console.log(err);
    }
  }

  const buyItemAB = async (_id
  ) => {
    try {
      if (!signer) throw new Error("Signer is not set");
      if (!contractAddress) throw new Error("Contract address is not provided");
      const contractFcWithSigner = nftMarketContract.connect(signer);
      let nftTxn = await contractFcWithSigner.buyNftWithAbCoin(_id
      );
      console.log("please wait");
      await nftTxn.wait();
      console.log("completed")
    } catch (err) {
      console.log("msd")
      console.log(err);
    }
  }


  const handleInputChangeTokenID = (event) => {
    setUserInputTokenID(event.target.value);
  };
  const handleInputChangePrice = (event) => {
    setUserInputPrice(event.target.value);
  };

  const sellNftEth = async (_tokenId, _price) => {
    try {
      if (!signer) throw new Error("Signer is not set");
      if (!contractAddress) throw new Error("Contract address is not provided");
      const contractFcWithSigner = nftMarketContract.connect(signer);
      let nftTxn = await contractFcWithSigner.sellNftWithEth(_tokenId, _price, { value: 100000 });
      console.log("please wait");
      await nftTxn.wait();
      console.log("completed")
    } catch (err) {
      console.log("emm")
      console.log(err);
    }
  }


  const recyclerNft = () => {
    if (nftItems && nftItems.length > 0) {
      return (
        <div>
          <section className="container block">
            {nftItems
              .filter(item => item.seller !== "0x0000000000000000000000000000000000000000")
              .map((item) => (
                <div className="block-plan" key={item.itemId}>
                  <div className="plan">
                    <div className="card card--secondary">
                      <div className="card__header">
                        <span className="plan__introduction">
                          <span className="item__name">#ITEM ID: {item.itemId.toString()}</span>
                          <span className="token__name">#TOKEN ID: {item.tokenId.toString()}</span>
                        </span>
                        <img
                          src={item.seller === "0x0000000000000000000000000000000000000000"
                            ? "https://i0.wp.com/thestate270.org/wp-content/uploads/2019/10/sold-out.png"
                            : item.image}
                          style={{ width: '100px', height: '100px' }}
                          alt="NFT"
                        />
                        <span className="plan__description">PRICE: {item.price.toString()} WEI</span>
                        <button onClick={() => buyItemEth(item.itemId.toString(), item.price.toString())}>
                          BUY
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </section>
        </div>
      )
    } else {
      console.log("data not loaded");
    }
  }

  const recyclerNftAb = () => {
    if (nftItemsAB && nftItemsAB.length > 0) {
      return (
        <div>
          <section className="container block">
            {nftItemsAB
              .filter(item => item.seller !== "0x0000000000000000000000000000000000000000")
              .map((item) => (
                <div className="block-plan" key={item.itemId}>
                  <div className="plan">
                    <div className="card card--secondary">
                      <div className="card__header">
                        <span className="plan__introduction">
                          <span className="item__name">#ITEM ID: {item.itemId.toString()}</span>
                          <span className="token__name">#TOKEN ID: {item.tokenId.toString()}</span>
                        </span>
                        <img
                          src={item.seller === "0x0000000000000000000000000000000000000000"
                            ? "https://i0.wp.com/thestate270.org/wp-content/uploads/2019/10/sold-out.png"
                            : item.image}
                          style={{ width: '100px', height: '100px' }}
                          alt="NFT"
                        />
                        <span className="plan__description">PRICE: {item.price.toString()} ABC</span>
                        <button onClick={() => buyItemAB(item.itemId.toString())}>
                          BUY
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </section>
        </div>
      )
    } else {
      console.log("data not loaded");
    }
  }

  return (
    <div className='main-app'>
      <h1>
        <span className="is-link has-text-weight-bold">
          {currentAccount && currentAccount.length > 0 ? `connected: ${currentAccount.substring(0, 6)}...${currentAccount.substring(38)}` :
            "Connect Wallet"}
        </span>
      </h1>
      <div>
        {currentAccount ? mintNftButton() : connectWalletButton()}
      </div>

      <div>
        <h1 className="is-link has-text-weight-bold">################### SELL NFT WITH ETH ###################</h1>
        <h1 >ENTER TOKEN ID HERE:</h1>
        <input
          type="number"
          value={userInputTokenID}
          onChange={handleInputChangeTokenID}
        />


        <h1 >ENTER PRICE HERE:</h1>
        <input
          type="number"
          value={userInputPrice}
          onChange={handleInputChangePrice}
        />

        <button onClick={() => sellNftEth(userInputTokenID, userInputPrice)} className='mint-nft-button '>
          SELL NFT
        </button>
        <h1 className="is-link has-text-weight-bold">#######################################################</h1>
      </div>

      <button className="load-nfts" onClick={getContractPublicObjects}>
        <span className="is-link has-text-weight-bold">
          {currentAccount && currentAccount.length > 0 ? `LOAD DATAS` :
            ""}
        </span>
      </button>
      <div>
        {signer && currentAccount && nftMarketContract ? recyclerNft() : ""}
        {signer && currentAccount && nftMarketContract ? recyclerNftAb() : ""}
      </div>

    </div>
  )
}













export default App;
