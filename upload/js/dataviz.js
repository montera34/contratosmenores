/* Built in d3 http://d3js.org/

Bar chart based on DRY Bar Chart http://bl.ocks.org/mbostock/5977197 
Tooltip based on http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
Also some ideas come from https://github.com/erhardt/Attention-Plotter
*/

// D3 locale
var es_ES = {
    "decimal": ",",
    "thousands": ".",
    "grouping": [3],
    "currency": ["€", ""],
    "dateTime": "%a %b %e %X %Y",
    "date": "%d/%m/%Y",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    "shortDays": ["Dom", "Lun", "Mar", "Mi", "Jue", "Vie", "Sab"],
    "months": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    "shortMonths": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
}

var vis = d3.select("#vis"),
	isMobile = innerWidth < 768;

var barwidth = 1.98; //width of the bars

//Prepare canvas size
var margin = {top: 15, right: 20, bottom: 70, left: 65},
    width = vis.node().clientWidth - margin.left - margin.right,
    height = (isMobile ? 400 : 550) - margin.top - margin.bottom;

var	topvalue = 62000,
	activeopacity = 0.8;

var ES = d3.locale(es_ES),
	formatThousand = ES.numberFormat("n");

//Sets yScale
var yValue = function(d) { return d.SaldoCalculado; }, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // fuction that converts the data values into display values: value -> display
    yAxis =  d3.svg.axis().scale(yScale).orient("left").tickFormat(formatThousand).ticks(isMobile ? 5 : 10)

//Adds the div that is used for the tooltip
var div = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);	

//Sets Canvas
var svg = d3.select('#vis').append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var xScale = d3.time.scale()
    //.domain([mindate, maxdate])    // values between for month of january
    .range([0, width]);   // map these the the chart width = total width minus padding at both sides

//var parseDate = d3.time.format("%m-%d-%Y").parse;
var parseDate = d3.time.format("%Y-%m-%d").parse;

// define the x axis
var xAxis = d3.svg.axis()
    .orient("bottom")
    .scale(xScale)
	.tickFormat(isMobile ? ES.timeFormat("%b") : ES.timeFormat("%B"))
    .ticks(isMobile ? 4 : 8);
    
//Random variable
var randomvar = 0;

//Bars time scale
var barstimescale = svg.append('g').attr('id','barstimescale');

//replaces spaces and . in viplist function(d) { return d.SaldoCalculado; }
var replacement = function(d) { return d.replace(/\s+/g, '').replace(/\.+/g, '').replace(/\,+/g, '').replace(/[{()}]/g, '').toLowerCase();};

//Legends
var filtros = d3.select("#filters");
var barrasactivas = d3.select("#barrasactivas");
var randomselect = d3.select("#randomselect");
var totales = d3.select("#totales");

var totalImporte = 14456814.33; //Total of all contratos
totales.append("div").attr("class","backgr").style("width","100%").style("height","20px"); //barra total
totales.append("div").attr("class","overlapped").style("position","relative").style("top","-20px").style("height","20px").style("background-color","#AAAAAA").style("width","0px"); //barra con importe de barras activas
//Barra horizontal de totales
totales.select("div.backgr").append("p").html("Total: " + "14.456.814,33€").style("text-align","right").style("margin-right","5px").style("font-size","11px");
var totalsDomain = d3.scale.linear().domain([0, totalImporte]).range([0, totales.select("div.backgr").style("width")]);

//Class filters
var filters = [];
var barrasActivasSelected;

	
// Loop must go here
// Detect number of legends from html.
dropdowns = d3.selectAll("ul[id]");// Select dropdowns that correspond to taxonomies
var legends = []; //Initialization of legends
var q = d3.queue();	//queue for loading all files at once

for (var k = 1; k <= dropdowns.size(); k++){	//For each file
	legends[k-1] = d3.select("#legend"+(k-1).toString());	//select legend0, legend1, etc...
    q = q.defer(d3.tsv, "data/taxonomy."+k.toString()+".tsv");	//append defer functions to queue
}
	q.awaitAll(function(error, files) {	//callback function when all files are loaded
		for (var i = files.length-1; i >= 0; i--) {
			legends[i].selectAll('div')
				.data(files[i])
				.enter().append("li").append("a")
				.attr("class", function(d) { return "inactive";})
				.text(function(d) { return (d.name == '-')? d.name + ' ' : d.name +  " ("+ d.length +") ";});
		}	
	});
