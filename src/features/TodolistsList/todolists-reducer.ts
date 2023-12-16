import { todolistsAPI, TodolistType } from 'api/todolists-api'
import { Dispatch } from 'redux'
import { handleServerNetworkError } from 'utils/error-utils'
import { AppThunk } from 'app/store'
import { appActions, RequestStatusType } from 'app/app-reducer'
import { createSlice, current, PayloadAction } from '@reduxjs/toolkit'

const initialState: Array<TodolistDomainType> = []

const slice = createSlice({
   name: 'todolist',
   initialState: [] as TodolistDomainType[],
   reducers: {
      removeTodolist: (state, action: PayloadAction<{ id: string }>) => {
         //state.filter((tl) => tl.id != action.payload.id)
         const index = state.findIndex((el) => el.id === action.payload.id)
         if (index !== -1) {
            state.splice(index, 1)
         }
      },
      addTodolist: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
         const a = current(state)
         debugger
         const newTodo: TodolistDomainType = { filter: 'all', entityStatus: 'idle', ...action.payload.todolist }
         state.unshift(newTodo)
      },
      changeTodolistTitle: (state, action: PayloadAction<{ id: string; title: string }>) => {
         const index = state.findIndex((el) => el.id === action.payload.id)
         if (index !== -1) {
            state[index].title = action.payload.title
         }
      },
      changeTodolistFilter: (state, action: PayloadAction<{ id: string; filter: FilterValuesType }>) => {
         const index = state.findIndex((el) => el.id === action.payload.id)
         if (index !== -1) {
            state[index].filter = action.payload.filter
         }
      },
      changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string; entityStatus: RequestStatusType }>) => {
         const index = state.findIndex((el) => el.id === action.payload.id)
         if (index !== -1) {
            state[index].entityStatus = action.payload.entityStatus
         }
      },
      setTodolist: (state, action: PayloadAction<{ todolists: Array<TodolistType> }>) => {
         action.payload.todolists.forEach((tl) => {
            state.push({ ...tl, filter: 'all', entityStatus: 'idle' })
         })
         //  return action.payload.todolists.map((td) => ({ ...td, filter: 'all', entityStatus: 'idle' }))
      },
   },
})

// export const todolistsReducer = (
//    state: Array<TodolistDomainType> = initialState,
//    action: ActionsType,
// ): Array<TodolistDomainType> => {
//    switch (action.type) {
//       case 'REMOVE-TODOLIST':
//          return state.filter((tl) => tl.id != action.id)
//       case 'ADD-TODOLIST':
//          return [{ ...action.todolist, filter: 'all', entityStatus: 'idle' }, ...state]
//
//       case 'CHANGE-TODOLIST-TITLE':
//          return state.map((tl) => (tl.id === action.id ? { ...tl, title: action.title } : tl))
//       case 'CHANGE-TODOLIST-FILTER':
//          return state.map((tl) => (tl.id === action.id ? { ...tl, filter: action.filter } : tl))
//       case 'CHANGE-TODOLIST-ENTITY-STATUS':
//          return state.map((tl) => (tl.id === action.id ? { ...tl, entityStatus: action.status } : tl))
//       case 'SET-TODOLISTS':
//          return action.todolists.map((tl) => ({ ...tl, filter: 'all', entityStatus: 'idle' }))
//       default:
//          return state
//    }
// }

// actions
//export const removeTodolistAC = (id: string) => ({ type: 'REMOVE-TODOLIST', id }) as const

// thunks
export const fetchTodolistsTC = (): AppThunk => {
   return (dispatch) => {
      dispatch(appActions.setStatus({ status: 'loading' }))
      todolistsAPI
         .getTodolists()
         .then((res) => {
            dispatch(todolistActions.setTodolist({ todolists: res.data }))
            dispatch(appActions.setStatus({ status: 'succeeded' }))
         })
         .catch((error) => {
            handleServerNetworkError(error, dispatch)
         })
   }
}
export const removeTodolistTC = (id: string): AppThunk => {
   return (dispatch) => {
      //изменим глобальный статус приложения, чтобы вверху полоса побежала
      dispatch(appActions.setStatus({ status: 'loading' }))
      //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
      dispatch(todolistActions.changeTodolistEntityStatus({ id, entityStatus: 'loading' }))
      todolistsAPI.deleteTodolist(id).then((res) => {
         dispatch(todolistActions.removeTodolist({ id }))
         //скажем глобально приложению, что асинхронная операция завершена
         dispatch(appActions.setStatus({ status: 'succeeded' }))
      })
   }
}
export const addTodolistTC = (title: string): AppThunk => {
   return (dispatch: ThunkDispatch) => {
      dispatch(appActions.setStatus({ status: 'loading' }))
      todolistsAPI.createTodolist(title).then((res) => {
         dispatch(todolistActions.addTodolist({ todolist: res.data.data.item }))
         dispatch(appActions.setStatus({ status: 'succeeded' }))
      })
   }
}
export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
   return (dispatch) => {
      todolistsAPI.updateTodolist(id, title).then((res) => {
         dispatch(todolistActions.changeTodolistTitle({ id, title }))
      })
   }
}

export type FilterValuesType = 'all' | 'active' | 'completed'
export type TodolistDomainType = TodolistType & {
   filter: FilterValuesType
   entityStatus: RequestStatusType
}
type ThunkDispatch = any

export const todolistReducer = slice.reducer
export const todolistActions = slice.actions
