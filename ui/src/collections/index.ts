// Side-effect barrel: importing this module registers every entity's RxDB collection and
// event-bus subscription (see events.ts), regardless of which route the user lands on
// first. Imported once, eagerly, from src/main.tsx.
export * from './friends.ts';
export * from './outstandingBalances.ts';
export * from './groups.ts';
export * from './profile.ts';
export * from './currencyPreference.ts';
