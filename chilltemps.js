window.charty = {};

var firstDate = new Date();
(function() {
  var counter = 0;
  var testData = [
        {"millis":2352,"h2oin":69.80,"h2oout":71.60,"wort":210.20},
	{"millis":3005,"h2oin":70.70,"h2oout":71.60,"wort":210.10},
	{"millis":3658,"h2oin":70.70,"h2oout":71.60,"wort":210.0},
	{"millis":4311,"h2oin":69.80,"h2oout":91.60,"wort":209.8},
	{"millis":4964,"h2oin":70.70,"h2oout":105.50,"wort":209.7},
	{"millis":5617,"h2oin":69.80,"h2oout":120.40,"wort":209.6},
	{"millis":6269,"h2oin":70.70,"h2oout":140.90,"wort":209.6},
	{"millis":6923,"h2oin":69.80,"h2oout":160.8,"wort":209.5},
	{"millis":7576,"h2oin":69.80,"h2oout":170.9,"wort":209.4},
	{"millis":8228,"h2oin":69.80,"h2oout":180.1,"wort":209.33},
	{"millis":8882,"h2oin":70.70,"h2oout":190.2,"wort":209.3}
 ];

 charty.data = { 
   x: ['x'],
   h2oin: ['h2oin'],
   h2oout: ['h2oout'],
   wort: ['wort']
 }

 charty.chart = c3.generate ({
      data: {
        x: 'x',
        columns: [
          ['x'],
          ['h2oin'],
          ['h2oout'],
          ['wort']
        ],
        colors: {
          h2oin: '#0000FF',
          h2oout: '#FF00FF',
          wort: '#902320'
        }
      },
      line : {
        connectNull: true
      },
      point : {
        show : false
      },
      axis: {
        x: {
           type: 'timeseries',
           tick: {
              format: '%H:%M:%S'
           }
        } 
      } 
  }); 

  charty.newTemp = function(newTemp) {
     var colAry = [];
     for (prop in newTemp) {
        var ary = [];
        if (prop === 'millis') {
           ary.push("x"); 
           //var myDate = new Date(firstDate.getTime() + newTemp[prop]);
           //ary.push(myDate);
           //console.log(myDate.getTime() + " [" + newTemp[prop] + "]  -> " + myDate);
           ary.push(new Date());
        }
        else {
           ary.push(prop);
           document.getElementById(prop).innerHTML = newTemp[prop];
           if (newTemp[prop] < 0) {
              ary.push(null);
           } 
           else {
              ary.push(newTemp[prop]);
           }
        }

        colAry.push(ary);
     }

     charty.chart.flow( {
       columns: colAry,
       length: 0
     });   
      // 150 datapoints is plenty for the chart... once we reach that, start culling??

/*
    var maxPoints = 150;
    var filter = 1;
    var rows = allData[0];
    if (rows.length > maxRows) {
      filter = Math.floor(rows.length / maxRows);
      for (i = rows.length - 1; i >= 0; i--){
         if (i % filter != 0) {
           for (j = 0; j < allData.columns.length; j++) {
              allData.columns[j].splice(i, 1);
           }            
         }
       } 
       charty.chart.load(allData);
    }
*/
  }

  var idx = 0;

  function moarData() {
     if (idx < testData.length) {
        var row = testData[idx];
        charty.chart.flow( {
           columns: [
              ['x', row.millis],
              ['h2oin', row.h2oin],
              ['h2oout', row.h2oout],
              ['wort', row.wort]
           ],
           length: 0
        });   

        idx++;
    //    setTimeout(moarData, 2000);
     }
  }
   
  //setTimeout(moarData, 2000);

  

})();


const SerialPort = require('serialport')
var port = new SerialPort('/dev/ttyACM0', {
   baudRate: 9600
});

var message = '';
reggy = /({[a-z":0-9\-,\.]+})/;
port.on('data', function(data) {
  message += data;
  if (reggy.test(message)) {
     var reading = reggy.exec(message)[0];
     var jsonReading = JSON.parse(reading);
     charty.newTemp(jsonReading);
     message = message.replace(reggy, "");
  }
  else if (message && message.length > 512) {
     message = '';
  }
});
