export type VerbConfig = {
  label: string;
};

const VERB_CONFIG: Record<string, VerbConfig> = {
  expense: { label: 'New expense added' },
  update_expense: { label: 'Expense was updated' },
  delete_expense: { label: 'Expense was removed' },
  restore_expense: { label: 'Expense was restored' },
  payment: { label: 'Payment recorded' },
  update_payment: { label: 'Payment was updated' },
  delete_payment: { label: 'Payment was removed' },
  restore_payment: { label: 'Payment was restored' },
  settle_up: { label: 'All settled up' },
  restore_activity: { label: 'Activity was restored' },
  comment: { label: 'New comment' },
};

const FALLBACK_CONFIG: VerbConfig = { label: 'Activity' };

export function getVerbConfig(verb: string): VerbConfig {
  return VERB_CONFIG[verb] ?? FALLBACK_CONFIG;
}
