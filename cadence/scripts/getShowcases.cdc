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
