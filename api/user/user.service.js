import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { ObjectId } from 'mongodb'
import { readJsonFile } from '../../services/util.service.js'
import { writeJsonFile } from '../../services/util.service.js'

export const userService = {
  add, // Create (Signup)
  getById, // Read (Profile page)
  update, // Update (Edit profile)
  remove, // Delete (remove user)
  query, // List (of users)
  getByUsername, // Used for Login
}

let users = readJsonFile('./data/users.json')

async function query(filterBy = {}) {
  try {
    users = users.map((user) => {
      delete user.password
      return user
    })
    return users
  } catch (err) {
    logger.error('cannot find users', err)
    throw err
  }
}

async function getById(userId) {
  try {
    const user = users.find((user) => user.id === userId)

    delete user.password

    return user
  } catch (err) {
    logger.error(`while finding user by id: ${userId}`, err)
    throw err
  }
}

async function getByUsername(username) {
  try {
    const user = users.find((user) => user.username === username)
    return user
  } catch (err) {
    logger.error(`while finding user by username: ${username}`, err)
    throw err
  }
}

async function remove(userId) {
  try {
    const idx = users.findIndex((user) => user.id === userId)
    if (idx === -1) return Promise.reject('No such user')
    const user = users[idx]
    users.splice(idx, 1)

    return _saveUsersToFile()
  } catch (err) {
    logger.error(`cannot remove user ${userId}`, err)
    throw err
  }
}

async function update(userToUpdate) {
  try {
    const idx = users.findIndex((user) => user.id === userToUpdate.id)
    users.splice(idx, 1, userToUpdate)

    return _saveUsersToFile()
  } catch (err) {
    logger.error(`cannot update user ${userToUpdate.id}`, err)
    throw err
  }
}

async function add(user) {
  try {
    // peek only updatable fields!
    const userToAdd = {
      id: user.id,
      username: user.username,
      password: user.password,
      fullname: user.fullname,
      imgUrl: user.imgUrl,
      isAdmin: user.isAdmin,
      tasksIds: user.tasksIds,
    }
    users.unshift(userToAdd)

    return _saveUsersToFile(users)
  } catch (err) {
    logger.error('cannot add user', err)
    throw err
  }
}

function _saveUsersToFile() {
  return writeJsonFile('./data/users.json', users)
}
