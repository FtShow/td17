import { TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType } from 'api/todolists-api'
import { Dispatch } from 'redux'
import { AppRootStateType, AppThunk } from 'app/store'
import { handleServerAppError, handleServerNetworkError } from 'utils/error-utils'
import { appActions } from 'app/app-reducer'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { todolistActions } from 'features/TodolistsList/todolists-reducer'

const initialState: TasksStateType = {}

const slice = createSlice({
   name: 'tasksReducer',
   initialState: {} as TasksStateType,
   reducers: {
      removeTask: (state, action: PayloadAction<{ taskId: string; todolistId: string }>) => {
         // return { ...state, [action.todolistId]: state[action.todolistId].filter((t) => t.id != action.taskId) }
         state[action.payload.todolistId] = state[action.payload.todolistId].filter(
            (t) => t.id !== action.payload.taskId,
         )
      },
      addTask: (state, action: PayloadAction<{ task: TaskType }>) => {
         state[action.payload.task.todoListId].unshift(action.payload.task)
         // return { ...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]] }
      },
      updateTask: (
         state,
         action: PayloadAction<{
            taskId: string
            model: UpdateDomainTaskModelType
            todolistId: string
         }>,
      ) => {
         state[action.payload.todolistId].map((t) =>
            t.id === action.payload.taskId ? { ...t, ...action.payload.model } : t,
         )
      },
      setTask: (state, action: PayloadAction<{ tasks: Array<TaskType>; todolistId: string }>) => {
         state[action.payload.todolistId] = action.payload.tasks
      },
   },
   extraReducers: (builder) => {
      builder
         .addCase(todolistActions.addTodolist, (state, action) => {
            // { ...state, [action.todolist.id]: []
            state[action.payload.todolist.id] = []
         })
         .addCase(todolistActions.removeTodolist, (state, action) => {
            delete state[action.payload.id]
         })
         .addCase(todolistActions.setTodolist, (state, action) => {
            action.payload.todolists.forEach((tl: any) => {
               state[tl.id] = []
            })
         })
   },
})

// actions

// thunks
export const fetchTasksTC =
   (todolistId: string): AppThunk =>
   (dispatch) => {
      dispatch(appActions.setStatus({ status: 'loading' }))
      todolistsAPI.getTasks(todolistId).then((res) => {
         const tasks = res.data.items
         dispatch(tasksAction.setTask({ tasks, todolistId }))
         dispatch(appActions.setStatus({ status: 'succeeded' }))
      })
   }
export const removeTaskTC = (taskId: string, todolistId: string) => (dispatch: Dispatch<ActionsType>) => {
   todolistsAPI.deleteTask(todolistId, taskId).then((res) => {
      const action = tasksAction.removeTask({ taskId, todolistId })
      dispatch(action)
   })
}
export const addTaskTC = (title: string, todolistId: string) => (dispatch: Dispatch) => {
   dispatch(appActions.setStatus({ status: 'loading' }))
   todolistsAPI
      .createTask(todolistId, title)
      .then((res) => {
         if (res.data.resultCode === 0) {
            const task = res.data.data.item
            const action = tasksAction.addTask({ task })
            dispatch(action)
            dispatch(appActions.setStatus({ status: 'succeeded' }))
         } else {
            handleServerAppError(res.data, dispatch)
         }
      })
      .catch((error) => {
         handleServerNetworkError(error, dispatch)
      })
}
export const updateTaskTC =
   (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
   (dispatch: ThunkDispatch, getState: () => AppRootStateType) => {
      const state = getState()
      const task = state.tasks[todolistId].find((t) => t.id === taskId)
      if (!task) {
         //throw new Error("task not found in the state");
         console.warn('task not found in the state')
         return
      }

      const apiModel: UpdateTaskModelType = {
         deadline: task.deadline,
         description: task.description,
         priority: task.priority,
         startDate: task.startDate,
         title: task.title,
         status: task.status,
         ...domainModel,
      }

      todolistsAPI
         .updateTask(todolistId, taskId, apiModel)
         .then((res) => {
            if (res.data.resultCode === 0) {
               const action = tasksAction.updateTask({ taskId, model: domainModel, todolistId })
               dispatch(action)
            } else {
               handleServerAppError(res.data, dispatch)
            }
         })
         .catch((error) => {
            handleServerNetworkError(error, dispatch)
         })
   }

// types
export type UpdateDomainTaskModelType = {
   title?: string
   description?: string
   status?: TaskStatuses
   priority?: TaskPriorities
   startDate?: string
   deadline?: string
}
export type TasksStateType = {
   [key: string]: Array<TaskType>
}
type ActionsType = any
type ThunkDispatch = Dispatch<any>

export const tasksReducer = slice.reducer
export const tasksAction = slice.actions
