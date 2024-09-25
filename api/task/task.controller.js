import { logger } from '../../services/logger.service.js'
import { taskService } from './task.service.js'

export async function getTasks(req, res) {
  try {
    const {
      txt = '',
      dueDate = '',
      status = 'All',
      priority = 'All',
      loggedinUser,
    } = req.query

    // Ensure loggedinUser is a valid object if passed
    const user = loggedinUser
    // ? JSON.parse(loggedinUser)

    if (loggedinUser && !loggedinUser.tasksIds) {
      loggedinUser.tasksIds = []
    }
    const filterBy = {
      txt,
      dueDate,
      status,
      priority,
      loggedinUser: user || {},
    }
    const tasks = await taskService.query(filterBy)
    res.json(tasks)
  } catch (err) {
    logger.error('Failed to get tasks', err)
    res.status(400).send({ err: 'Failed to get tasks' })
  }
}

export async function getTaskById(req, res) {
  try {
    const taskId = req.params.id
    const task = await taskService.getById(taskId)
    res.json(task)
  } catch (err) {
    logger.error('Failed to get task', err)
    res.status(400).send({ err: 'Failed to get task' })
  }
}

export async function addTask(req, res) {
  const { loggedinUser, body: task } = req

  try {
    task.taskOwner = loggedinUser.fullname
    const addedTask = await taskService.add(task)
    res.json(addedTask)
  } catch (err) {
    logger.error('Failed to add task', err)
    res.status(400).send({ err: 'Failed to add task' })
  }
}

export async function updateTask(req, res) {
  const { loggedinUser, body: task } = req
  const { id: userId, isAdmin } = loggedinUser

  if (!isAdmin && task.taskOwner !== loggedinUser.fullname) {
    res.status(403).send('Not your task...')
    return
  }

  try {
    const updatedTask = await taskService.update(task)
    res.json(updatedTask)
  } catch (err) {
    logger.error('Failed to update task', err)
    res.status(400).send({ err: 'Failed to update task' })
  }
}

export async function removeTask(req, res) {
  try {
    const taskId = req.params.id
    const removedId = await taskService.remove(taskId)

    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove task', err)
    res.status(400).send({ err: 'Failed to remove task' })
  }
}
