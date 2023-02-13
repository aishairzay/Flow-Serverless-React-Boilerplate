/** pragma type transaction **/

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  reportMissing,
  sendTransaction
} from '@onflow/flow-cadut'

export const CODE = `
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

`;

/**
* Method to generate cadence code for removeShowcase transaction
* @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
*/
export const removeShowcaseTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
  ...envMap,
  ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `removeShowcase =>`)

  return replaceImportAddresses(CODE, fullMap);
};


/**
* Sends removeShowcase transaction to the network
* @param {Object.<string, string>} props.addressMap - contract name as a key and address where it's deployed as value
* @param Array<*> props.args - list of arguments
* @param Array<*> props.signers - list of signers
*/
export const removeShowcase = async (props = {}) => {
  const { addressMap, args = [], signers = [] } = props;
  const code = await removeShowcaseTemplate(addressMap);

  reportMissing("arguments", args.length, 1, `removeShowcase =>`);
  reportMissing("signers", signers.length, 1, `removeShowcase =>`);

  return sendTransaction({code, processed: true, ...props})
}