/** pragma type transaction **/

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  reportMissing,
  sendTransaction
} from '@onflow/flow-cadut'

export const CODE = `
import NonFungibleToken from 0xNONFUNGIBLETOKEN
import Flowcase from 0xFLOWCASE

transaction(showcaseName: String, publicPaths: [PublicPath], nftIDs: [UInt64]) {
    let showcaseCollection: &Flowcase.ShowcaseCollection
    let showcaseAccount: PublicAccount

    prepare(signer: AuthAccount) {
        if signer.borrow<&Flowcase.ShowcaseCollection>(from: /storage/flowcaseCollection) == nil {
            let collection <- Flowcase.createShowcaseCollection()
            signer.save(<-collection, to: /storage/flowcaseCollection)
        }

        signer.link<&{Flowcase.ShowcaseCollectionPublic}>(/public/flowcaseCollection, target: /storage/flowcaseCollection)

        self.showcaseCollection = signer.borrow<&Flowcase.ShowcaseCollection>(from: /storage/flowcaseCollection) ??
            panic("Could not borrow a reference to the Flowcase ShowcaseCollection")

        self.showcaseAccount = getAccount(signer.address)
    }

    execute {
        var showcaseNFTs: [Flowcase.NFTPointer] = []

        var i = 0
        while (i < publicPaths.length) {
            let publicPath = publicPaths[i]
            let nftID = nftIDs[i]
            showcaseNFTs.append(Flowcase.NFTPointer(id: nftID, collection: self.showcaseAccount.getCapability<&{NonFungibleToken.CollectionPublic}>(publicPath)))
            i = i + 1
        }

        self.showcaseCollection.addShowcase(name: showcaseName, nfts: showcaseNFTs)
    }
}

`;

/**
* Method to generate cadence code for createShowcase transaction
* @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
*/
export const createShowcaseTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
  ...envMap,
  ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `createShowcase =>`)

  return replaceImportAddresses(CODE, fullMap);
};


/**
* Sends createShowcase transaction to the network
* @param {Object.<string, string>} props.addressMap - contract name as a key and address where it's deployed as value
* @param Array<*> props.args - list of arguments
* @param Array<*> props.signers - list of signers
*/
export const createShowcase = async (props = {}) => {
  const { addressMap, args = [], signers = [] } = props;
  const code = await createShowcaseTemplate(addressMap);

  reportMissing("arguments", args.length, 3, `createShowcase =>`);
  reportMissing("signers", signers.length, 1, `createShowcase =>`);

  return sendTransaction({code, processed: true, ...props})
}