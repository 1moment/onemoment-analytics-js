// core
import OA from './tracker'

// plugins
import './plugins'

/*
  # example
  - 1. before create instance
    window._oaq = window._oaq || []
    window._oaq.push([
      'event',
      ['상단메뉴', 'click', '{{Click Text}}']
    ]);

  - 2. after create instance
    oa('send', 'event', '상단메뉴', 'click', '{{Click Text}}');
*/

(function () {
  const oa = new OA({
    ns: '1MOMENT'
  })
  window.oa = (t, event, ...args) => { oa.send(t, event, args) }
})(window)
