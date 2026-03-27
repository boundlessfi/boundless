import * as Client from 'reputation-registry';
import { rpcUrl, networkPassphrase } from './util';

export default new Client.Client({
  ...Client.networks.testnet,
  rpcUrl,
  networkPassphrase,
});

export { Client as ReputationRegistryTypes };
