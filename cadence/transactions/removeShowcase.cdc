import Flowcase from 0xFLOWCASE

transaction(showcaseName: String) {
    let flowcase: &Flowcase.ShowcaseCollection

    prepare(signer: AuthAccount) {
        self.flowcase = signer.borrow<&Flowcase.ShowcaseCollection>(from: /storage/flowcaseCollection) ??
            panic("Could not borrow a reference to the Flowcase")
    }

    execute {
        self.flowcase.removeShowcase(name: showcaseName)
    }
}
