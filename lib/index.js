// core
import OA from './tracker'

// plugins
import './plugins/url-change-tracker'

(function () {
  const oa = new OA({
    ns: '1MOMENT'
  })
  window.oa = (t, event, args) => { oa.send(t, event, args) }
})(window)
