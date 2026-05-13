const fs = require('fs');
let content = fs.readFileSync('src/constants.ts', 'utf8');

// match each kanji block
let kanjis = [];
let re = /character:\s*'([^']+)'[\s\S]*?examples:\s*\[([\s\S]*?)\]/g;
let match;
while(match = re.exec(content)) {
    let char = match[1];
    let examplesText = match[2];
    let exMatches = examplesText.match(/{[^}]+}/g) || [];
    if (exMatches.length < 5) {
        kanjis.push({ char, count: exMatches.length });
    }
}
console.log(kanjis);
