const fs = require("fs");

var outFile = fs.createWriteStream('../standalone.html');
  
let contents = fs.readFileSync("index.html").toString().split(/\r?\n/);
let state = 0;
for (let i=0; i < contents.length; i++)
{
    let line = contents[i];
    if (line.indexOf("scripts:begin") > 0){
        state = 1;
        continue;
    }
    if (line.indexOf("scripts:end") > 0){
        state = 0;
        outFile.write("<script type=\"text/javascript\">\n");
        outFile.write(fs.readFileSync("minidraw.core.js", 'utf-8').toString().replace(/^\uFEFF/, ''));
        outFile.write("\n");
        outFile.write(fs.readFileSync("minidraw.erdiagram.js", 'utf-8').toString().replace(/^\uFEFF/, ''));
        outFile.write("\n");        
        outFile.write(fs.readFileSync("minidraw.classdiagram.js", 'utf-8').toString().replace(/^\uFEFF/, ''));
        outFile.write("\n</script>\n");
        continue;
    }
    if (state == 0)
    outFile.write(line + "\n");
}
console.log(contents.length);
console.log("Ok");