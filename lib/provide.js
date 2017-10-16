export default function provide (name, fn) {
  window.oa_plugins = window.oa_plugins || {}
  window.oa_plugins[name.toLowerCase()] = fn
}
