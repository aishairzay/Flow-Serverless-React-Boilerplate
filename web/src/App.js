import { useState, useEffect } from 'react';
import './flowConfig';
import * as fcl from "@onflow/fcl";
import { getNFTsFromAccount, getShowcases } from './cadut/scripts';
import { mintNFT, createShowcase, removeShowcase } from './cadut/transactions';
import NFTView from './NFTView';

function App() {
  const [user, setUser] = useState({ addr: null, loggedIn: null })
  useEffect(() => { fcl.currentUser().subscribe(setUser) }, [setUser] )

  const [myNFTs, setMyNFTs] = useState([])
  const [showcases, setShowcases] = useState([])
  const [showcaseInput, setShowcaseInput] = useState("")
  const [showcaseName, setShowcaseName] = useState("")

  useEffect(() => {
    const run = async () => {
      if (user.loggedIn) {
        const myNFTs = await getNFTsFromAccount({
          args: [fcl.withPrefix(user.addr)],
        });
        setMyNFTs(myNFTs[0].map((nft) => { return { ...nft, selected: false } }) )
        setShowcaseInput(fcl.withPrefix(user.addr))
        getShowcasesForAddress(fcl.withPrefix(user.addr))
      }
    }
    run()
  }, [user])

  const getShowcasesForAddress = async (address) => {
    const showcases = await getShowcases({
      args: [address],
    });
    setShowcases(showcases[0] || [])
  }

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
              Create a showcase from selections
            </button>
          </form>
          <hr />
          <h3>Showcases:</h3>
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                getShowcasesForAddress(showcaseInput)
              }}
            >
              <label>Enter an account address to see their showcases:</label>
              <input type="text" value={showcaseInput} onChange={(e) => setShowcaseInput(e.target.value)} />
              <button type="button" onClick={() => getShowcasesForAddress(showcaseInput)}>Get showcases</button>
            </form>
            <br />
            {
              Object.keys(showcases).map((showcaseName, i) => {
                return (
                  <div key={showcaseName}>
                    <h4 style={{marginBottom: '2px'}}>
                      Showcase {i+1} - {showcaseName}
                      <br />
                      {Object.keys(showcases[showcaseName]).length} NFTs
                    </h4>
                    {
                      showcases[showcaseName].map((nft, i) => {
                        return <NFTView key={`${showcaseName}-${i}`} { ...nft }/>
                      })
                    }
                    <button onClick={async () => {
                      await removeShowcase({
                        args: [showcaseName],
                        signers: [fcl.authz],
                        payer: fcl.authz,
                        proposer: fcl.authz
                      })

                    }}>
                      Delete this showcase
                    </button>
                  </div>
                )
              })
            }
            {Object.keys(showcases).length === 0 && <div>No showcases in selected account, or invalid account provided</div>}
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
