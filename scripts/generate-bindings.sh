#!/usr/bin/env bash
# Generate TypeScript bindings for all Boundless Soroban contracts.
# Frontend version — keeps ESM output (Next.js bundler handles it natively).
#
# Usage: ./scripts/generate-bindings.sh [testnet|mainnet]

set -euo pipefail

NETWORK="${1:-testnet}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/bindings"
CLIENTS_DIR="$ROOT_DIR/lib/stellar/clients"
PASSPHRASE=""
RPC_URL=""

case "$NETWORK" in
  testnet)
    PASSPHRASE="Test SDF Network ; September 2015"
    RPC_URL="${STELLAR_RPC_URL:-https://soroban-testnet.stellar.org}"
    ;;
  mainnet)
    PASSPHRASE="Public Global Stellar Network ; September 2015"
    RPC_URL="${STELLAR_RPC_URL:-https://soroban-rpc.mainnet.stellar.org}"
    ;;
  *)
    echo "Unknown network: $NETWORK (use testnet or mainnet)"
    exit 1
    ;;
esac

# ── Contract addresses ──────────────────────────────────────────────────────
NAMES=(
  core-escrow
  reputation-registry
  governance-voting
  project-registry
  bounty-registry
  crowdfund-registry
  grant-hub
  hackathon-registry
)
IDS=(
  "${CORE_ESCROW_ADDRESS:-CA3VZVIMGLVG5EJF2ACB3LPMGQ6PID4TJTB3D2B3L6JIZRIS7NQPVPHN}"
  "${REPUTATION_REGISTRY_ADDRESS:-CBVQEDH4T5KOJQSESL2HEFI2YZWXPSZQ5TASKRNWAVZFIWAKEU74RFF4}"
  "${GOVERNANCE_VOTING_ADDRESS:-CDVU77G53WQ4P24GBUPGJYGCDV3QSF6UWHQIHV7BCMGSUZAEA3IW6PSU}"
  "${PROJECT_REGISTRY_ADDRESS:-CCG4QM2GZKBN7GBRAE3PFNE3GM2B6QRS7FOKLHGV2FT2HHETIS7JUVYT}"
  "${BOUNTY_REGISTRY_ADDRESS:-CBWXIV3DERH4GKADOTEEI2QADGZAMMJT4T2B5LFVZULGHEP5BACK2TLY}"
  "${CROWDFUND_REGISTRY_ADDRESS:-CBH5URRJX6A34P5XJ2RWHYGQK4HXICO2OTTYLFZEM55FCI2XAW6QCOKN}"
  "${GRANT_HUB_ADDRESS:-CAWFSZRB4PM3UPXAF7GTIDWS3OTAVMHN2ZPYZVG4DUIE2BLBUBAER5YL}"
  "${HACKATHON_REGISTRY_ADDRESS:-CDLV7OEETJ5WYP2VTKJHPE5AWBQA4JJKNI4XRLIFPRRSKBDKQO67ZPMG}"
)
CAMEL_NAMES=(
  coreEscrow
  reputationRegistry
  governanceVoting
  projectRegistry
  bountyRegistry
  crowdfundRegistry
  grantHub
  hackathonRegistry
)
PASCAL_NAMES=(
  CoreEscrow
  ReputationRegistry
  GovernanceVoting
  ProjectRegistry
  BountyRegistry
  CrowdfundRegistry
  GrantHub
  HackathonRegistry
)

# ── Preflight checks ────────────────────────────────────────────────────────
if ! command -v stellar &>/dev/null; then
  echo "Error: 'stellar' CLI not found. Install it first:"
  echo "  cargo install --locked stellar-cli"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"
mkdir -p "$CLIENTS_DIR"

echo "Generating TypeScript bindings for $NETWORK (frontend/ESM)"
echo "Output directory: $OUTPUT_DIR"
echo "Clients directory: $CLIENTS_DIR"
echo "RPC URL: $RPC_URL"
echo ""

FAILED=()

