import { assign } from './utilities'

const OA_PREFIX = 'oa'
const instances = []

let browserSupportLocalStorage

export default class Store {
  static getOrCreate (namespace, category, defaults) {
    const key = [OA_PREFIX, namespace, category].join(':')
    if (!instances[key]) {
      instances[key] = new Store(key, defaults)
    }
    return instances[key]
  }

  static isSupportLocalStorage () {
    if (browserSupportLocalStorage != null) {
      return browserSupportLocalStorage
    }

    try {
      window.localStorage.setItem(OA_PREFIX, OA_PREFIX)
      window.localStorage.removeItem(OA_PREFIX)
      browserSupportLocalStorage = true
    } catch (e) {
      browserSupportLocalStorage = false
    }
    return browserSupportLocalStorage
  }

  constructor (key, defaults = {}) {
    this.key = key
    this.defaults = defaults
    this._cache = null
  }

  get () {
    if (this._cache) {
      return this._cache
    }

    if (Store.isSupportLocalStorage()) {
      try {
        this._cache = parse(window.localStorage.getItem(this.key))
      } catch (err) {
        // Continue
      }
    }
    this._cache = assign({}, this.defaults, this._cache)
    return this._cache
  }

  set (data) {
    this._cache = assign({}, this.defaults, this._cache, data)
    if (Store.isSupportLocalStorage()) {
      window.localStorage.setItem(this.key, JSON.stringify(this._cache))
    }
  }

  destroy () {
    delete instances[this.key]
  }
}

function parse (src) {
  let data = {}
  if (src) {
    try {
      data = JSON.parse(src)
    } catch (err) {
      // continue
    }
  }
  return data
}
