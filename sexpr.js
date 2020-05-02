/* eslint-disable */
'use strict'

const not_whitespace_or_end = /^(\S|$)/
const space_quote_paren_escaped_or_end = /^(\s|\\|"|'|\(|\)|$)/
const string_or_escaped_or_end = /^(\\|"|$)/
const noescape_string_or_end = /^('|$)/

/**
 * @author fwg
 */
class Parser {
  constructor (stream) {
    this._line = this._col = this._pos = 0
    this._stream = stream
  }

  error (msg) {
    var e = new Error('Syntax error: ' + msg)
    e.line = this._line + 1
    e.col = this._col + 1
    return e
  }

  peek () {
    if (this._stream.length == this._pos) return ''
    return this._stream[this._pos]
  }

  consume () {
    if (this._stream.length == this._pos) return ''

    var c = this._stream[this._pos]
    this._pos += 1

    if (c == '\r') {
      if (this.peek() == '\n') {
        this._pos += 1
        c += '\n'
      }
      this._line++
      this._col = 0
    } else if (c == '\n') {
      this._line++
      this._col = 0
    } else {
      this._col++
    }

    return c
  }

  until (regex) {
    var s = ''

    while (!regex.test(this.peek())) {
      s += this.consume()
    }

    return s
  }

  noescape_string () {
    // consume '
    this.consume()

    var str = ''

    while (true) {
      str += this.until(noescape_string_or_end)
      var next = this.peek()

      if (next == '') {
        return this.error('Unterminated string literal')
      }

      if (next == "'") {
        this.consume()
        break
      }
    }

    // wrap in object to make strings distinct from symbols
    return new String(str)
  }

  string () {
    // consume "
    this.consume()

    var str = ''

    while (true) {
      str += this.until(string_or_escaped_or_end)
      var next = this.peek()

      if (next == '') {
        return this.error('Unterminated string literal')
      }

      if (next == '"') {
        this.consume()
        break
      }

      if (next == '\\') {
        this.consume()
        next = this.peek()

        if (next == 'r') {
          this.consume()
          str += '\r'
        } else if (next == 't') {
          this.consume()
          str += '\t'
        } else if (next == 'n') {
          this.consume()
          str += '\n'
        } else if (next == 'f') {
          this.consume()
          str += '\f'
        } else if (next == 'b') {
          this.consume()
          str += '\b'
        } else {
          str += this.consume()
        }
      }
    }

    // wrap in object to make strings distinct from symbols
    return new String(str)
  }

  atom () {
    if (this.peek() == '"') {
      return this.string()
    }

    if (this.peek() == "'") {
      return this.noescape_string()
    }

    var atom = ''

    while (true) {
      atom += this.until(space_quote_paren_escaped_or_end)
      var next = this.peek()

      if (next == '\\') {
        this.consume()
        atom += this.consume()
        continue
      }

      break
    }

    return atom
  }

  expr () {
    // ignore whitespace
    this.until(not_whitespace_or_end)

    var expr = this.peek() == '(' ? this.list() : this.atom()

    // ignore whitespace
    this.until(not_whitespace_or_end)

    return expr
  }

  list () {
    if (this.peek() != '(') {
      return this.error('Expected `(` - saw `' + this.peek() + '` instead.')
    }

    this.consume()

    var ls = []
    var v = this.expr()

    if (v instanceof Error) {
      return v
    }

    if (v !== '') {
      ls.push(v)

      while ((v = this.expr()) !== '') {
        if (v instanceof Error) return v
        ls.push(v)
      }
    }

    if (this.peek() != ')') {
      return this.error('Expected `)` - saw: `' + this.peek() + '`')
    }

    // consume that closing paren
    this.consume()

    return ls
  }
}

const sparse = function SParse (stream) {
  var parser = new Parser(stream)
  var expression = parser.expr()

  if (expression instanceof Error) {
    return expression
  }

  // if anything is left to parse, it's a syntax error
  if (parser.peek() != '') {
    return parser.error('Superfluous characters after expression: `' + parser.peek() + '`')
  }

  return expression
}

sparse.SyntaxError = Error

// export default sparse
module.exports = sparse