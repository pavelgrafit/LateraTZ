const express = require("express");
const bodyParser = require("body-parser");
const port = 8070

const app = express();

const splitMultiple = (str, ...separator) => {
    const res = [];
    let start = 0;
    for(let i = 0; i < str.length; i++){
        if(!((separator.includes(str[i])&separator.includes(str[i+1])))){
            continue;
        };
        res.push(str.substring(start, i));
        start = i+2;
    };
    return res;
};

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({extended: true}));

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

// Access the parse results as request.body
app.post('/render', function(request, response){
    console.log(request.body.template);
    console.log(request.body.substitutions);

    var mapSubs = new Map(Object.entries(request.body.substitutions));
    console.log(mapSubs.keys());

    var data = new String(request.body.template);
    var codeArr = data.match(/<\?(.*?)\?>/gim);
    var typeMap = new Map();

    console.log("Хоба")
    var sentences = splitMultiple(data, '<', '?', '>');
    sentences.forEach(function(elem, i, arr) {
        if (arr[i] === ' ') sentences.slice(arr[i]);
    })
    console.log(sentences);

    codeArr.forEach(function(elem, i, arr) {
        arr[i] = elem.slice(2, -2);
    });
    console.log(codeArr);

    sentences.forEach(function(elem, i, arr) {
        if(codeArr.includes(arr[i])) typeMap.set(arr[i], 0);
        else typeMap.set(arr[i], 1);
    });
    console.log(typeMap);
    var result = new String;
    var resultCode = new String();
    typeMap.forEach(function(value, key, map) {
        if(value === 1) resultCode = resultCode + "result = result + " + "\"" + key + "\"" + ";\n";
        else {
            if (key[0] === "=") resultCode = resultCode + "result = result + " + "\"" + mapSubs.get(key.slice(1)) + "\"" + ";\n"
            else {
                var c = 0;
                mapSubs.forEach(function(v, k, m) {
                    if (key.includes(k)) {
                        var newV = key.replace(k, '\'' + v + '\'');
                        resultCode = resultCode + newV;
                        c = 1;
                    }
                })
                if (c === 0) resultCode = resultCode + key;
            }
        }
    })

    console.log(resultCode);

    try{
        eval(resultCode);
    } catch (err) {
        response.status(400).end("Unexpected request. Try something different! ( ͡° ͜ʖ ͡°)");
    }


    if(!request.body) return response.sendStatus(400);
    else {
        response.status(200).end(JSON.stringify({result: result}))
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})