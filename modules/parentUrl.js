let sp = __dirname.split("/")
if(sp.length < 2) {
    sp = __dirname.split("\\");
}
sp.pop()
let url = sp.join("/");
if(sp.length < 2) {
    let url = sp.join("\\");
}
module.exports = url;