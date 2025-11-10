import React from 'react'
import { Provider } from 'react-redux'
import { store } from '../store/store'

type Props = {
  children: React.ReactNode
}

export const ExpenseProvider = ({ children }: Props) => {
  return <Provider store={store}>{children}</Provider>
}
