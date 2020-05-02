/* eslint-disable no-new-wrappers */
'use strict'

class Runtime {
  constructor () {
    this.initEnv()
  }

  initEnv () {
    this.global = {
      print: (self, ...args) => {
        console.log(...args
          .map(e => this.evaluate.call(self, e))
          .map(e => e instanceof String ? e.valueOf() : e))
        return null
      },
      keywords: [
        'if', 'for', 'to', 'Method.', 'Input.', 'Output.',
      ],
      vars: [
        'ith', 'A', 'N', 'i', 'j',
      ],
    }
  }

  def (key, value) {
    this.global[key] = value
  }

  evaluate (expr) {
    if (typeof expr === 'string') {
      if (this.global.keywords.includes(expr)) {
        return new String(`<b>${expr}</b>`)
      }
      if (this.global.vars.includes(expr)) {
        return new String(`<i>${expr}</i>`)
      }
      return new String(expr)
    }

    if (!(expr instanceof Array)) return expr
    if (expr.length <= 0) return null

    let callee = expr[0]
    if (typeof callee === 'string') {
      callee = this.global[callee]
      if (callee === undefined) callee = null
    } else callee = this.evaluate(callee)
    if (callee === null) callee = function NilValue () { return null }

    console.log(callee)
    return callee(this, ...expr.slice(1))
  }
}

module.exports = Runtime
// export default Runtime
