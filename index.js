const visit = require('unist-util-visit')
const provider = require('./pseudo-provider')

function walkNode (markdownAST) {
  visit(markdownAST, 'code', node => {
    if ((node.lang || '').toLowerCase() === 'pseudo') {
      node.type = ''
      node.value = provider(node.value)
    }
  })
}

module.exports = function attacher () {
  return function transformer (tree, file) {
    walkNode(tree)
  }
}
