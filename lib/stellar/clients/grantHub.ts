import * as Client from 'grant-hub';
import { rpcUrl, networkPassphrase } from './util';

export default new Client.Client({
  ...Client.networks.testnet,
  rpcUrl,
  networkPassphrase,
});

export { Client as GrantHubTypes };