//console.log(dataset);
// d3.tsv("data/taxonomy.quien.tsv", function(error, data) {//reads the viplist.tsv file
// 	legend.selectAll('div')
// 		.data(data)
// 		.enter().append("li").append("a")
// 		.attr("class", function(d) { return "inactive";})
// 		.text(function(d) { return (d.name == '-')? d.name + ' ' : d.name +  " ("+ d.length +") ";})
// 		.on('click',function(d) { //when click on name
// 			var id = replacement(d.name); //flats and lowercases id of contractor
// 			filters[0] = id;	//Save id for active bar filtering
// 			var filtersText = '';
// 			filters.forEach(function(item){filtersText += '.' + item;}); //Create string to hold the classes for active bar filtering
// 			if (d3.select(this).attr('class')==='inactive'){
// 				//first time
// 				var suma = 0; // Initialize sum variable for active bars
// 				legend.select('.btn-success').attr('class','inactive');
// 				svg.selectAll('svg .bar').style("visibility","hidden");
// 				svg.selectAll('svg .bar'+ filtersText)
// 					.style("opacity",activeopacity)
// 					.style("visibility","visible") //selects contracts that match the id in its class
// 					.each(function(d,i){ //For each visible bar
// 						altura = d3.select(this).attr('height'); //Read bar height
// 						suma += yScale.invert(0) - yScale.invert(altura); // Calculate importe and sum
// 					});
// 				barrasactivas.select('p').html(formatThousand(suma)+'€');
// 				barrasActivasSelected = svg.selectAll('svg .bar'+ filtersText); //Selection of active bars
// 				//Look for activity in all centros de actividad
// 				barrasactivas.select('span').html(formatThousand(suma)+'€');
// 				legendcentros.selectAll('.centro') //select all centro buttons
// 					.style('background-color','#eee') //first time all buttons to grey color
// 					.each(function(d, i){	// for each button
// 					 	// See if d3.filter(d.centro) returns an non empty object to paint yellow this button
// 					 	if ( barrasActivasSelected.filter('.'+d.centro)[0].length > 0 ) { d3.select(this).style('background-color','yellow');}
// 					 })
// 				totales.select("div.overlapped").style("width",totalsDomain(suma));
// 				d3.select(this).transition().duration(0).attr("class","btn-success"); //adds class success to button
// 				filtros.select('#filterlayout1').html("<strong>" + d.name + "</strong> <br>Importe: <strong>" + d.sum + "€</strong><br>nº de contratos: " + d.length + "").style('opacity','1.0'); //write in description
// 			//second time
// 			} else if (d3.select(this).attr('class')==='btn-success'){
// 				delete filters[0];
// 				var suma = 0;
// 				var filtersText = '';
// 				filters.forEach(function(item){filtersText += '.' + item;});
// 				legendcentros.selectAll('.centro') //select all centro buttons
// 					.style('background-color','#eee') //first time all buttons to grey
// 				filtros.select('#filterlayout1').html("Todos").style('opacity','0.3'); //Erase from description
// 				d3.select(this).attr("class",function(d) { return "inactive";}); //removes .success class
// 				svg.selectAll('svg .bar'+ filtersText)
// 					.style("opacity",.4)
// 					.style("visibility","visible")
// 					.each(function(d,i){ //For each visible bar
// 						altura = d3.select(this).attr('height'); //Read bar height
// 						suma += yScale.invert(0) - yScale.invert(altura); // Calculate importe and sum
// 					});
// 				barrasactivas.select('p').html(formatThousand(suma)+'€');
// 				totales.select("div.overlapped").style("width",totalsDomain(suma));
// 				barrasactivas.select('span').html(formatThousand(suma)+'€');
// 			}
// 		}).append('img')
// 		.attr('src', function(d) { return d.img; });
// }); //end read viplist.tsv file

