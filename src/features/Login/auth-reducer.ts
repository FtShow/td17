import { authAPI, LoginParamsType, TodolistType } from 'api/todolists-api'
import { handleServerAppError, handleServerNetworkError } from 'utils/error-utils'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk } from 'app/store'
import { appActions } from 'app/app-reducer'
import { todolistActions, todolistReducer } from 'features/TodolistsList/todolists-reducer'

const initialState: InitialStateType = {
   isLoggedIn: false,
}

const slice = createSlice({
   name: 'auth',
   initialState: {
      isLoggedIn: false,
   },
   reducers: {
      setIsLoggedIn: (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
         state.isLoggedIn = action.payload.isLoggedIn
      },
   },
})

// actions

// thunks
export const loginTC =
   (data: LoginParamsType): AppThunk =>
   (dispatch) => {
      dispatch(appActions.setStatus({ status: 'loading' }))
      authAPI
         .login(data)
         .then((res) => {
            if (res.data.resultCode === 0) {
               dispatch(authActions.setIsLoggedIn({ isLoggedIn: true }))
               dispatch(appActions.setStatus({ status: 'succeeded' }))
            } else {
               handleServerAppError(res.data, dispatch)
            }
         })
         .catch((error) => {
            handleServerNetworkError(error, dispatch)
         })
   }
export const logoutTC = (): AppThunk => (dispatch) => {
   dispatch(appActions.setStatus({ status: 'loading' }))
   authAPI
      .logout()
      .then((res) => {
         if (res.data.resultCode === 0) {
            dispatch(authActions.setIsLoggedIn({ isLoggedIn: false }))
            debugger
            dispatch(todolistActions.resetTD(1))
            dispatch(appActions.setStatus({ status: 'succeeded' }))
         } else {
            handleServerAppError(res.data, dispatch)
         }
      })
      .catch((error) => {
         handleServerNetworkError(error, dispatch)
      })
}

// types

type InitialStateType = {
   isLoggedIn: boolean
}

export const authReducer = slice.reducer
export const authActions = slice.actions
