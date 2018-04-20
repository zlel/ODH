/* global api */
class jpcn_Hujiang {
    constructor(options) {
        this.options = options;
        this.maxexample = 2;
        this.word = '';
    }

    async displayName() {
        let locale = await api.locale();
        if (locale.indexOf('CN') != -1)
            return '沪江日语词典';
        if (locale.indexOf('TW') != -1)
            return '滬江日語詞典';
        return 'jpcn_Hujiang';
    }

    setOptions(options){
        this.options = options;
        this.maxexample = options.maxexample;
    }
    
    async findTerm(word) {
        this.word = word;
        return await this.findHujiang(word);
    }

    async findHujiang(word) {
        let notes = [];
        if (!word) return notes; // return empty notes

        function T(node) {
            if (!node)
                return '';
            else
                return node.innerText.trim();
        }
        let base = 'https://dict.hjenglish.com/jp/jc/';
        let url = base + encodeURIComponent(word);
        let doc = '';
        try {
            let data = await api.fetch(url);
            let parser = new DOMParser();
            doc = parser.parseFromString(data, 'text/html');
        } catch (err) {
            return [];
        }


        let expression = T(doc.querySelector('.word-text>h2'));
        let readings = doc.querySelectorAll('.pronounces>span');
        let reading_uk = T(readings[0]);
        let reading =  `UK[${reading_uk}]`

        let audios = [];
        audios[0] = doc.querySelector('.pronounces>.word-audio');
        audios[0] = audios[0] ? audios[0].getAttribute('data-src') : '';


        // make definition segement
        definition = '<ul class="exp">';
        let defblocks = entry.querySelector('dd').innerHTML.split('<br>');
        for (const defblock of defblocks) {
            definition += `<li class="exp"><span class="exp_chn">${defblock}</span></li>`;
        }
        definition += '</ul>';


        let css = this.renderCSS();
        notes.push({
            css,
            expression,
            reading,
            definitions:[definition],
            audios
        });
        return notes;
    }

    renderCSS() {
        let css = `
            <style>
                div.phrasehead{margin: 2px 0;font-weight: bold;}
                span.pos  {text-transform:lowercase; font-size:0.9em; margin-right:5px; padding:2px 4px; color:white; background-color:#0d47a1; border-radius:3px;}
                span.tran {margin:0; padding:0;}
                span.eng_tran {margin-right:3px; padding:0;}
                span.chn_tran {color:#0d47a1;}
                ul.sents {font-size:0.9em; list-style:square inside; margin:3px 0;padding:5px;background:rgba(13,71,161,0.1); border-radius:5px;}
                li.sent  {margin:0; padding:0;}
                span.eng_sent {margin-right:5px;}
                span.chn_sent {color:#0d47a1;}
            </style>`;
        return css;
    }
}