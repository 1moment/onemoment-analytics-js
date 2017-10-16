export default class Events {
  constructor () {
    this._registry = {}
  }

  on (event, fn) {
    this._getEvent(event).push(fn)
  }

  off (event = undefined, fn = undefined) {
    if (event && fn) {
      const eventRegistry = this._getEvent(event)
      const handlerIndex = eventRegistry.indexOf(fn)
      if (handlerIndex >= 0) {
        eventRegistry.splice(handlerIndex, 1)
      }
      this._registry = eventRegistry
    } else if (event) {
      let eventRegistry = this._getEvent(event)
      eventRegistry = []
      this._registry = eventRegistry
    } else {
      this._registry = {}
    }
  }

  emit (event, ...args) {
    this._getEvent(event).forEach((fn) => { fn(args) })
  }

  _getEvent (event) {
    this._registry[event] = this._registry[event] || []
    return this._registry[event]
  }
}
