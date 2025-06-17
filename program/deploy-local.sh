#!/usr/bin/env bash

set -e

KEYPAIR_PATH="target/deploy/community_voting-keypair.json"
ANCHOR_TOML="anchor.toml"
LIB_RS="programs/community-voting/src/lib.rs"

# Step 1: Clean and remove old keypair
anchor clean
rm -f "$KEYPAIR_PATH"

# Step 2: Generate new keypair
echo "Generating a new keypair..."
PUBKEY_OUTPUT=$(solana-keygen new -o "$KEYPAIR_PATH" --no-bip39-passphrase)
echo "$PUBKEY_OUTPUT"

# Step 3: Extract pubkey (portable)
NEW_PUBKEY=$(echo "$PUBKEY_OUTPUT" | awk '/pubkey:/ {print $2}')

if [ -z "$NEW_PUBKEY" ]; then
  echo "❌ Failed to extract pubkey. Exiting."
  exit 1
fi

echo "✅ New pubkey: $NEW_PUBKEY"

# Step 4: Update anchor.toml
echo "🔧 Updating anchor.toml..."
sed -i.bak "s/^\(community_voting *= *\"\)[^\"]*\"/\1$NEW_PUBKEY\"/" "$ANCHOR_TOML"

# Step 5: Update declare_id in lib.rs
echo "🔧 Updating declare_id in src/lib.rs..."
sed -i.bak "s/^\(declare_id!(\"\)[^\"]*/\1$NEW_PUBKEY/" "$LIB_RS"

# Step 6: Build and deploy
echo "🚀 Building and deploying Anchor program..."
anchor build
anchor deploy

echo "✅ Deployment complete!"
