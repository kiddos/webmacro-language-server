const { Index } = require('../build/Release/webmacro_index.node');

const index = new Index();

const text = `
#macro simple_macro() {
  #set $a = "hello"
  <div>abc $a</div>
}

#simple_macro()

`;

index.readVariables("a", text)
const vars = index.getVariables("a");
console.log(vars);
