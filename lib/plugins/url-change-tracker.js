import { NULL_DIMENSION } from '../constants'
import { addEventListener, removeEventListener } from '../utilities'
import provide from '../provide'

class UrlChangeTracker {
  constructor (tracker) {
    if (!history.pushState || !window.addEventListener) {
      return null
    }

    this.path = getPath()
    this.tracker = tracker
    this.handlePopState = this.handlePopState.bind(this)
    this.handlePushState = this.handlePushState.bind(this)
    this.handleReplaceState = this.handleReplaceState.bind(this)

    addEventListener(window, 'popstate', this.handlePopState)
    const f = function (original, fn) {
      const r = history[original]
      history[original] = function (state) {
        fn()
        return r.apply(this, arguments)
      }
    }
    f('pushState', this.handlePushState)
    f('replaceState', this.handleReplaceState)
  }

  handlePopState (evt) {
    this.handleUrlChange(true)
  }

  handlePushState () {
    this.handleUrlChange(true)
  }

  handleReplaceState () {
    this.handleUrlChange(false)
  }

  handleUrlChange (historyDidUpdate) {
    setTimeout(() => {
      const oldPath = this.path
      const newPath = getPath()
      if (this.path !== newPath && !!(this.path, newPath)) {
        this.path = newPath
        if (historyDidUpdate) {
          this.tracker.send('set', 'traffic', {
            referrer: oldPath,
            location: newPath
          })
          this.tracker.send('send', 'Page View', {
            page: location.href,
            title: document.title || NULL_DIMENSION
          })
        }
      }
    }, 0)
  }

  remove () {
    removeEventListener(window, 'popstate', this.handlePopState)
    removeEventListener(window, 'pushState', this.handlePushState)
    removeEventListener(window, 'replaceState', this.handleReplaceState)
  }
}

function getPath () {
  // return location.pathname + location.search
  return location.href
}

provide('urlChangeTracker', UrlChangeTracker)