for i in "${!NAMES[@]}"; do
  CONTRACT_NAME="${NAMES[$i]}"
  CONTRACT_ID="${IDS[$i]}"
  CAMEL_NAME="${CAMEL_NAMES[$i]}"
  PASCAL_NAME="${PASCAL_NAMES[$i]}"

  if [[ -z "$CONTRACT_ID" ]]; then
    echo "⏭  Skipping $CONTRACT_NAME (no address set)"
    continue
  fi

  CONTRACT_OUT="$OUTPUT_DIR/$CONTRACT_NAME"
  echo "── $CONTRACT_NAME ($CONTRACT_ID)"

  # Step 1: Generate TypeScript bindings
  if stellar contract bindings typescript \
    --contract-id "$CONTRACT_ID" \
    --network "$NETWORK" \
    --output-dir "$CONTRACT_OUT" \
    --network-passphrase "$PASSPHRASE" \
    --rpc-url "$RPC_URL" \
    --overwrite; then
    echo "   ✓ Bindings generated at $CONTRACT_OUT"
  else
    echo "   ✗ Failed to generate bindings"
    FAILED+=("$CONTRACT_NAME")
    echo ""
    continue
  fi

  # Step 2: Install dependencies and build
  echo "   → Installing dependencies & building..."
  if (cd "$CONTRACT_OUT" && npm install && npm run build) 2>&1 | sed 's/^/     /'; then
    echo "   ✓ Built successfully"
  else
    echo "   ✗ Build failed"
    FAILED+=("$CONTRACT_NAME")
    echo ""
    continue
  fi

  echo ""

  # Step 3: Generate typed client import file
  CLIENT_FILE="$CLIENTS_DIR/$CAMEL_NAME.ts"

  cat > "$CLIENT_FILE" <<EOF
import * as Client from '$CONTRACT_NAME';
import { rpcUrl, networkPassphrase } from './util';

export default new Client.Client({
  ...Client.networks.${NETWORK},
  rpcUrl,
  networkPassphrase,
});

export { Client as ${PASCAL_NAME}Types };
EOF

  echo "   ✓ Client import: $CLIENT_FILE"
  echo ""
done

# ── Generate shared util file ────────────────────────────────────────────────
UTIL_FILE="$CLIENTS_DIR/util.ts"
if [[ ! -f "$UTIL_FILE" ]]; then
  cat > "$UTIL_FILE" <<'EOF'
/**
 * Shared config for generated contract clients.
 * Values are read from environment at runtime via stellar.config.
 */

export const rpcUrl =
  process.env.STELLAR_RPC_URL ||
  (process.env.STELLAR_NETWORK === 'mainnet'
    ? 'https://soroban-rpc.mainnet.stellar.org'
    : 'https://soroban-testnet.stellar.org');

export const networkPassphrase =
  process.env.STELLAR_NETWORK_PASSPHRASE ||
  (process.env.STELLAR_NETWORK === 'mainnet'
    ? 'Public Global Stellar Network ; September 2015'
    : 'Test SDF Network ; September 2015');
EOF
  echo "Created shared util: $UTIL_FILE"
fi

# ── Generate barrel index ────────────────────────────────────────────────────
INDEX_FILE="$CLIENTS_DIR/index.ts"
{
  echo "// Auto-generated barrel export for contract clients"
  echo "// Re-run scripts/generate-bindings.sh to regenerate"
  echo ""
  for i in "${!NAMES[@]}"; do
    CAMEL_NAME="${CAMEL_NAMES[$i]}"
    PASCAL_NAME="${PASCAL_NAMES[$i]}"
    echo "export { default as ${CAMEL_NAME} } from './${CAMEL_NAME}';"
    echo "export { ${PASCAL_NAME}Types } from './${CAMEL_NAME}';"
  done
} > "$INDEX_FILE"
echo "Created barrel index: $INDEX_FILE"

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
if [[ ${#FAILED[@]} -gt 0 ]]; then
  echo "Done with errors. Failed contracts: ${FAILED[*]}"
  exit 1
else
  echo "All bindings generated, built, and client imports created in:"
  echo "  Bindings: $OUTPUT_DIR"
  echo "  Clients:  $CLIENTS_DIR"
  echo ""
  echo "Next: add to package.json dependencies:"
  echo '  "reputation-registry": "file:bindings/reputation-registry"'
fi
