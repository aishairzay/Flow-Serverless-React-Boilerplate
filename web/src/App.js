import { useState, useEffect } from 'react';
import './flowConfig';
import * as fcl from "@onflow/fcl";
import { getNFTsFromAccount, getShowcases } from './cadut/scripts';
import { mintNFT, createShowcase, removeShowcase } from './cadut/transactions';
import NFTView from './NFTView';
import Showcases from './Showcases';

function App() {
  const [user, setUser] = useState({ addr: null, loggedIn: null })
  useEffect(() => { fcl.currentUser().subscribe(setUser) }, [setUser] )

  const [myNFTs, setMyNFTs] = useState([])
  const [showcaseName, setShowcaseName] = useState("")

  useEffect(() => {
    const run = async () => {
      if (user.loggedIn) {
        const myNFTs = await getNFTsFromAccount({
          args: [fcl.withPrefix(user.addr)],
        });
        setMyNFTs(myNFTs[0].map((nft) => { return { ...nft, selected: false } }) )
      }
    }
    run()
  }, [user])

  return (
    <div>
      {user.loggedIn === null && (
        <button onClick={() => { fcl.logIn() }}>Connect Wallet</button>
      )}
      
      {user.loggedIn && (
        <div>
          <button onClick={() => { fcl.unauthenticate() }}>Logout</button>
          <div>Address: {user.addr}</div>
          <button onClick={() => {
            
            mintNFT({
              args: ["1"], // mint edition 1 from the nft contract,
              signers: [fcl.authz], // Sign the transaction with the fcl authz user
              payer: fcl.authz, // Pay the transaction fee with the fcl authz user
              proposer: fcl.authz // Propose the transaction with the fcl authz user
            })
          }}>
            Mint a new edition 1 NFT
          </button>
          <hr />
          <h3>My NFTs:</h3>
          <div>
            {
              myNFTs.map((curNFT, i) => {
                return <div key={i}>
                  <h4 style={{ marginBottom: "2px" }}>NFT {i + 1}</h4>
                  <NFTView { ...curNFT }/>
                  <label>
                    <input type="checkbox" checked={myNFTs[i].selected} onChange={
                      (e) => {
                        const newNFTs = [...myNFTs]
                        newNFTs[i].selected = e.target.checked
                        setMyNFTs(newNFTs)
                      }
                    } />
                    Select for showcase
                  </label>
                </div>
              })
            }
            {myNFTs.length === 0 && <div>No NFTs in your account yet</div>}
          </div>
          <form>
            <br />
            <input type="text" value={showcaseName} onChange={(e) => setShowcaseName(e.target.value)} placeholder="Enter Showcase Name" />
            <button type="button" onClick={async () => {
                const selectedNFTs = myNFTs.filter((nft) => {
                  return nft.selected
                })
                await createShowcase({
                  args: [
                    showcaseName,
                    selectedNFTs.map((nft) => `/public/${nft.publicPath.identifier}`),
                    selectedNFTs.map((nft) => nft.nftID)
                  ],
                  signers: [fcl.authz],
                  payer: fcl.authz,
                  proposer: fcl.authz
                })
              }}
            >
              Create Showcase
            </button>
          </form>
          <hr />
          <Showcases user={user} />
        </div>
      )}

    </div>
  );
}

export default App;
