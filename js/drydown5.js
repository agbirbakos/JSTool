// Helper function to caluate Equilibrium moist content
function eqMoist(maxt, mint, relh) {

  var A = 0.0001557,
    B = 45,
    C = 2,
	relh,
    temp,
    res;

  maxt = Math.max(maxt, 0);
  mint = Math.max(mint, 0);
  temp = (0.5 * (maxt + mint) - 32) * (5 / 9); //0.5 * (maxt + mint);
  
  // Calculate RH from min and Max temperatures  
  //relh = 100*Math.min(0.59 + 0.44*((Math.exp((17.269*mint)/(237.3 + mint))*0.6178)/(Math.exp((17.269*maxt)/(237.3 + maxt))*0.6178)),0.99);
  relh = Math.min(relh, 99);
  
  res = Math.pow(Math.log(1 - relh / 100) / (-A * (temp + B)), 1 / C);

  return 100 * res / (100 - res) // in wet basis
}

// Function to calculate drydown

function drydown(Tmax, Tmin, relh, M0) {

  // Outputs
  var Me = [], //equilibrum moisture content (%)
    Me3 = [], // 3-day moving avergage Me (%)
    M = []; // Predicted Grain moisture (%)
    

  // Calculate daily Me
  for (i = 0; i < Tmax.length; i++) {
    Me[i] = eqMoist(Tmax[i], Tmin[i], relh[i])
  }

  // Calculate 3-day moving average Me
  for (i = 2; i < Me.length; i++) {
    Me3[i - 2] = (Me[i - 2] + Me[i - 1] + Me[i]) / 3
  }

  // Calculate dry down
  M[0] = M0

  for (i = 0; i < Me3.length - 1; i++) {

	M[i + 1] = (M[i] - 0.062 * (M[i] - Me3[i]))

  }

  return M

}

function getData() {
	// Inputs 
	
	var nyears = 30; // how many years of data to use 
	
	// get dates 
	var start_date = document.getElementById("obsdate").value, 
		start_date = start_date.replace(/[^0-9\.]+/g, "");
		
	var lat = document.getElementById("latitude").value,
		lng = document.getElementById("longitude").value;
		
	// URL from IEM 
	var url1 = "https://mesonet.agron.iastate.edu/pickup/example.json" //"http://mesonet.agron.iastate.edu/json/prism/"+lng+"/"+lat+"/"+start_date+"-"+today;

	var M0 = parseFloat(document.getElementById("M0").value);
	
	var i,high = [],low = [],rh = [], out = {};
				
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			
			// Read data from url
			var Met = JSON.parse(this.responseText);

			for(j = 0; j < nyears; j++){
				
				for (i = 0; i < Met.data[String(yyyy - j)].dates.length; i++) {
					high[i] = Met.data[String(yyyy- j )].high[i];
					low[i] = Met.data[String(yyyy - j)].low[i];
					rh[i] = Met.data[String(yyyy - j)].rh[i];
			}
			
			var predicted = drydown(high,low,rh,M0);
			
			// round to 2 decimals
			for (i = 0; i < predicted.length; i++) {
				predicted[i] = parseFloat(predicted[i].toFixed(2));
				}
				
			// Save into object 			
			out[String(yyyy - j)] = predicted				
			
			}
			
			// Print output data to the console
			console.log(url1);	  	  
			console.log(out[String('2000')]);
			
			
			Highcharts.chart('container', {
			  title: {
				text: "Corn grain dry down"
			  },

			  xAxis: {
				type: 'datetime'
			  },

			  yAxis: [{// Primary yAxis
				gridLineWidth: 2,
				title: {
				  text: "Grain moisture"
				},
				labels: {
						format: '{value} %',
						style: {
							color: Highcharts.getOptions().colors[1]
						}
				},
				opposite: false
			  },{// Secondary yAxis
				gridLineWidth: 2,
				title: {
				  text: "Drying Costs ($ per bushel)"
				},
				opposite: true
			  }],
				tooltip: {
					shared : true
			  },
			  legend: {},

			  series: [{
				name: 'Estimated (with 2018 weather)',
				data: out[String(yyyy)],//.slice(0,(today - obsday)/864e5 + 1),
				//pointStart: obsday,
				pointInterval: 864e5,
				zIndex: 3,
				marker: {
				  fillColor: 'white',
				  lineWidth: 2,
				  lineColor: Highcharts.getOptions().colors[0]
				}
			  }, {
				name: 'Estimated (with 2017 weather)',
				data: out[String(yyyy-1)],//.slice(0,(today - obsday)/864e5 + 1),
				//pointStart: obsday,
				pointInterval: 864e5,
				zIndex: 3,
				marker: {
				  fillColor: 'white',
				  lineWidth: 2,
				  lineColor: Highcharts.getOptions().colors[0]
				}
			  }/*, {
				name: 'Projected (with historical weather)',
				data: predicted.slice((today - obsday)/864e5,(enday - obsday)/864e5 + 1),
				pointStart: today,
				pointInterval: 864e5,
				zIndex: 2,
				color: Highcharts.getOptions().colors[5],
				marker: {
					enabled: false
				},
				tooltip: {
						valueSuffix: '%'
				}
			  },{
				name: 'Projected range (with historical weather)',
				data: ranges.slice((today - obsday)/864e5,(enday - obsday)/864e5 + 1),
				pointStart: today,
				pointInterval: 864e5,
				zIndex: 2,
				type: 'arearange',
				lineWidth: 0,
				linkedTo: ':previous',
				color: Highcharts.getOptions().colors[5],
				fillOpacity: 0.3,
				zIndex: 0,
				marker: {
				  enabled: false
				}
			  },{
				name: 'Drying Costs',
				yAxis: 1,
				data: dryCost,
				pointStart: obsday,
				pointInterval: 864e5,
				zIndex: 1,
				lineWidth : 2,
				color: Highcharts.getOptions().colors[1],
				marker: {
					enabled: false
				},
				tooltip: {
						valueSuffix: '$ per bushel '
				}
			  }*/
			  ]
			});

    }
  };
  xhttp.open("GET", url1, true);
  xhttp.send();

}
