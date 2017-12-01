const axios = require('axios');
const fs = require('fs')
const sqlite3 = require('sqlite3');
const jsonSortify = require('json.sortify');

function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];
    ///remove www
    var splitArr = hostname.split('.');
    if(splitArr[0] === 'www'){
        return hostname.replace('www.', '')
    }else { return hostname}

}
function extractRootDomain(url) {
    var domain = extractHostname(url),
        splitArr = domain.split('.'),
        arrLen = splitArr.length;

    //extracting the root domain here
    //if there is a subdomain
    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
        if (splitArr[arrLen - 1].length == 2 && splitArr[arrLen - 1].length == 2) {
            //this is using a ccTLD
            domain = splitArr[arrLen - 3] + '.' + domain;
        }
    }
    return domain;
}

function getHistoryData() {
  try{
    const db = new sqlite3.Database('/Users/yohaynahmany/Library/Application Support/Google/Chrome/Default/History');
    let histograma = {};

    db.serialize(() => {
      db.each("SELECT * FROM urls ", function(err, row) {
        //LIMIT 1000000
        // histograma[extractHostname(row.url)] = 1 + (histograma[extractHostname(row.url)] || 0);
        histograma[extractHostname(row.url)] = {
          key: extractHostname(row.url),
          value: 1 + ((histograma[extractHostname(row.url)] !== undefined)? histograma[extractHostname(row.url)].value : 0)  }

      }, (err, rows) => {
        var values = Object.keys(histograma).map(function (key) { return histograma[key]; });
        let array = [];
        array.push(values.map((obj) => obj))
        array = array[0]
        array.sort((a,b) => {
          return (a.value - b.value) *-1
        })
        console.log(array);


      });

    })

    db.close();
  } catch(e)  {
    console.log(e)
  }


}
getHistoryData();
