import pkg from '../package.json'

export const APP_DATA = Object.freeze({
  name: pkg.name,
  version: pkg.version,
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV,
  prod: import.meta.env.PROD,
})

if (typeof window !== 'undefined') {
  window.APP_DATA = APP_DATA
}
