import './App.css';
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
import { useEffect, useState } from 'react';
import abi from './contracts/maincontract.json';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import bigInt from 'big-integer';


function App() {
  // declaration of states
  const [walletAddress, setWalletAdress] = useState("");
  //const [provider, setProvider] = useState();
  const [mycontract, setMycontract] = useState();
  const [selectedTokenValue, setSelectedTokenValue] = useState('');
  const [selectedUnitValue, setSelectedUnitValue] = useState('');
  const [buyUnitValue, setBuyUnitValue] = useState('');
  const [buyType, setBuyType] = useState('');
  const [sellUnitValue, setSellUnitValue] = useState('');
  const [sellType, setSellType] = useState('');
  const [sellOrdersAmount, setSellOrdersAmount] = useState([]);
  const [sellOrdersRate, setSellOrdersRate] = useState([]);
  const [sellOrdersType, setSellOrdersType] = useState([]);
  const [buyOrdersAmount, setBuyOrdersAmount] = useState([]);
  const [buyOrdersRate, setBuyOrdersRate] = useState([]);
  const [buyOrdersType, setBuyOrdersType] = useState([]);

  const [sellamount, setSellamount] = useState('');
  const [buyamount, setBuyamount] = useState('');
  const [approveamount, setApproveamount] = useState();
  const [sellrate, setSellrate] = useState('');
  const [buyrate, setBuyrate] = useState('');

  //const BigInt = require('big-integer');

  //const [connectionstatus, setConnectiostatus] = useState("unconnected");
  const address = '0x0Cf04109668b18F02d8ccB09355a9603Faa463B5';

  useEffect(() => {
    getConnectedWallet();
    addWalletListener();
  }, [walletAddress])

  const handleSellAmountChange = (event) => {
    setSellamount(event.target.value);
  };

  const handleBuyAmountChange = (event) => {
    setBuyamount(event.target.value);
  };

  const handleApproveAmountChange = (event) => {
    setApproveamount(event.target.value);
  };

  const handleSellRateChange = (event) => {
    setSellrate(event.target.value);
  };

  const handleBuyRateChange = (event) => {
    setBuyrate(event.target.value);
  };

  const handleTokenChange = (event) => {
    setSelectedTokenValue(event.target.value);
  };

  const handleUnitChange = (event) => {
    setSelectedUnitValue(event.target.value);
  };

  const handleBuyTypeChange = (event) => {
    setBuyType(event.target.value);
  };

  const handleBuyUnitChange = (event) => {
    setBuyUnitValue(event.target.value);
  };

  const handleSellTypeChange = (event) => {
    setSellType(event.target.value);
  };

  const handleSellUnitChange = (event) => {
    setSellUnitValue(event.target.value);
  };

  const handleSellButtonClick = () => {
    SellToken(sellamount, sellUnitValue, sellrate, sellType);
  };

  const handleBuyButtonClick = () => {
    BuyToken(buyamount, buyUnitValue, buyrate, buyType);
  };

  const handleApproveButtonClick = () => {
    if (selectedUnitValue === 'main') {
      const bigintamount = bigInt(approveamount * 10 ** 18);
      if (selectedTokenValue === 'Ether'){
        window.ethereum
        .request({
          method: 'eth_sendTransaction',
          // The following sends an EIP-1559 transaction. Legacy transactions are also supported.
          params: [
            {
              from: walletAddress, // The user's active address.
              to: address, // Required except during contract publications.
              value: bigintamount.toString(16), // Only required to send ether to the recipient from the initiating external account.
              gasLimit: '0x5028', // Customizable by the user during MetaMask confirmation.
              maxPriorityFeePerGas: '0x3b9aca00', // Customizable by the user during MetaMask confirmation.
              maxFeePerGas: '0x2540be400', // Customizable by the user during MetaMask confirmation.
            },
          ],
        })
        .then((txHash) => console.log(txHash))
        .catch((error) => console.error(error));
      } else if (selectedTokenValue === 'ABC') {
        ABCapprove(approveamount, selectedUnitValue);
      }
    } else if (selectedUnitValue === 'sub') {
      const bigintamount = bigInt(approveamount);
      if (selectedTokenValue === 'Ether'){
        window.ethereum
        .request({
          method: 'eth_sendTransaction',
          // The following sends an EIP-1559 transaction. Legacy transactions are also supported.
          params: [
            {
              from: walletAddress, // The user's active address.
              to: address, // Required except during contract publications.
              value: bigintamount.toString(16), // Only required to send ether to the recipient from the initiating external account.
              gasLimit: '0x5028', // Customizable by the user during MetaMask confirmation.
              maxPriorityFeePerGas: '0x3b9aca00', // Customizable by the user during MetaMask confirmation.
              maxFeePerGas: '0x2540be400', // Customizable by the user during MetaMask confirmation.
            },
          ],
        })
        .then((txHash) => console.log(txHash))
        .catch((error) => console.error(error));
      } else if (selectedTokenValue === 'ABC') {
        ABCapprove(approveamount, selectedUnitValue);
      }
    }
  };

  async function getConnectedWallet(){
    if(typeof window != "undefined" && typeof window.ethereum != "undefined" ){
      /* MetaMask is installed */
      try{
        //get provider
        const providerLocal = await detectEthereumProvider();
        //setProvider(providerLocal);
        const web3 = new Web3(providerLocal);
        web3.eth.Contract.handleRevert = true;
        //const address = '0xd53648fb399A5a6c99A5e6Dff5Ac9d2b849B5279';
        setMycontract(new web3.eth.Contract(abi.abi, address));
        if (providerLocal) {
          // From now on, this should always be true:
          // provider === window.ethereum
          // If the provider returned by detectEthereumProvider isn't the same as
          // window.ethereum, something is overwriting it – perhaps another wallet.
          if (providerLocal !== window.ethereum) {
            console.error('Do you have multiple wallets installed?');
          }
          // Access the decentralized web!
          const providersAccounts = await web3.eth.getAccounts();
          //get accounts
          setWalletAdress(providersAccounts[0]);
          //interact();
        } else {
          console.log('Please install MetaMAsk at first!');
        }
      }catch(err){
        console.log(err.message);
      }
    }else{
      /* MetaMask is not installed */
      console.log('Please install MetaMAsk at first!');
    }
  }

  const addWalletListener = async () => {
    if(typeof window != "undefined" && typeof window.ethereum != "undefined" ){
      window.ethereum.on("accountsChanged",(accounts) => {
        setWalletAdress(accounts[0]);
        console.log(accounts[0]);
      });
    }else{
      /* MetaMask not installed */
      setWalletAdress(" ");
      console.log("Install MetaMAsk!");
    }
  }

  const connectWallet = async()=> {
    if(typeof window != "undefined" && typeof window.ethereum != "undefined" ){
      /* MetaMask is installed */
      try{
        //get provider
        const providerLocal = await detectEthereumProvider();
        //setProvider(providerLocal);
        const web3 = new Web3(providerLocal);
        web3.eth.Contract.handleRevert = true;
        //const address = '0xd53648fb399A5a6c99A5e6Dff5Ac9d2b849B5279';
        setMycontract(new web3.eth.Contract(abi.abi, address));

        if (providerLocal) {
          // From now on, this should always be true:
          // provider === window.ethereum
          // If the provider returned by detectEthereumProvider isn't the same as
          // window.ethereum, something is overwriting it – perhaps another wallet.
          if (providerLocal !== window.ethereum) {
            console.error('Do you have multiple wallets installed?');
          }
          // Access the decentralized web!
          const accounts = await providerLocal.request({ method: 'eth_requestAccounts' })
            .catch((err) => {
              if (err.code === 4001) {
                // EIP-1193 userRejectedRequest error
                // If this happens, the user rejected the connection request.
                console.log('Please connect to MetaMask.');
              } else {
                console.error(err);
              }
            });

          //get accounts
          setWalletAdress(accounts[0]);
          //interact();
        } else {
          console.log('Please install MetaMAsk at first!');
        }
      }catch(err){
        console.log(err.message);
      }

    }else{
      /* MetaMask is not installed */
      console.log('Please install MetaMAsk at first!');
    }
  }

  async function refreshFunction() {
    if (typeof walletAddress != "undefined") {
      //const defaultAccount = walletAddress;
      try {
          // Get the current value of my number
          const sellOrderCount = await mycontract.methods.sellOrderCount().call();
          console.log(Number(sellOrderCount));
          const buyOrderCount = await mycontract.methods.sellOrderCount().call();
          for(var i=0; i<Number(sellOrderCount); i++){
            const sellAddr = await mycontract.methods.sellOrderBooking(i).call()
            const sellOrder = await mycontract.methods.sellOrders(sellAddr).call()
            if (sellOrder.orderStatus !== 2){
              const newSellOrdersAmount = [...sellOrdersAmount, Math.round(Number(sellOrder.amount) * 10 ** (-15)) / 1000]
              const newSellOrdersRate = [...sellOrdersRate, Number(sellOrder.rate) / 1000]
              const newSellOrdersType = [...sellOrdersType, Number(sellOrder.oType)]
              setSellOrdersAmount(newSellOrdersAmount)
              setSellOrdersRate(newSellOrdersRate)
              setSellOrdersType(newSellOrdersType)
            }
          }
          for(var j=0; i<Number(buyOrderCount); j++){
            const buyAddr = await mycontract.methods.buyOrderBooking(j).call()
            const buyOrder = await mycontract.methods.sellOrders(buyAddr).call()
            if (buyOrder.orderStatus !== 2){
              const newBuyOrdersAmount = [...buyOrdersAmount, Math.round(Number(buyOrder.amount) * 10 ** (-15)) / 1000]
              const newBuyOrdersRate = [...buyOrdersRate, Number(buyOrder.rate) / 1000]
              const newBuyOrdersType = [...buyOrdersType, Number(buyOrder.oType)]
              setBuyOrdersAmount(newBuyOrdersAmount)
              setBuyOrdersRate(newBuyOrdersRate)
              setBuyOrdersType(newBuyOrdersType)
            }
          }
      } catch (error) {
          console.error(error);
      }
    } else {
      console.log("Please, first connect wallet!")
    }
  }

  //tab1
  async function SellToken(_amount, _unit, _rate, _ordeType) {
    if (typeof walletAddress != "undefined") {
      const defaultAccount = walletAddress;
      try {
          if (_unit === 'main' && _ordeType === 'single') {
            const receipt = await mycontract.methods.addSellOrder(_amount, 0n, (_rate*1000), 0n).send({
              from: defaultAccount,
              gas: 1000000,
              gasPrice: 10000000000,
          });
          console.log('Transaction Hash: ' + receipt.transactionHash);
          } else if (_unit === 'sub' && _ordeType === 'single') {
            const receipt = await mycontract.methods.addSellOrder(_amount, 1n, (_rate*1000), 0n).send({
              from: defaultAccount,
              gas: 1000000,
              gasPrice: 10000000000,
          });
          console.log('Transaction Hash: ' + receipt.transactionHash);
          } else if (_unit === 'main' && _ordeType === 'multiple') {
            const receipt = await mycontract.methods.addSellOrder(_amount, 0n, (_rate*1000), 1n).send({
              from: defaultAccount,
              gas: 1000000,
              gasPrice: 10000000000,
          });
          console.log('Transaction Hash: ' + receipt.transactionHash);
          } else if (_unit === 'sub' && _ordeType === 'multiple') {
            const receipt = await mycontract.methods.addSellOrder(_amount, 1n, (_rate*1000), 1n).send({
              from: defaultAccount,
              gas: 1000000,
              gasPrice: 10000000000,
          });
          console.log('Transaction Hash: ' + receipt.transactionHash);
          }
      } catch (error) {
          console.error(error);
      }
    } else {
      console.log("Please, first connect wallet!")
    }
  }

  //tab2
  async function BuyToken(_amount, _unit, _rate, _ordeType) {
    if (typeof walletAddress != "undefined") {
      const defaultAccount = walletAddress;
      try {
          if (_unit === 'main' && _ordeType === 'single') {
            const receipt = await mycontract.methods.addBuyOrder(_amount, 0n, (_rate*1000), 0n).send({
              from: defaultAccount,
              gas: 1000000,
              gasPrice: 10000000000,
          });
          console.log('Transaction Hash: ' + receipt.transactionHash);
          } else if (_unit === 'sub' && _ordeType === 'single') {
            const receipt = await mycontract.methods.addBuyOrder(_amount, 1n, (_rate*1000), 0n).send({
              from: defaultAccount,
              gas: 1000000,
              gasPrice: 10000000000,
          });
          console.log('Transaction Hash: ' + receipt.transactionHash);
          } else if (_unit === 'main' && _ordeType === 'multiple') {
            const receipt = await mycontract.methods.addBuyOrder(_amount, 0n, (_rate*1000), 1n).send({
              from: defaultAccount,
              gas: 1000000,
              gasPrice: 10000000000,
          });
          console.log('Transaction Hash: ' + receipt.transactionHash);
          } else if (_unit === 'sub' && _ordeType === 'multiple') {
            const receipt = await mycontract.methods.addBuyOrder(_amount, 1n, (_rate*1000), 1n).send({
              from: defaultAccount,
              gas: 1000000,
              gasPrice: 10000000000,
          });
          console.log('Transaction Hash: ' + receipt.transactionHash);
          }
      } catch (error) {
          console.error(error);
      }
    } else {
      console.log("Please, first connect wallet!")
    }
  }

  //tab3
  async function ABCapprove(_amount, _tokenunit) {
    if (typeof walletAddress != "undefined") {
      const defaultAccount = walletAddress;
      try {
          if (selectedUnitValue === 'main') {
            const receipt = await mycontract.methods.tokenApprove(_amount, 0n).send({
              from: defaultAccount,
              gas: 1000000,
              gasPrice: 10000000000,
          });
          console.log('Transaction Hash: ' + receipt.transactionHash);
          } else if (selectedUnitValue === 'sub') {
            const receipt = await mycontract.methods.tokenApprove(_amount, 1n).send({
              from: defaultAccount,
              gas: 1000000,
              gasPrice: 10000000000,
          });
          console.log('Transaction Hash: ' + receipt.transactionHash);
          }
      } catch (error) {
          console.error(error);
      }
    } else {
      console.log("Please, first connect wallet!")
    }
  }

  return (
    <div className="App">
      <header>
        <h2>Exchange Market</h2>
        <button
                onClick={connectWallet}
              >
                <span>
                  {walletAddress && walletAddress.length > 0 ? `connected: ${walletAddress.substring(0,6)}...${walletAddress.substring(38)}`:
                  "Connect Wallet" }
                </span>
              </button>
        <button
                onClick={refreshFunction}
              >
                <span>
                  Refresh
                </span>
              </button>
      </header>
      <section>
        <nav className='nav-section'>
          <table>
            <th>sell ABCoin orders
              <tr>
                <th>row</th>
                <th>sellamount</th>
                <th>rate</th>
                <th>type</th>
              </tr>
              <tr><td>1</td><td>{sellOrdersAmount[0]}</td><td>{sellOrdersRate[0]}</td><td>{sellOrdersType[0]}</td></tr>
              <tr><td>2</td><td>{sellOrdersAmount[1]}</td><td>{sellOrdersRate[1]}</td><td>{sellOrdersType[1]}</td></tr>
              <tr><td>3</td><td>{sellOrdersAmount[2]}</td><td>{sellOrdersRate[2]}</td><td>{sellOrdersType[2]}</td></tr>
            </th>
            <th><span></span></th>
            <th>buy ABCoin oreders
              <tr>
                <th>row</th>
                <th>amount</th>
                <th>rate</th>
                <th>type</th>
              </tr>
              <tr><td>1</td><td>{buyOrdersAmount[0]}</td><td>{buyOrdersRate[0]}</td><td>{buyOrdersType[0]}</td></tr>
              <tr><td>2</td><td>{buyOrdersAmount[1]}</td><td>{buyOrdersRate[1]}</td><td>{buyOrdersType[1]}</td></tr>
              <tr><td>3</td><td>{buyOrdersAmount[2]}</td><td>{buyOrdersRate[2]}</td><td>{buyOrdersType[2]}</td></tr>
            </th>
          </table>
        </nav>
        <article>
          <Tabs defaultIndex={0}>
            <TabList>
              <Tab>Sell tokens</Tab>
              <Tab>Buy tokens</Tab>
              <Tab>Transfer to Exchange</Tab>
            </TabList>
            <TabPanel>
              <form>
                <p>Order Type:
                  <input type="radio" id="sellsingle" name="sellorder_type" value="single" checked={sellType === 'single'} onChange={handleSellTypeChange}/>
                  <label htmlFor="sellsingle">Single</label>
                  <input type="radio" id="sellmultiple" name="sellorder_type" value="multiple" checked={sellType === 'multiple'} onChange={handleSellTypeChange}/>
                  <label htmlFor="sellmultiple">Multiple</label>
                </p>
                <p>
                  <label htmlFor="sellamount">Amount:</label>
                  <input
                    id="sellamount"
                    type="text"
                    value={sellamount}
                    onChange={handleSellAmountChange}
                  />
                    <input type="radio" id="sellmain_unit" name="sell_unit" value="main" checked={sellUnitValue === 'main'} onChange={handleSellUnitChange}/>
                    <label htmlFor="sellmain_unit">ABC</label>
                    <input type="radio" id="sellsub_unit" name="sell_unit" value="sub" checked={sellUnitValue === 'sub'} onChange={handleSellUnitChange}/>
                    <label htmlFor="sellsub_unit">Wei</label>
                </p>
                <p>
                  <label htmlFor="sellrate">Sell Rate:</label>
                  <input
                    id="sellrate"
                    type="text"
                    value={sellrate}
                    onChange={handleSellRateChange}
                  />
                </p>
                <button onClick={handleSellButtonClick}>Register Sell</button>
              </form>
            </TabPanel>
            <TabPanel>
              <form>
                <p>Order Type:
                  <input type="radio" id="buysingle" name="buyorder_type" value="single" checked={buyType === 'single'} onChange={handleBuyTypeChange}/>
                  <label htmlFor="buysingle">Single</label>
                  <input type="radio" id="buymultiple" name="buyorder_type" value="multiple" checked={buyType === 'multiple'} onChange={handleBuyTypeChange}/>
                  <label htmlFor="buymultiple">Multiple</label>
                </p>
                <p>
                  <label htmlFor="buyamount">Amount:</label>
                  <input
                    id="buyamount"
                    type="text"
                    value={buyamount}
                    onChange={handleBuyAmountChange}
                  />
                    <input type="radio" id="buymain_unit" name="buy_unit" value="main" checked={buyUnitValue === 'main'} onChange={handleBuyUnitChange}/>
                    <label htmlFor="buymain_unit">Ether</label>
                    <input type="radio" id="buysub_unit" name="buy_unit" value="sub" checked={buyUnitValue === 'sub'} onChange={handleBuyUnitChange}/>
                    <label htmlFor="buysub_unit">Wei</label>
                </p>
                <p>
                  <label htmlFor="buyrate">Buy Rate:</label>
                  <input
                    id="buyrate"
                    type="text"
                    value={buyrate}
                    onChange={handleBuyRateChange}
                  />
                </p>
                <button onClick={handleBuyButtonClick}>Register Buy</button>
                <button>dasdsad</button>
              </form>
            </TabPanel>
            <TabPanel>
              <form>
                <p>Order Type:
                  <input type="radio" id="ether" name="tokenbuyorder_type" value="Ether" checked={selectedTokenValue === 'Ether'} onChange={handleTokenChange}/>
                  <label htmlFor="ether">Ether</label>
                  <input type="radio" id="abc" name="token_type" value="ABC" checked={selectedTokenValue === 'ABC'} onChange={handleTokenChange}/>
                  <label htmlFor="abc">ABC</label>
                </p>
                <p>
                  <label htmlFor="approveamount">Amount:</label>
                  <input
                    id="approveamount"
                    type="text"
                    value={approveamount}
                    onChange={handleApproveAmountChange}
                  />
                    <input type="radio" id="approvemain_unit" name="approve_unit" value="main" checked={selectedUnitValue === 'main'} onChange={handleUnitChange}/>
                    <label htmlFor="approvemain_unit">Main Currency</label>
                    <input type="radio" id="approvesub_unit" name="approve_unit" value="sub" checked={selectedUnitValue === 'sub'} onChange={handleUnitChange}/>
                    <label htmlFor="approvesub_unit">Sub Currency</label>
                </p>
                <button onClick={handleApproveButtonClick}>Approve Transfer</button>
              </form>
            </TabPanel>
          </Tabs>
        </article>
      </section>
      <footer>
        <p></p>
        <p></p>
      </footer>
    </div>
  );
}

export default App;
