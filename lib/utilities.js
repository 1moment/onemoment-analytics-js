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
