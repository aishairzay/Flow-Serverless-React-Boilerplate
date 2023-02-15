import { useState, useEffect } from 'react';
import * as fcl from "@onflow/fcl";
import { getShowcases } from './cadut/scripts';
import { createShowcase, removeShowcase } from './cadut/transactions';
import NFTView from './NFTView';

function Showcases({ user }) {
  const [showcases, setShowcases] = useState([])

  useEffect(() => {
    const run = async () => {
      if (user.loggedIn) {
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
      <h3>Showcases:</h3>
      <div>
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
        {Object.keys(showcases).length === 0 && <div>No showcases in account</div>}
      </div>
    </div>
  );
}

export default Showcases;
