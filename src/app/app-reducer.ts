import {Dispatch} from 'redux'
import {authAPI} from 'api/todolists-api'
import {authActions} from 'features/Login/auth-reducer'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const slice = createSlice({
    name: 'App',
    initialState: {
        status: 'idle' as RequestStatusType,
        error: null as string | null,
        isInitialized: true
    },
    reducers: {
        setAppError: (state, action: PayloadAction<{error: string | null}>) =>{
            state.error = action.payload.error
        },
        setAppStatus: (state, action: PayloadAction<{status: RequestStatusType}>) =>{
            state.error = action.payload.status
        },
        setAppInitialized: (state, action: PayloadAction<{isInitialized: boolean}>) =>{
            state.isInitialized = action.payload.isInitialized
        }
    }
})




export const setAppErrorAC = (error: string | null) => ({type: 'APP/SET-ERROR', error} as const)
export const setAppStatusAC = (status: RequestStatusType) => ({type: 'APP/SET-STATUS', status} as const)
export const setAppInitializedAC = (value: boolean) => ({type: 'APP/SET-IS-INITIALIED', value} as const)

export const initializeAppTC = () => (dispatch: Dispatch) => {
    authAPI.me().then(res => {
        if (res.data.resultCode === 0) {
            dispatch(authActions.setIsLoggedIn({isLoggedIn: true}));
        } else {

        }

        dispatch(setAppInitializedAC(true));
    })
}

export type SetAppErrorActionType = ReturnType<typeof setAppErrorAC>
export type SetAppStatusActionType = ReturnType<typeof setAppStatusAC>


type ActionsType =
    | SetAppErrorActionType
    | SetAppStatusActionType
    | ReturnType<typeof setAppInitializedAC>

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'

export const appReducer = slice.reducer
export const appActions = slice.actions