//Enters data.tsv and starts the graph-----------------------------------------
d3.tsv("data/data.reordenados.tsv", type, function(error, data) {//reads the data.tsv file
	data.forEach(function(d) {
    d.date = parseDate(d.date);
  });
	//Sets scales
  xScale.domain(d3.extent(data, function(d) { return d.date; })); //sets xScale depending on dates values
	yScale.domain([0,topvalue]).nice(); //sets yScale depending on entradas values

	//Sets X axis 
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	//Sets Y axis
	svg.append("g")
		.attr("class", "y axis")
		    	.call(yAxis).attr("font-size","12")
		  	.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.attr("font-size","10")
		.text("Euros");

	//Sets the bars with time scale
	barstimescale.selectAll(".bar")
		.data(data)
		.enter().append("rect")
		.attr("fill", "#666666")
		.style("opacity",0.4)
		.attr("class",
			function(d) {
				return replacement(d.quien) + " bar " + d.centro.toLowerCase().replace(/\.+/g, '').replace(/'/g,'') + "  " + d.actividad.replace(/\,+/g, ' ').toLowerCase() + " " + (d.importe < 0 ? " negativo" : " positivo"); 
			//sets the name of the person without spaces as class for the bar and adds class negativo/positivo depending on value
		}) 
	.attr("x", function(d) { return xScale(d.date); })
	.attr("width", barwidth+1)
	.attr("y", function(d) { return yScale(Math.max(0, d.importe > topvalue ? topvalue : d.importe)); })
	.attr("height", function(d) { return Math.abs(yScale( d.importe > topvalue ? topvalue : d.importe) - yScale(0)); })
	//The tooltips time scale
		.on("mouseover", function(d) {
				div.transition().style("opacity", 1);
				div.html(d.date.getFullYear() + '-' + (d.date.getMonth()+1) + '-' + d.date.getDate() + "<br/><strong/>"  + d.quien + "</strong/><br/>"  + formatThousand(d.importe) + "€ <br/>"  + d.actividad + "<br/>"  + d.centro + "<br/>" )
					.style("left", (d3.event.pageX + 1) + "px")
					.style("top", (d3.event.pageY - 120) + "px");
			})
		.on("mouseout", function(d) {
		    div.transition()
			.duration(500)
			.style("opacity", 0);
		});
		
	//Random button: posiciona las barras aleatoriamente en el eje vertical, manteniendo su posición horizontal por fecha
	randomselect.append("div").attr("class","inactive btn btn-default btn-xs pull-right")
		.text("Posición vertical aleatoria")
		.attr("title","Posiciona las barras que representan los gastos aleatoriamente, manteniendo la posición por fecha")
		.attr("id","random")
		.on('click',function(d) {
			if (randomvar == 0) {
				randomvar = 1;
				svg.selectAll('svg .bar')
				.attr("y",function(d) { return Math.random() * yScale(d.importe > topvalue ? topvalue : d.importe);});
				svg.select('#topline').style("visibility","hidden");
				d3.select(this).style("border","2px solid #000"); //adds class success to button
				svg.selectAll('.vipname').attr("y", height + 40).attr("x", 0);
				//svg.selectAll('.description').attr("y", height + 60).attr("x", 0);
				svg.select('#eventos_title').remove();
			} else {
				randomvar = 0;
				svg.selectAll('svg .bar')
				.attr("y", function(d) { return yScale(Math.max(0, d.importe > topvalue ? topvalue : d.importe)); });
				svg.select('#topline').style("visibility","visible");
				svg.selectAll('.vipname').attr("y", 40).attr("x", 40);
				//svg.selectAll('.description').attr("y", 60).attr("x", 40);
				d3.select(this).style("border","1px solid #888"); //adds class success to button
			}
		});
	// Debounce the resize with lodash
	// https://css-tricks.com/the-difference-between-throttling-and-debouncing/
    window.onresize = _.debounce(resize, 300);

    function resize() {
		// Update width and scales
		width = vis.node().clientWidth - margin.left - margin.right;

		xScale.range([0, width])
		yScale.range([height, 0]);

		// Change the svg width
		d3.selectAll("#vis svg")
            .attr("width", width + margin.left + margin.right);
        
		// Call the x axis
        d3.select(".x.axis")
            .call(xAxis);
        
        // Update bars
		barstimescale.selectAll(".bar")
			.attr("x", function(d) { return xScale(d.date); })
			.attr("width", barwidth+1)
			.attr("y", function(d) { return yScale(Math.max(0, d.importe > topvalue ? topvalue : d.importe)); })
			.attr("height", function(d) { return Math.abs(yScale( d.importe > topvalue ? topvalue : d.importe) - yScale(0)); });
	}
});


function type(d) {
  return d;
}