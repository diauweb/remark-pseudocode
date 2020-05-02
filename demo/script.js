
const injectRt = rt => rt.def('m', function(self, args){
    return katex.renderToString(args);
});

const provider = require('../pseudo-provider')

const button = document.getElementById('g');
const box = document.getElementById('s');
const render = document.getElementsByClassName('pseudo-text')[0];

button.addEventListener('click', function(){
    render.innerHTML = provider(box.value, injectRt);
});