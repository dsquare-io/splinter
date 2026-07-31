type TabMessage = { type: 'logout' };

const CHANNEL_NAME = 'splinter-tabs';

const channel = 'BroadcastChannel' in globalThis ? new BroadcastChannel(CHANNEL_NAME) : null;

/**
 * Tell every other tab this session ended. Besides the obvious — they must not keep showing
 * a logged-in UI — their open IndexedDB connections are what makes deleting the local
 * databases block, so reloading them is what lets the wipe in rxdb.ts actually go through.
 */
export function broadcastLogout(): void {
  channel?.postMessage({ type: 'logout' } satisfies TabMessage);
}

/** Wire up cross-tab signal handling for this tab. Call once, at startup. */
export function listenToOtherTabs(): void {
  // A BroadcastChannel never delivers to the instance that sent the message, so this only
  // ever runs in the *other* tabs — the one logging out reloads itself.
  channel?.addEventListener('message', (event: MessageEvent<TabMessage>) => {
    if (event.data?.type === 'logout') window.location.reload();
  });
}
