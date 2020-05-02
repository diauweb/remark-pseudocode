/* eslint-disable no-useless-call */
/* eslint-disable no-new-wrappers */

const sexpr = require('./sexpr')
const Runtime = require('./rt')

module.exports = function (src, injectRt = () => {}) {
  const ast = sexpr(src)
  const rt = new Runtime()

  rt.def('pseudo', function (self, ...args) {
    return new String(`
    <ol>
        ${args.map(e => self.evaluate.call(self, e)).join(' ')}
    </ol>
        `)
  })

  function Tag (open) {
    return function (self, ...args) {
      return new String(`<${open}>${args.map(e => self.evaluate.call(self, e)).join(' ')}</${open}>`)
    }
  }

  function Entity (value) {
    return function () {
      return new String(value)
    }
  }

  const tags = {
    li: 'li',
    b: 'b',
    i: 'i',
    sup: 'sup',
    sub: 'sub',
  }

  const entities = {
    LeftArrow: '←',
    Less: '&lt;',
  }

  for (const v of Object.keys(tags)) rt.def(v, Tag(tags[v]))
  for (const v of Object.keys(entities)) rt.def(v, Entity(entities[v]))

  rt.def('lin', function (self, indent) {
    return function (self, ...args) {
      return new String(`
            <li style="text-indent: ${indent}em">
                ${args.map(e => self.evaluate.call(self, e)).join(' ')}
            </li>
        `)
    }
  })

  for (let i = 1; i <= 16; i++) {
    var key = new Array(i).fill('.').join('')
    rt.def(key, function (self, ...args) {
      return rt.global.lin(self, i)(self, ...args)
    })
  }

  rt.def('m', function (self, args) {
    return `$${args.replace(/\\/g, '\\u005c ')}$`
  })

  injectRt(rt)

  return rt.evaluate(ast)
}
