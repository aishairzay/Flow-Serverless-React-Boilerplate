import NonFungibleToken from 0xNONFUNGIBLETOKEN
import Flowcase from 0xFLOWCASE

transaction(showcaseName: String, publicPaths: [PublicPath], nftIDs: [UInt64]) {
    let showcaseCollection: &Flowcase.ShowcaseCollection
    let showcaseAccount: PublicAccount

    prepare(signer: AuthAccount) {
        if signer.borrow<&Flowcase.ShowcaseCollection>(from: /storage/flowcaseCollection) == nil {
            let collection <- Flowcase.createEmptyCollection()
            signer.save(<-collection, to: /storage/flowcaseCollection)
        }

        signer.link<&{Flowcase.ShowcaseCollectionPublic}>(/public/flowcaseCollection, target: /storage/flowcaseCollection)

        self.flowcaseCollection = signer.borrow<&Flowcase.Showcase>(from: /storage/flowcaseCollection) ??
            panic("Could not borrow a reference to the Flowcase")

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

        self.showcaseCollection.addShowcase(showcaseName: showcaseName, nfts: showcaseNFTs)
    }
}
