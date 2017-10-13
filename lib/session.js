import Store from './store'
import { uuidv4 } from './utilities'

const MINUTES = 60000
let instance

export default class Session {
  static getOrCreate (tracker, timeout) {
    instance = instance || new Session(tracker, timeout)
    return instance
  }

  constructor (tracker, timeout) {
    this.timeout = timeout || Session.DEFAULT_TIMEOUT

    this.defaultsOpt = {
      hitTime: 0,
      hitcount: 0,
      isExpired: false
    }
    this.store = Store.getOrCreate(tracker.options.ns, 'session', this.defaultsOpt)

    if (!this.getId()) {
      this.store.set({
        id: uuidv4()
      })
    }
  }

  getId () {
    return this.store.get().id
  }

  isExpired () {
    const data = this.store.get()

    if (data.isExpired) {
      return true
    }

    if (data.hitTime) {
      const currentDate = new Date()
      const oldHitDate = new Date(data.hitTime)
      if (currentDate - oldHitDate > (this.timeout * MINUTES)) {
        return true
      }
    }
    return false
  }

  sendHitTask (control) {
    const SESSION_START = control === 'start' || this.isExpired()
    const SESSION_END = control === 'end'

    const data = this.store.get()
    data.hitTime = new Date()

    if (SESSION_START) {
      data.id = uuidv4()
      data.hitcount = 0
      data.isExpired = false
    }

    if (SESSION_END) {
      data.isExpired = true
    }
    data.hitcount += 1
    this.store.set(data)
  }

  destory () {
    this.instance = null
    this.store.destory()
  }
}

Session.DEFAULT_TIMEOUT = 30
