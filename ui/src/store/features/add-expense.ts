import {PayloadAction, createSlice} from '@reduxjs/toolkit';

interface ExpenseParticipant {
  type: 'group' | 'friend';
  id: string;
  name: string;
}

export const addExpenseSlice = createSlice({
  name: 'addExpense',
  initialState: {
    participants: [] as ExpenseParticipant[],
    isParticipantsSearchActive: false,
  },
  reducers: {
    addParticipant(state, action: PayloadAction<ExpenseParticipant>) {
      const existingParticipantIds = state.participants.map((p) => p.id);
      if (existingParticipantIds.includes(action.payload.id)) {
        return;
      }

      state.participants = [...state.participants, action.payload];
    },
    removeParticipant(state, action: PayloadAction<string>) {
      state.participants = state.participants.filter((p) => p.id !== action.payload);
    },
    removeParticipants(state, action: PayloadAction<string[]>) {
      state.participants = state.participants.filter((p) => !action.payload.includes(p.id));
    },
    toggleSearchActive(state, action: PayloadAction<boolean | undefined>) {
      state.isParticipantsSearchActive = action.payload ?? !state.isParticipantsSearchActive;
    },
  },
  selectors: {},
});

// Action creators are generated for each case reducer function
export const {addParticipant, removeParticipant, removeParticipants, toggleSearchActive} =
  addExpenseSlice.actions;

export default addExpenseSlice.reducer;
