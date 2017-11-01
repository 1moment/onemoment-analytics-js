import Session from './session'
import Events from './events'
import { assign, getParameterByName, getCookie, setCookie } from './utilities'
import { NULL_REFERRER, COOKIE_PREFIX, NULL_DIMENSION } from './constants'

// plugins
import './plugins/url-change-tracker'

/*
  Cookie Parameter
  IV : user_id
  AI: client_id
*/

export default class OA {
  constructor (options) {
    this.tds = `${process.env.SERVER_ADDR}/collect`
    const referrer = document.referrer || NULL_REFERRER
    const defaultOpts = {
      ns: '1MOMENT',
      source: 'OMWEB',
      traffic: {
        location: location.href,
        referrer: referrer,
        user_agent: navigator.userAgent,
        utm_source: getParameterByName('utm_source'),
        utm_medium: getParameterByName('utm_medium'),
        utm_campaign: getParameterByName('utm_campaign'),
        utm_content: getParameterByName('utm_content'),
        utm_term: getParameterByName('utm_term'),
        ent_referrer: getCookie('rfr_1st', COOKIE_PREFIX),
        title: document.title || NULL_DIMENSION
      },
      system_source: {
        vp: `${window.innerWidth}x${window.innerHeight}`,
        sr: `${screen.width}x${screen.height}`,
        language: navigator.language || navigator.userLanguage,
        encoding: document.characterSet
      }
    }
    this.options = assign({}, defaultOpts, options)

    // ClientId
    this.clientId = getCookie('ai', COOKIE_PREFIX)
    if (!this.clientId) {
      this.clientId = `OA.${Math.floor((Math.random() * 1000000) + 1)}.${Math.round(new Date().getTime() / 1000)}`
      setCookie('ai', this.clientId, 63072000000, COOKIE_PREFIX)
    }

    // Ssession
    this.session = Session.getOrCreate(this)

    // Events
    this.events = new Events()
    this.events.on('send', (args) => {
      /*
        `oa('send', ${hitType}, ${payload})` commands
        @param {Array} args

        Support Hit Type
        - pageview
          oa('send', 'pageview', [payload])
        - event
          oa('send', 'event', [event_category], [event_action], [event_label], [event_value], [payload])
      */
      const hitType = args[0]
      const data = args[1]

      this.session.sendHitTask()
      const userId = getCookie('iv', COOKIE_PREFIX)
      const clientId = this.clientId
      const d = assign(this.options, {
        category: hitType,
        source_time: new Date().getTime(),
        user: {
          session_id: this.session.getId()
        },
        content: assign({}, data)
      })
      if (userId) {
        d.user.user_id = userId
      }
      if (clientId) {
        d.user.client_id = clientId
      }
      if (hitType === 'event') {
        d['event'] = {
          category: data[0],
          action: data[1],
          label: data[2] || null,
          value: data[3] || null
        }
        d['content'] = assign({}, data[4] || null)
      }
      setTimeout(() => {
        this._post(d)
      }, 0)
    })
    this.events.on('set', (args) => {
      /*
        `oa('set', ${payload})`
        `oa('set', ${optionName}, ${payload})`
        @param {Array} args
      */
      if (args.length > 1) {
        this.options[args[0]] = assign(defaultOpts[args[0]], this.options[args[0]], args[1])
      } else {
        this.options = assign(defaultOpts, this.options, args[0])
      }
    })
    this.events.on('identify', (args) => {
      /*
        `oa('identify', ${userId})` commands
        @param {Array} args
      */
      setCookie('iv', args[0], null, COOKIE_PREFIX)
    })
    this.events.on('viewProduct', (args) => {
      /*
        `oa('viewProduct', ${productId})` commands
        @param {Array} args
      */
      let viewHistory = getCookie('vp', COOKIE_PREFIX)
      viewHistory = viewHistory ? JSON.parse(decodeURIComponent(viewHistory)) : []
      viewHistory.push(args[0])
      setCookie('vp', encodeURIComponent(JSON.stringify(viewHistory)), null, COOKIE_PREFIX)
    })

    // Referrer History
    if (referrer !== NULL_REFERRER && referrer.indexOf('1moment.co.kr') < 0) {
      const k = referrer.split('/')[2]
      let referrerHistory = getCookie('rfr', COOKIE_PREFIX)
      referrerHistory = referrerHistory ? JSON.parse(decodeURIComponent(referrerHistory)) : {}
      referrerHistory[k] = (referrerHistory[k] || 0) + 1
      setCookie('rfr', encodeURIComponent(JSON.stringify(referrerHistory)), null, COOKIE_PREFIX)
      if (!getCookie('rfr_1st', COOKIE_PREFIX)) {
        setCookie('rfr_1st', k, null, COOKIE_PREFIX)
      }
    }

    // UTM History
    const utmSourceByCookie = decodeURIComponent(getCookie('utm_source', COOKIE_PREFIX))
    const utmMediumByCookie = decodeURIComponent(getCookie('utm_medium', COOKIE_PREFIX))
    const utmCampaignByCookie = decodeURIComponent(getCookie('utm_campaign', COOKIE_PREFIX))
    const utmContentByCookie = decodeURIComponent(getCookie('utm_content', COOKIE_PREFIX))
    const utmTermByCookie = decodeURIComponent(getCookie('utm_term', COOKIE_PREFIX))

    const utmSource = getParameterByName('utm_source') || ''
    const utmMeidum = getParameterByName('utm_medium') || ''
    const utmCampaign = getParameterByName('utm_campaign') || ''
    const utmContent = getParameterByName('utm_content') || ''
    const utmTerm = getParameterByName('utm_term') || ''

    if ((utmSource || utmMeidum || utmCampaign || utmContent || utmTerm) &&
      (utmSourceByCookie !== utmSource ||
      utmMediumByCookie !== utmMeidum ||
      utmCampaignByCookie !== utmCampaign ||
      utmContentByCookie !== utmContent ||
      utmTermByCookie !== utmTerm)) {
      setCookie('utm_source', encodeURIComponent(utmSource), 63072000000, COOKIE_PREFIX)
      setCookie('utm_medium', encodeURIComponent(utmMeidum), 63072000000, COOKIE_PREFIX)
      setCookie('utm_campaign', encodeURIComponent(utmCampaign), 63072000000, COOKIE_PREFIX)
      setCookie('utm_content', encodeURIComponent(utmContent), 63072000000, COOKIE_PREFIX)
      setCookie('utm_term', encodeURIComponent(utmTerm), 63072000000, COOKIE_PREFIX)
      this.session.sendHitTask('end')
    }

    // plugins install
    window.oa_plugins = window.oa_plugins || []
    for (let key in window.oa_plugins) {
      /* eslint-disable no-new */
      new window.oa_plugins[key](this)
    }
  }

  _post (payload) {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', this.tds)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify(payload))
  }

  send (t, event, payload) {
    this.events.emit(t, event, payload)
  }
}
