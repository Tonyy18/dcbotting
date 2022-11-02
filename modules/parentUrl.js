let sp = __dirname.split("/")
sp.pop()
const url = sp.join("/");
module.exports = url;