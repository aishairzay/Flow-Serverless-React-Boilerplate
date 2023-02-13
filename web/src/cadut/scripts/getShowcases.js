/** pragma type script **/

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  reportMissing,
  executeScript
} from '@onflow/flow-cadut'

export const CODE = `
import NonFungibleToken from 0xNONFUNGIBLETOKENADDRESS
import MetadataViews from 0xMETADATAVIEWSADDRESS
import Flowcase from 0xFLOWCASEADDRESS

pub fun main(address: Address): {String: [AnyStruct]}? {
    let account = getAccount(address)
    var nfts: [AnyStruct] = []
    let flowcaseCap = account.getCapability<&{Flowcase.ShowcaseCollectionPublic}>(/public/flowcaseCollection)
        .borrow()

    if flowcaseCap != nil {
        let showcases = flowcaseCap!.getShowcases()
        let allShowcases: {String: [AnyStruct]} = {}
        for showcaseName in showcases.keys {
            let nfts: [AnyStruct] = []
            let showcase = showcases[showcaseName]!
            let nftCaps = showcase.getNFTs()
            for nftPointer in nftCaps {
                let borrowedNFT = nftPointer.collection.borrow()!.borrowNFT(id: nftPointer.id)
                let displayView = borrowedNFT.resolveView(Type<MetadataViews.Display>())
                let nftView: AnyStruct = {
                    "nftID": borrowedNFT.id,
                    "display": displayView,
                    "type": borrowedNFT.getType().identifier
                }
                nfts.append(nftView)
            }
            allShowcases[showcaseName] = nfts
        }
        return allShowcases
    }
    return {}
}

`;

/**
* Method to generate cadence code for getShowcases script
* @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
*/
export const getShowcasesTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
  ...envMap,
  ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `getShowcases =>`)

  return replaceImportAddresses(CODE, fullMap);
};

export const getShowcases = async (props = {}) => {
  const { addressMap = {}, args = [] } = props
  const code = await getShowcasesTemplate(addressMap);

  reportMissing("arguments", args.length, 1, `getShowcases =>`);

  return executeScript({code, processed: true, ...props})
}