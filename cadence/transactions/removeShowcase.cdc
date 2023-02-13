import "Flowcase" from 0xFLOWCASE

transaction(showcaseName: String) {
    let flowcase: &Flowcase.Showcase

    prepare(signer: AuthAccount) {
        self.flowcase = signer.borrow<&Flowcase.Showcase>(from: /storage/flowcaseCollection) ??
            panic("Could not borrow a reference to the Flowcase")
    }

    execute {
        self.flowcase.removeShowcase(showcaseName: showcaseName)
    }
}
