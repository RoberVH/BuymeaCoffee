import abi from '../utils/BuyMeACoffee.json';
import { ethers } from "ethers";
import Head from 'next/head'
import Image from 'next/image'
import React, { useEffect, useState } from "react";
import styles from '../styles/Home.module.css'

export default function Home() {
  // Contract Address & ABI
  //const contractAddress = "0x0B219ac716651DA20cdc1464e9aF7A61f755c268";
  const contractAddress = '0xb4cf946C81F95f1294210057E6477E7f7A9e314B'
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);
  const [beneficiary, setBeneficiary] = useState("")


  const handleWithDrawFunds = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const tx = await buyMeACoffee.withdrawTips();
        await tx.wait()
        
      } else {
        console.log("Metamask is not connected");
      }
      
    } catch (error) {
      console.log(error);
      if (error.error && error.error.message) alert(error.error.message)
       else alert(error)
    } 
  };
  
  const handleBeneficiary = async () => {
    if (!beneficiary) {
        alert("Set Beneficiary account first!")
      return
    } else try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const tx = await buyMeACoffee.setBeneficiary(beneficiary);
        await tx.wait()
      } else {
        console.log("Metamask is not connected");
      }
      
    } catch (error) {
      console.log(error);
      if (error.error && error.error.message) alert(error.error.message)
       else alert(error)
    }      
  };
  const onBeneficiaryChange = (event) => {
    setBeneficiary(event.target.value);
  }
  
  const onNameChange = (event) => {
    setName(event.target.value);
  }

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  }

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({method: 'eth_accounts'})
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        setCurrentAccount(account)
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }

  const connectWallet = async () => {
    try {
      const {ethereum} = window;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }



  const buyCoffee = async (option) => {
    try {
      const {ethereum} = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("buying coffee..")
        let coffeeTxn;
        if (option===1) {
          coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "anon",
          message ? message : "Enjoy your coffee!",
          {value: ethers.utils.parseEther("0.001")}
        )} else {
         coffeeTxn = await buyMeACoffee.buyLargerCoffee(
          name ? name : "anon",
          message ? message : "Enjoy your coffee!",
          {value: ethers.utils.parseEther("0.003")}
        )}

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn.hash);

        console.log("coffee purchased!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        
        console.log("fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }
      
    } catch (error) {
      console.log(error);
    }
  };
  
  useEffect(() => {
    let buyMeACoffee;
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name
        }
      ]);
    };

    const {ethereum} = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeACoffee = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      buyMeACoffee.on("NewMemo", onNewMemo);
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    }
  }, []);
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Buy rovicher.eth a Coffee!</title>
        <meta name="description" content="Tipping site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Buy rovicher.eth a Coffee!
        </h1>
        <div className={styles.panel}>
        {currentAccount ? (
          <div style={{marginTop:'10px'}}>
            <p style={{ 
              color:'white',
            position:'fixed',
            top:'10px',
            left:'80%',
            background:'#6b6bff',
            borderRadius:'15px',
            padding:'5px'
            }}>Account: &nbsp;{currentAccount.substring(0,6)}...
              {currentAccount.substring(37)}
            </p>
            <form>
              <div>
                <h3> Sent Eth</h3> 
                <label>
                  Name
                </label>
                <br/>
                
                <input
                  style={{marginTop:'5px'}}
                  id="name"
                  type="text"
                  placeholder="anon"
                  onChange={onNameChange}
                  />
              </div>
              <br/>
              <div>
                <label >
                  Message to send
                </label>
                <br/>

                <textarea
                  style={{marginTop:'5px'}}
                  rows={3}
                  placeholder="Enjoy your coffee!"
                  id="message"
                  onChange={onMessageChange}
                  required
                >
                </textarea>
              </div>
              <div>
                <button style={{background:'#6b6bff', 
                                color:'white',
                               padding:'10px',
                               marginTop:'10px'}}
                  type="button"
                  onClick={()=>buyCoffee(1)}
                >
                  Buy Coffee for 0.001ETH
                </button>
                <br></br>
                <button style={{background:'#B089D5 ', 
                                color:'white',
                               padding:'10px',
                               marginTop:'10px'}}
                  type="button"
                  onClick={()=>buyCoffee(3)}
                >
                  Buy Coffee for 0.003ETH
                </button>                
              </div>
            </form>
          </div>
        ) : (
          <button style={{marginTop:'25px'}}
            onClick={connectWallet}> Connect your wallet </button>
        )}
          {currentAccount && <div className= {styles.withdrawals}>
           <h3> WithDrawals</h3> 
            <div style={{display:'flex', flexDirection:'col'}}></div>
             <div>
              <label>Account to send funds:</label>
              <input
                style={{marginLeft:'10px'}}
                id="Beneficiary"
                type="text"
                placeholder="0x00000000000000000"
                onChange={onBeneficiaryChange}
              />
             </div>
             <div> 
                <button style={{marginLeft:'20px', marginTop: '10px', padding:'5px', background:'blue', color:'white'}} 
                  onClick={handleBeneficiary}>
                  Set Beneficiary
                </button>
               <br></br>
                <button style={{marginLeft:'20px', marginTop: '10px', padding:'5px', background:'green', color:'white'}} 
                  onClick={handleWithDrawFunds}>
                  Withdraw Funds
                </button>               
             </div>
            </div>
          }
         </div>
      </main>

      {currentAccount && (<h1>Memos received</h1>)}

      {currentAccount && (memos.map((memo, idx) => {
        return (
          <div key={idx} style={{
            border:"none", 
            borderRadius:"5px", 
            padding: "5px", margin: "5px",
            background:'#b8b8ff',
          padding:'1px 15px'}}>
            <p style={{"fontWeight":"bold"}}>"{memo.message}"</p>
            <p style={{fontSize:'0.8rem', paddingLeft:'50px'}}>From: {memo.name} at &nbsp;
              {new Date(memo.timestamp * 1000).toLocaleString()}</p>
          </div>
        )
      }))}

      <footer className={styles.footer}>
        <a
          href="https://alchemy.com/?a=roadtoweb3weektwo"
          target="_blank"
          rel="noopener noreferrer"
        >
          Based on @thatguyintech Replit  for Alchemy's Road to Web3 lesson two!
        </a>
      </footer>
    </div>
  )
}
