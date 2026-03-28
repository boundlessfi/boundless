import * as Client from 'crowdfund-registry';
import { rpcUrl, networkPassphrase } from './util';

export default new Client.Client({
  ...Client.networks.testnet,
  rpcUrl,
  networkPassphrase,
});

export { Client as CrowdfundRegistryTypes };
