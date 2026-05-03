import { CurrencySelectFormInput, TextFormInput } from '@/components/form-controls';

export function ExpenseOptions() {
  return (
    <div className="space-y-4">
      <CurrencySelectFormInput
        name="currency"
        label="Currency"
      />
      <TextFormInput
        name="datetime:iso"
        label="Date & Time"
        type="datetime-local"
      />
    </div>
  );
}
