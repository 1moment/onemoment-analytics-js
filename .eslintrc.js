module.exports = {
  root: true,
  env: {
    browser: true,
  },
  extends: 'standard',
  'rules': {
    'arrow-parens': 0,
    'generator-star-spacing': 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}