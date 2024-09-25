import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'

import { userService } from '../user/user.service.js'
import { logger } from '../../services/logger.service.js'
import { makeId } from '../../services/util.service.js'

const cryptr = new Cryptr(process.env.SECRET || 'Secret-Puk-1234')

export const authService = {
  signup,
  login,
  getLoginToken,
  validateToken,
}

async function login(username) {
  logger.debug(`auth.service - login with username: ${username}`)

  const user = await userService.getByUsername(username)
  console.log('auth service:', user)
  if (!user) return Promise.reject('Invalid username or password')

  // TODO: un-comment for real login
  // const match = await bcrypt.compare(password, user.password)
  // if (!match) return Promise.reject('Invalid username or password')

  delete user.password
  return user
}

async function signup({
  username,
  password,
  fullname,
  imgUrl,
  isAdmin,
  tasksIds,
}) {
  const saltRounds = 10

  logger.debug(
    `auth.service - signup with username: ${username}, fullname: ${fullname}`
  )
  if (!username || !password || !fullname)
    return Promise.reject('Missing required signup information')

  const userExist = await userService.getByUsername(username)
  if (userExist) return Promise.reject('Username already taken')

  const hash = await bcrypt.hash(password, saltRounds)
  return userService.add({
    id: makeId(),
    username,
    password: hash,
    fullname,
    imgUrl,
    isAdmin,
    tasksIds,
  })
}

function getLoginToken(user) {
  console.log('authService:token', user)
  const userInfo = {
    id: user.id,
    fullname: user.fullname,
    imgUrl: user.imgUrl,
    tasksIds: user.tasksIds,
    isAdmin: user.isAdmin,
  }
  return cryptr.encrypt(JSON.stringify(userInfo))
}

function validateToken(loginToken) {
  try {
    const json = cryptr.decrypt(loginToken)
    const loggedinUser = JSON.parse(json)
    return loggedinUser
  } catch (err) {
    console.log('Invalid login token')
  }
  return null
}
