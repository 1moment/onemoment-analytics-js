import Session from './session'
import { assign, addEventListener } from './utilities'

/*
  Cookie Domain
  IV : user_id
  AI: client_id
*/

(function () {
  const COOKIE_PREFIX = 'oa_'
  class OA {
    constructor (namepsace) {
      this.tds = 'http://127.0.0.1:3000/collect'
      this.options = {
        ns: namepsace || '1MOMENT',
        source: 'OMWEB',
        traffic: {
          location: location.href,
          referrer: document.referrer,
          user_agent: navigator.userAgent
        },
        system_source: {
          vp: `${window.innerWidth}x${window.innerHeight}`,
          sr: `${screen.width}x${screen.height}`,
          language: navigator.language || navigator.userLanguage,
          encoding: document.characterSet
        }
      }
      window._oaq = assign([], window._oaq)
      this.session = Session.getOrCreate(this)

      addEventListener(document, 'readystatechange', () => {
        if (document.readyState === 'complete' || document.readyState === 'loaded') {
          this.postMessage()
        }
      })

      addEventListener(window, 'load', () => {
        setTimeout(() => {
          this.postMessage()
        }, 1000)
      })
    }

    send (event, payload) {
      window._oaq.push({
        e: event,
        p: payload
      })
      this.session.sendHitTask()
      this.postMessage()
    }

    postMessage () {
      const q = window._oaq
      for (let i = 0; i < q.length; i++) {
        const userId = this.getCookie('iv')
        const clientId = this.getCookie('ai') || 'testclientid'
        const d = assign(this.options, {
          category: q[i].e,
          source_time: Math.round(new Date().getTime() / 1000),
          user: {
            session_id: this.session.getId()
          },
          content: q[i].p
        })
        if (userId) {
          d.user.user_id = userId
        }
        if (clientId) {
          d.user.client_id = clientId
        }
        this._post(this.tds, d)
      }
      window._oaq = []
    }

    getCookie (cookie) {
      const c = document.cookie
      const start = c.indexOf(`${COOKIE_PREFIX}${cookie}=`)
      if (start < 0) {
        return null
      }
      const end = c.indexOf(';')
      return c.substring(start + cookie.length, end)
    }

    _post (url, payload) {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', url)
      xhr.setRequestHeader('Content-Type', 'application/json')
      xhr.send(JSON.stringify(payload))
    }
  }

  const oa = new OA()
  window.oa = (event, ...args) => { oa.send(event, args) }
})()
