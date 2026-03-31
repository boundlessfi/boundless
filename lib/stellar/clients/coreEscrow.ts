import * as Client from 'core-escrow';
import { rpcUrl, networkPassphrase } from './util';

export default new Client.Client({
  ...Client.networks.testnet,
  rpcUrl,
  networkPassphrase,
});

export { Client as CoreEscrowTypes };
