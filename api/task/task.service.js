import { ObjectId } from 'mongodb'

import { logger } from '../../services/logger.service.js'
import { makeId } from '../../services/util.service.js'
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'
import { readJsonFile } from '../../services/util.service.js'
import { writeJsonFile } from '../../services/util.service.js'
import { userService } from '../user/user.service.js'

const PAGE_SIZE = 3

export const taskService = {
  remove,
  query,
  getById,
  add,
  update,
}
let tasks = readJsonFile('./data/tasks.json')
let users = readJsonFile('./data/users.json')

async function query(filterBy = { txt: '' }) {
  try {
    let sortedTasks = []
    const { loggedinUser } = asyncLocalStorage.getStore()
    let userToFind
    const { txt, dueDate, status, creationTime, priority, tags, sortDir } =
      filterBy
    if (loggedinUser) {
      userToFind = users.find((user) => user.id === loggedinUser.id)
    }
    if (userToFind) {
      const regex = new RegExp(userToFind.fullname, 'i')
      // tasks = tasks.filter((task) => regex.test(task.taskOwner))
      // console.log(tasks)
      sortedTasks = userToFind.tasksIds.map((id, idx) => {
        const taskToReturn = tasks.find((task) => task.id === id + '')
        return taskToReturn
      })
    } else {
      return tasks.slice(0, 10)
    }
    if (txt) {
      const regex = new RegExp(filterBy.txt, 'i')
      sortedTasks = sortedTasks.filter(
        (task) => regex.test(task.title) || regex.test(task.description)
      )
    }
    if (dueDate) {
      sortedTasks = sortedTasks.filter((task) => task.dueDate <= dueDate)
    }

    if (status && status !== 'All') {
      sortedTasks = sortedTasks.filter((task) => task.status !== 'Completed')
    }

    if (priority && priority !== 'All') {
      sortedTasks = sortedTasks.filter((task) => task.priority === priority)
    }

    return sortedTasks

    return tasks
  } catch (err) {
    logger.error('cannot find tasks', err)
    throw err
  }
}

async function getById(taskId) {
  try {
    const task = tasks.find((task) => task.id === taskId)

    return Promise.resolve(task)
  } catch (err) {
    logger.error(`while finding task ${taskId}`, err)
    throw err
  }
}

async function remove(taskId) {
  const { loggedinUser } = asyncLocalStorage.getStore()
  if (!loggedinUser) {
    throw new Error('User not logged in')
  }

  try {
    const user = users.find((user) => user.id === loggedinUser.id)
    const userIdx = users.findIndex((user) => user.id === loggedinUser.id)
    const { isAdmin } = user
    const taskToRemove = tasks.find((task) => task.id === taskId)
    if (!isAdmin) {
      if (taskToRemove.taskOwner !== user.fullname) throw 'Not your task'
    }

    const idx = tasks.findIndex((task) => task.id === taskId)
    tasks.splice(idx, 1)
    _saveTasksToFile()
    const idToRemoveIdx = user.tasksIds.findIndex((id) => id === taskId)
    user.tasksIds.splice(idToRemoveIdx, 1)

    const userToSave = {
      ...user,
      tasksIds: user.tasksIds,
      id: loggedinUser.id,
    }
    users.splice(userIdx, 1, userToSave)
    _saveUsersToFile()
    return taskId
  } catch (err) {
    logger.error(`cannot remove task ${taskId}`, err)
    throw err
  }
}

async function add(task) {
  try {
    const { loggedinUser } = asyncLocalStorage.getStore()
    if (!loggedinUser) {
      throw new Error('User not logged in')
    }
    const taskToSave = {
      id: makeId(),
      title: task.title,
      dueDate: task.dueDate,
      description: task.description,
      status: task.status,
      priority: task.priority,
      tags: task.tags || [],
      creationTime: new Date().toISOString(),
      taskOwner: loggedinUser.fullname || '',
      msgs: [],
    }

    tasks.unshift(taskToSave)
    _saveTasksToFile()

    // loggedinUser.tasksIds.unshift(taskToSave.id)
    const idx = users.findIndex((user) => user.id === loggedinUser.id)
    const userToUpdate = users.find((user) => user.id === loggedinUser.id)
    userToUpdate.tasksIds.unshift(taskToSave.id)

    const userToSave = {
      ...userToUpdate,
      tasksIds: userToUpdate.tasksIds,
      id: loggedinUser.id,
    }
    users.splice(idx, 1, userToSave)
    _saveUsersToFile()

    return task
  } catch (err) {
    logger.error('cannot insert task', err)
    throw err
  }
}

async function update(task) {
  const taskToSave = { ...task }

  try {
    const idx = tasks.findIndex((task) => task.id === taskToSave.id)
    if (idx === -1) throw new Error(`Task with id ${taskToSave.id} not found`)

    tasks.splice(idx, 1, { ...taskToSave })
    _saveTasksToFile()

    return taskToSave
  } catch (err) {
    logger.error(`cannot update task ${task._id}`, err)
    throw err
  }
}

function _saveTasksToFile() {
  return writeJsonFile('./data/tasks.json', tasks)
}

function _saveUsersToFile() {
  return writeJsonFile('./data/users.json', users)
}
