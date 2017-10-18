export const assign = Object.assign || function (target, ...sources) {
  for (let i = 0; i < sources.length; i++) {
    let source = sources[i]
    for (let key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key]
      }
    }
  }
  return target
}

export const uuidv4 = function () {
  let d = new Date().getTime()
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
  return uuid
}

export function domReady (callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function fn () {
      document.removeEventListener('DOMContentLoaded', fn)
      callback()
    })
  } else {
    callback()
  }
}

export function addEventListener (target, evt, fn) {
  if (target.addEventListener) {
    target.addEventListener(evt, fn)
  } else {
    target.attachEvent(`on${evt}`, fn)
  }
}

export function removeEventListener (target, evt, fn) {
  if (target.removeEventListener) {
    target.removeEventListener(evt, fn)
  } else {
    target.detachEvent(`on${evt}`, fn)
  }
}

export function getParameterByName (name) {
  name = name.replace(/\[]/, '\\[').replace(/[\]]/, '\\]')
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)')
  const results = regex.exec(location.search)
  return results && results.length > 1 ? decodeURIComponent(results[1].replace(/\+/g, ' ')) : null
}

export function getCookie (cookie, prefix = '') {
  const c = document.cookie
  const len = (cookie + prefix).length + 1
  const start = c.indexOf(`${prefix}${cookie}=`)
  if (start < 0) {
    return null
  }
  const end = c.indexOf(';', start + len)
  return c.substring(start + len, end < 0 ? document.cookie.length : end)
}

export function setCookie (cookie, value, expires = 0, prefix = '') {
  if (expires) {
    const exdate = new Date()
    const expireTime = exdate.getTime() + expires
    exdate.setTime(expireTime)
    expires = `expires=${exdate.toUTCString()};`
  } else {
    expires = ''
  }
  document.cookie = `${prefix}${cookie}=${value};${expires}path=/;`
}
