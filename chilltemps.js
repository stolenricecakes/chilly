window.charty = {};

var firstDate = new Date();
(function() {
  var my = this;
  my.chartData = "Time,H2O in,H2O out,Wort\n";
  charty = my;

  var counter = 0;
  
  my.zeropad = function(num) {
    if (num < 10) { 
      return "0" + num;
    }
    else {
      return num;
    }
  }

  my.timeFromDate = function(d) {
    return (my.zeropad(d.getHours()) + ":" + my.zeropad(d.getMinutes()) + ":" + my.zeropad(d.getSeconds()) + "." + d.getMilliseconds());

  };

  my.legendFormatter = function(data) {
    if (data.x == null) {
       // This happens when there's no selection and {legend: 'always'} is set.
//       return '<br>' + data.series.map(function(series) { return series.dashHTML + ' ' + series.labelHTML }).join('<br>');
       return  data.series.map(function(series) { return series.dashHTML + ' <span style="color: ' + series.color + ';font-weight:bold">' +  series.labelHTML + '</span>' }).join(' ');
    }

    //var html = this.getLabels()[0] + ': ' + data.xHTML;
    var d = new Date(parseInt(data.xHTML));
    var html =  "Time: " + my.timeFromDate(d);
    data.series.forEach(function(series) {
      if (!series.isVisible) return;
        var labeledData = '<span style="color: ' + series.color + ';">' + series.labelHTML + '</span>: ' + series.yHTML;
        if (series.isHighlighted) {
          labeledData = '<b>' + labeledData + '</b>';
        }
        html += series.dashHTML + ' ' + labeledData;
    });
   return html;
  };



  my.drawGraph = function () { 
    var el = document.getElementById("chart");
    var dygraphData = jsonToDygraph(mockdata);

    new Dygraph(el,
	my.chartData,
	{ 
          axes:  {
           x : {
             axisLabelFormatter: function(num, granularity, opts, dygraph) {
                // d = numeric epoc, granularity == 0, which is SECONDLY
                var d = new Date(num);
                return my.timeFromDate(d);
             } 
	   }
          },
          colors: [ "#0000FF", "#FF00FF", "#902320" ],
          legendFormatter: my.legendFormatter,
          legend: "always" 
        });
  }; 

  my.jsonToDygraph = function(data) {
    var d = new Date().getTime();
    if (data.length) { 
       // this is not an object - likely an array.
       var ary = []; 
       for ( i = 0; i < data.length; i++) {
           //ary.push( (data[i].millis + d) + "," + data[i].h2oin + "," + data[i].h2oout  + "," + data[i].wort);
           ary.push( (d + data[i].millis) + "," + data[i].h2oin + "," + data[i].h2oout  + "," + data[i].wort);
       }
       return ary.join("\n");
    } 
    else {
      // for now, do millis from data... later, snag your own.
      return ( d + "," + data.h2oin + "," + data.h2oout  + "," + data.wort + "\n");
    }
  };

  my.newTemp = function(newTemp) {
     my.chartData += my.jsonToDygraph(newTemp);
     for (prop in newTemp) {
        if (prop !== 'millis') {
           document.getElementById(prop).innerHTML = newTemp[prop];
        }
     }
     my.drawGraph(); 
  };

  var idx = 0;
  my.moarData = function() {
     if (idx < mockdata.length) {
        my.newTemp(mockdata[idx]);
        idx++;
        setTimeout(my.moarData, 1000);
     }
  }
   
})();


const SerialPort = require('serialport')
try {
  var port = new SerialPort('/dev/ttyACM0', {
     baudRate: 9600
  });
}
catch(ex) {
   document.getElementById("statusMsg").innerHTML = "<span class='error'>Error connecting to serial</span>";
   charty.moarData();
}

var message = '';
reggy = /({[a-z":0-9\-,\.]+})/;
port.on('error', function(data) {
   document.getElementById("statusMsg").innerHTML = "<span class='error'>Error reading from serial</span>";
   charty.moarData();
});
port.on('data', function(data) {
  document.getElementById("statusMsg").innerHTML = "connected to serial";
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

