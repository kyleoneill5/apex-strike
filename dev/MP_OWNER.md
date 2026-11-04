# Pinning the multiplayer owner

`window.MP_OWNER_PUB` is not pinned in this build. Until a pin is set, **the room host is the owner** (any host). That is temporary. Do not invent a key.

Kyle's iPhone already generates the real key the first time it hosts (`localStorage` `mp_owner_key`). On that phone, after the game has loaded, read the public half:

```js
await __mp.ownerPub()
```

That string is an SPKI public key, base64. Paste it into the build in **one** of these places (they are checked in this order on every host/join, so you can set them without rebuilding):

1. URL: `?mpowner=` + `encodeURIComponent(key)`
2. `localStorage.setItem('MP_OWNER_PUB', key)` on that device
3. An inline script **before** the game module: `window.MP_OWNER_PUB = key`

After the pin is set, a peer is the owner only when the public half of their stored `mp_owner_key` matches the pin. Everyone else is a normal player: reserved gamer tags are rejected, UFOs and spacecraft stay locked, the aimbot and mod menu stay closed, and the Air Defense killstreak unlocks at 7 kills instead of being granted immediately.

Reserved tags (non-owners): `kyle`, `kyleoneill`, `kyleoneill5`, `dominion`, `owner`, `ceo`, `admin`. Override the list with `window.MP_RESERVED` if it ever needs to change. Matching is case-insensitive and longest-first, so `kyleoneill5` is blocked as a whole tag and not shortened to a leftover.

## Local two-peer test (not shipped)

`src/mp_relay.js` is test-only and is **not** in `dev/merged.html`. The release page uses the public PeerJS broker.

To prove two browsers on one machine:

```sh
node dev/scripts/relay.mjs 8931
# open both peers with
# ?mptest&mprelay=ws://localhost:8931
```

The test page that includes the relay shim is built by `dev/scripts/build_pages.py` as `dev/test_mp.html` and is not part of the release.
