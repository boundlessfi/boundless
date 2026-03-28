import * as Client from 'project-registry';
import { rpcUrl, networkPassphrase } from './util';

export default new Client.Client({
  ...Client.networks.testnet,
  rpcUrl,
  networkPassphrase,
});

export { Client as ProjectRegistryTypes };
