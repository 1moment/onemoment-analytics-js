import provide from '../provide'
import { getCookie, setCookie } from '../utilities'
import { COOKIE_PREFIX } from '../constants'

class IdentifyTracker {
  constructor (tracker) {
    this.tracker = tracker
    /*
      `oa('identify', ${userId})` commands
      @param {Array} args
    */
    tracker.events.on('identify', (args) => {
      if (getCookie('iv', COOKIE_PREFIX) !== String(args[0])) {
        const payload = {
          session_id: tracker.session.getId(),
          user_id: args[0],
          client_id: getCookie('ai', COOKIE_PREFIX)
        }
        this._post(payload)
      }
      setCookie('iv', args[0], 63072000000, COOKIE_PREFIX)
    })
  }

  _post (payload) {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${process.env.SERVER_ADDR}/api/user`)
    xhr.setRequestHeader('Content-Type', 'text/plain')
    xhr.send(JSON.stringify(payload))
  }
}

provide('identifyTracker', IdentifyTracker)
