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
  const [nftItems, setNftItems] = useState([]);

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
      setNftItems(nftItems);
      console.log(nftItems);
    } catch (err) {
      console.log(err);
    }
  }

  const recyclerNft = () => {
    if (nftItems && nftItems.length > 0) {
      return (
        <div>
          <section class="container block">

            {
              nftItems.map((item) => {
                return (

                  <div class="block-plan">
                    <div class="plan">
                      <div class="card card--secondary">
                        <div class="card__header">
                          <span class="plan__introduction">
                            <span class="item__name">#ITEM ID: {item.itemId.toString()}</span>
                            <span class="token__name">#TOKEN ID: {item.tokenId.toString()}</span>
                          </span>
                          <img src={item.image} style={{ width: '100px', height: '100px' }}></img>
                          <span class="plan__description">PRICE: {item.price.toString()} WEI</span>
                          <button >
                            BUY
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>

                )

              })
            }
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

      <button className="load-nfts" onClick={getContractPublicObjects}>
        <span className="is-link has-text-weight-bold">
          {currentAccount && currentAccount.length > 0 ? `LOAD DATAS` :
            ""}
        </span>
      </button>
      <div>
        {signer && currentAccount && nftMarketContract ? recyclerNft() : "Please connect to MetaMask and load data."}
      </div>

    </div>
  )
}













export default App;
