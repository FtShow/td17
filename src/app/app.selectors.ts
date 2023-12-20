import { RootState } from '@reduxjs/toolkit/query'
import { AppRootStateType } from 'app/store'

export const selectStatus = (state: AppRootStateType) => state.app.status
