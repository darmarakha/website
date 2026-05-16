const fs = require('fs');
let content = fs.readFileSync('src/constants.ts', 'utf8');

const kanaToRomaji = {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'を': 'o', 'ん': 'n',
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
    'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
    'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
    'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
    'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
    'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
    'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
    'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
    'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
    'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
    'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
    'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo'
};

function wanakanaConvert(text) {
    let result = '';
    let i = 0;
    while(i < text.length) {
        if(text[i] === 'ッ' || text[i] === 'っ') {
            if (i + 1 < text.length) {
                let nextStr = text.slice(i+1, i+3);
                let nextRomaji = kanaToRomaji[nextStr];
                if (!nextRomaji) {
                   nextRomaji = kanaToRomaji[text[i+1]];
                }
                if (nextRomaji) {
                    result += nextRomaji[0];
                }
            }
            i++;
            continue;
        }
        let twoChar = text.slice(i, i+2);
        let kanaChar = text[i];
        
        // Katakana converting to Hiragana code point mapping mostly holds, but here we can just use dictionary
        // Wait, katakana isn't fully in dict. Let's convert katakana to hiragana first.
        let toHira = (c) => {
            let code = c.charCodeAt(0);
            if (code >= 0x30A1 && code <= 0x30F6) {
                return String.fromCharCode(code - 0x60);
            }
            return c;
        };
        let twoCharHira = toHira(twoChar[0]) + (twoChar[1] ? toHira(twoChar[1]) : '');
        let charHira = toHira(text[i]);

        if(kanaToRomaji[twoCharHira]) {
            result += kanaToRomaji[twoCharHira];
            i += 2;
        } else if (kanaToRomaji[charHira]) {
            result += kanaToRomaji[charHira];
            i++;
        } else {
            if (text[i] === 'ー') {
                if (result.length > 0) {
                    // repeat last vowel? let's just ignore trailing long vowel in simple romaji if needed, or map it.
                    // ignoring it is usually fine for basic display
                }
            } else {
                result += text[i].toLowerCase();
            }
            i++;
        }
    }
    return result;
}

const lines = content.split('\n');
let modified = false;

for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/reading:\s*'([^']+)'/);
    if (match) {
        let reading = match[1];
        if (/[ぁ-んァ-ン]/.test(reading)) { // contains kana
            const romaji = wanakanaConvert(reading);
            lines[i] = lines[i].replace(`reading: '${reading}'`, `reading: '${romaji}'`);
            modified = true;
        }
    }
}

if (modified) {
    fs.writeFileSync('src/constants.ts', lines.join('\n'));
    console.log('Fixed readings in constants.ts');
} else {
    console.log('No modifications needed');
}
