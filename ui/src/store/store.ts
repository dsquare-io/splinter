import { configureStore } from '@reduxjs/toolkit'
import addExpenseReducer from './features/add-expense'

const store = configureStore({
  reducer: {
    addExpense: addExpenseReducer
  }
});

export default store;

export type RootState = ReturnType<typeof store.getState>


