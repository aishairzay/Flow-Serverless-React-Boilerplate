/** pragma type contract **/

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  deployContract,
} from '@onflow/flow-cadut'

export const CODE = `
import NonFungibleToken from "./NonFungibleToken.cdc"

// A way to create and store groupings of NFTs in a showcase
pub contract Flowcase {

    init() {
        // Intentionally left blank
    }

    pub struct NFTPointer {
        pub let id: UInt64
        pub let collection: Capability<&{NonFungibleToken.CollectionPublic}>

        init(id: UInt64, collection: Capability<&{NonFungibleToken.CollectionPublic}>) {
            self.id = id
            self.collection = collection
        }
    }

    pub struct Showcase {
        pub let name: String
        priv let nfts: [NFTPointer]

        init(name: String, nfts: [NFTPointer]) {
            self.name = name
            self.nfts = nfts
        }

        pub fun getNFTs(): [NFTPointer] {
            return self.nfts
        }
    }

    pub event ShowcaseAdded(name: String, to: Address?)
    pub event ShowcaseRemoved(name: String)

    pub resource interface ShowcaseCollectionPublic {
        pub fun getShowcases(): {String: Showcase}
        pub fun getShowcase(name: String): Showcase?
    }

    pub resource ShowcaseCollection: ShowcaseCollectionPublic {
        pub let showcases: {String: Showcase}

        init() {
            self.showcases = {}
        }

        pub fun addShowcase(name: String, nfts: [NFTPointer]) {
            emit ShowcaseAdded(name: name, to: self.owner?.address)
            self.showcases[name] = Showcase(name: name, nfts: nfts)
        }

        pub fun removeShowcase(name: String) {
            self.showcases.remove(key: name)
        }

        pub fun getShowcases(): {String: Showcase} {
            return self.showcases
        }

        pub fun getShowcase(name: String): Showcase? {
            return self.showcases[name]
        }
    }

    pub fun createShowcaseCollection(): @ShowcaseCollection {
        return <-create ShowcaseCollection()
    }

}

`;

/**
* Method to generate cadence code for Flowcase contract
* @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
*/
export const FlowcaseTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
  ...envMap,
  ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `Flowcase =>`)

  return replaceImportAddresses(CODE, fullMap);
};


/**
* Deploys Flowcase transaction to the network
* @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
* @param Array<*> args - list of arguments
* param Array<string> - list of signers
*/
export const  deployFlowcase = async (props) => {
  const { addressMap = {} } = props;
  const code = await FlowcaseTemplate(addressMap);
  const name = "Flowcase"

  return deployContract({ code, name, processed: true, ...props })
}