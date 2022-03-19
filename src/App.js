import "./App.css";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import Web3 from "web3";
import RYUKABI from "./contracts/RyukNFT.json";
import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [nftdata, setNftdata] = useState([]); // To store NFT array
  const [balance, setBalance] = useState("0"); // TO display Total Minted Token
  const [address, setAddress] = useState(null); // To display current Wallet address
  const [reload, shouldReload] = useState(true); // To show Loading Screen
  const [web3api, setweb3api] = useState({
    // For Storing web3 data,contract deployed and address of Contract Deployed
    web3: null,
    contract: null,
    account: null,
  });

  const apikey = "T3BYWU4P1MTNMZX99S1K38YSZNWYHWV5B1"; // API Key From Etherscan
  const endpoint = "https://api-rinkeby.etherscan.io/api"; //constant value of endpoint
  const nftpng =
    "https://ipfs.io/ipfs/QmQ1L59Ma9MhhyZfGTyF1W7scgc1YMe12Eg2vcYsFA6Cf1/"; // const path for ipfs image location

  // Connecting Metamask Wallet
  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        var web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        var accounts = await web3.eth.getAccounts();
        setAddress(accounts[0]);

        const networkid = await web3.eth.net.getId();
        const networkdata = RYUKABI.networks[networkid];
        if (networkdata) {
          var contracts = new web3.eth.Contract(
            RYUKABI.abi,
            networkdata.address
          );
          setweb3api({
            contract: contracts,
            web3: web3,
            account: networkdata.address,
          });
        shouldReload(false);
      } else {
        window.alert("This Smart Contract is not deployed to current network!");
      }
    }
    };
    connectWallet();
  }, []);

  // API call for Loading Tokens from EtherScan
  useEffect(() => {
    const source = axios.CancelToken.source();
    const loadTokens = async () => {
      const { account } = web3api;
      try {
        const response = await axios.get(
          endpoint +
            `?module=stats&action=tokensupply&contractaddress=${account}&apikey=${apikey}`,
          { cancelToken: source.token }
        );
        setBalance(response.data.result);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Axios canceled on loadTokens");
        } else {
          console.log(err);
        }
      }
    };
    loadTokens();
    return () => source.cancel();
  }, [reload, web3api]);

  // API call for Loading NFTS on screen from EtherScan
  useEffect(() => {
    const source = axios.CancelToken.source();
    if (balance > 0) {
      const loadNFTs = async () => {
        const { account } = web3api;
        try {
          const response = await axios.get(
            endpoint +
              `?module=account&action=tokennfttx&contractaddress=${account}&page=1&offset=100&tag=latest&apikey=${apikey}`,
            { cancelToken: source.token }
          );
          let { result } = response.data;
          setNftdata(result);
          console.log(nftdata, "Data From API");
        } catch (err) {
          if (axios.isCancel(err)) {
            console.log("Axios canceled on loadNFT func");
          } else {
            console.log("error");
          }
        }
      };
      loadNFTs();
    }
    return () => source.cancel();
  }, [balance]);

  // Mint Function for minting of the tokens
  async function mint() {
    shouldReload(true);
    const { contract } = web3api;
    if (window.ethereum) {
      var _mintAmount = Number(document.querySelector("[name=amount]").value);
      var mintRate = Number(await contract.methods.cost().call());
      var totalAmount = mintRate * _mintAmount;
      await contract.methods
        .mint(address, _mintAmount)
        .send({ from: address, value: String(totalAmount) });
    }
    shouldReload(false);
  }

  //To Show Loading on Screen when transaction is going on
  if (reload) {
    return (
      <>
        <h3 className=" mt-5 text-center text-white">Loading...</h3>
      </>
    );
  }

  return (
    <div className="App">
      <div className="container">
        <div className="row justify-content-center">
          <hr></hr>
          <hr></hr>
          <form
            class="gradient image col-lg-5 mt-5 w-50 p-3"
            style={{ borderRadius: "25px", boxShadow: "1px 1px 15px #000000" }}
          >
            <h4 style={{ color: "#FFFFFF" }}>Mint Portal</h4>
            <h5 style={{ color: "#FFFFFF" }}>Please connect your wallet</h5>
            <div
              class="card"
              id="wallet-address"
              style={{ marginTop: "3px", boxShadow: "1px 1px 4px #000000" }}
            >
              <label for="floatingInput">
                {" "}
                <b>Current Address : </b>
                <i style={{ color: "#000000" }}>
                  {address ? address : <label> Wallet Address </label>}
                </i>
              </label>
            </div>
            <div
              class="card"
              style={{ marginTop: "3px", boxShadow: "1px 1px 4px #000000" }}
            >
              <input
                type="number"
                name="amount"
                defaultValue="1"
                min="1"
                max="5"
              />
              <label>Please select the amount of NFTs to mint.</label>
              <Button onClick={mint}>Buy/Mint!</Button>
            </div>
            <label style={{ color: "#FFFFFF" }}>
              Price 0.05 ETH each mint.
            </label>
            <h5 style={{ color: "white" }}>
              Tokens Minted so far: {balance}/1000
            </h5>
          </form>

          <div className="row items mt-3">
            <div
              className="ml-3 mr-3"
              style={{
                display: "inline-grid",
                gridTemplateColumns: "repeat(4, 5fr)",
                columnGap: "10px",
              }}
            >
              {nftdata.map((result) => {
                return (
                  <div className="card card1">
                    <div className="image-over">
                      <img
                        className="card-img-top"
                        src={nftpng + (result.tokenID % 11) + ".png"}
                        alt=""
                      />
                    </div>
                    <div className="card-caption col-12 p-0">
                      <div className="card-body">
                        <h5 className="mb-0">
                          RYUK NFT Collection #{result.tokenID}
                        </h5>
                        <h6
                          className="mb-0 mt-1 "
                          style={{ color: "#7575a3", font: "bold" }}
                        >
                          <b>Owner Wallet : </b>
                          <p> {result.to}</p>
                        </h6>
                        <div className="card-bottom d-flex justify-content-between">
                          <Button
                            id="unique-id"
                            className="btn btn-bordered-white btn-smaller mt-3"
                          >
                            <i className="mr-2" />
                            Buy Now
                          </Button>
                          <h6 className="mt-4 font-bold">Price : 0.10 ETH</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
