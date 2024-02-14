import { createSlice } from '@reduxjs/toolkit'

export const addExpenseSlice = createSlice({
  name: 'addExpense',
  initialState: {
    selectedExpenseParties: [] as string[],
    test: 123,
  },
  reducers: {
    addParty() {
    },
    removeParty() {
    },
  },
  selectors: {

  }
})

// Action creators are generated for each case reducer function
// export const {  } = addExpenseSlice.actions

export default addExpenseSlice.reducer
