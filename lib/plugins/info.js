import provide from '../provide'
import { getCookie } from '../utilities'
import { COOKIE_PREFIX } from '../constants'

class InfoTracker {
  constructor (tracker) {
    this.tracker = tracker
    /*
      `oa('identify', ${userId})` commands
      @param {Array} args
    */
    tracker.events.on('info', (args) => {
      const data = args[0]
      if (getCookie('iv', COOKIE_PREFIX) !== data['userId']) {
        const payload = {
          session_id: tracker.session.getId(),
          user_id: data['userId'],
          client_id: getCookie('ai', COOKIE_PREFIX)
        }
        this._post(payload)
      }
    })
  }

  _post (payload) {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${process.env.SERVER_ADDR}/api/user`)
    xhr.setRequestHeader('Content-Type', 'text/plain')
    xhr.send(JSON.stringify(payload))
  }
}

provide('infoTracker', InfoTracker)
