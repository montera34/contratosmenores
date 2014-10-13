/* Built in d3 http://d3js.org/

Bar chart based on DRY Bar Chart http://bl.ocks.org/mbostock/5977197 
Tooltip based on http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
Also some ideas come from https://github.com/erhardt/Attention-Plotter
*/

var barwidth = 1.98; //width of the bars

//Prepare canvas size
var margin = {top: 35, right: 20, bottom: 100, left: 65},
    width = 1300 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

var formatComma = d3.format(",");

//Sets yScale
var yValue = function(d) { return d.SaldoCalculado; }, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // fuction that converts the data values into display values: value -> display
    yScaleB = d3.scale.linear().range([height, 0]),
    yAxis =  d3.svg.axis().scale(yScale).orient("left").tickFormat(formatComma);
    yAxisB = d3.svg.axis().scale(yScaleB).orient("left").tickFormat(formatComma);

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

//Sets xScale
// define the x scale (horizontal)
var mindate = new Date(2003,3,1),
    maxdate = new Date(2012,6,1);
var xScale = d3.time.scale()
    //.domain([mindate, maxdate])    // values between for month of january
    .range([0, width]);   // map these the the chart width = total width minus padding at both sides

//var parseDate = d3.time.format("%m-%d-%Y").parse;
var parseDate = d3.time.format("%Y-%m-%d").parse;

// define the x axis
var xAxis = d3.svg.axis()
    .orient("bottom")
    .scale(xScale)
    .ticks(d3.time.years, 1);

// draw x axis with labels and move to the bottom of the chart area
svg.append("g")
    .attr("class", "xaxis")   // give it a class so it can be used to select only xaxis labels  below
    .attr("transform", "translate(0," + (height) + ")")
    .call(xAxis);

//Bars time scale
var barstimescale = svg.append('g').attr('id','barstimescale');

//replaces spaces and . in viplist function(d) { return d.SaldoCalculado; }
var replacement = function(d) { return d.replace(/\s+/g, '').replace(/\.+/g, '').toLowerCase();};

//Enters data.tsv and starts the graph-----------------------------------------
d3.tsv("data/data.tsv", type, function(error, data) {//reads the data.tsv file
	data.forEach(function(d) {
    d.date = parseDate(d.date);
  });
	//Sets scales
  xScale.domain(d3.extent(data, function(d) { return d.date; })); //sets xScale depending on dates values
  //yScale.domain(d3.extent(data, function(d) { return d.entradas; })).nice(); //sets yScale depending on entradas values
	yScale.domain([0,15000]).nice(); //sets yScale depending on entradas values

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

d3.tsv("data/viplist.tsv", function(error, data) {//reads the viplist.tsv file
	var legend = d3.select("#legend").attr("class", "legend");
	legend.append("h5").style("font-weight","bold").text("Selecciona una persona"); //legend title
	legend.selectAll('div')
		.data(data)
		.enter().append("div")
		.attr("class", function(d) { return "inactive btn btn-default btn-xs";})
		.text(function(d) { return d.people + " ("+ d.entidad+")"; })
		.on('click',function(d) { //when click on name
			var personflat = replacement(d.people), //removes spaces and . from person name
			    tipodonante = d.tipo,
			    confirmado = d.confirmado;
			if (d3.select(this).attr('class')==='inactive btn btn-default btn-xs'){
				//first time
				svg.selectAll('svg .bar.'+personflat).style("opacity",.8);
				d3.select(this).transition().duration(0).attr("class","btn-warning btn btn-default btn-xs"); //adds class .warning to button
			//second time
			} else if (d3.select(this).attr('class')==='btn-warning btn btn-default btn-xs'){
				d3.select(this).attr("class",function(d) { return "inactive btn btn-default btn-xs";}); //removes .active class
				svg.selectAll('svg .bar').style("opacity",.1);
			}
		});
}); //end read viplist.tsv file
		
	//Sets the bars with time scale
	barstimescale.selectAll(".bar")
      	.data(data)
    	.enter().append("rect")
    	.attr("fill", function(d) { return d.importe < 0 ? "#339900" : "#336600"; })
	.attr("opacity",.1)
	.attr("class", 
		function(d) {
			return replacement(d.quien) + " bar " + d.operacion.toLowerCase() + (d.importe < 0 ? " negativo" : " positivo"); 
			//sets the name of the person without spaces as class for the bar and adds class negativo/positivo depending on value
		}) 
	.attr("x", function(d) { return xScale(d.date); })
	.attr("width", barwidth+1)
	.attr("y", function(d) { return yScale(Math.max(0, d.importe)); })
	.attr("height", function(d) { return Math.abs(yScale(d.importe < 0 ? 0 : d.importe) - yScale(0)); })
	//The tooltips time scale
		.on("mouseover", function(d) {      
		    div.transition()        
			.duration(200)      
			.style("opacity", .9);      
		    div.html(d.date.getFullYear() + '-' + d.date.getMonth() + '-' + d.date.getDate() + "<br/><strong/>"  + d.quien + "</strong/><br/>"  + d.importe + "€ <br/>"  + d.actividad + "<br/>"  + d.comercio + "<br/>"  + d.operacion)
			.style("left", (d3.event.pageX + 1) + "px")
			.style("top", (d3.event.pageY - 120) + "px");
		    })
		.on("mouseout", function(d) {
		    div.transition()
			.duration(500)
			.style("opacity", 0);
		});

});


function type(d) {
  d.entradas = +d.entradas;
  d.saldo = +d.saldo;
  return d;
}
