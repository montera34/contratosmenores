/* Built in d3 http://d3js.org/

Bar chart based on DRY Bar Chart http://bl.ocks.org/mbostock/5977197 
Tooltip based on http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
Also some ideas come from https://github.com/erhardt/Attention-Plotter
*/

var barwidth = 1.98; //width of the bars

//Prepare canvas size
var margin = {top: 15, right: 20, bottom: 70, left: 65},
    width = 1300 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;
var	topvalue = 10000,
		activeopacity = 0.8;

var formatComma = d3.format(".0f");

//Sets yScale
var yValue = function(d) { return d.SaldoCalculado; }, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // fuction that converts the data values into display values: value -> display
    yAxis =  d3.svg.axis().scale(yScale).orient("left").tickFormat(formatComma);

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

//Bars time scale
var barstimescale = svg.append('g').attr('id','barstimescale');

//replaces spaces and . in viplist function(d) { return d.SaldoCalculado; }
var replacement = function(d) { return d.replace(/\s+/g, '').replace(/\.+/g, '').toLowerCase();};

//set top line
var topline = svg.append('g').attr('id','topline');
svg.append('g').attr('class','persontable');

//set special dates
var specialdates = svg.append('g').attr('class','specialdates').attr('id','specialdates');

//Legends
var legend = d3.select("#legend").attr("class", "legend");
var legendcosas = d3.select("#legendcosas").attr("class", "legendcosas");

d3.tsv("data/viplist.tsv", function(error, data) {//reads the viplist.tsv file
	//legend.append("h5").style("font-weight","bold").text("Selecciona "); //legend title
	legend.selectAll('div')
		.data(data)
		.enter().append("div")
		.attr("class", function(d) { return "inactive btn btn-default btn-xs";})
		.text(function(d) { return (d.entidad == '-')? d.people + ' ' : d.people + " ("+ d.entidad+") ";})
		.on('click',function(d) { //when click on name
			var personflat = replacement(d.people); //removes spaces and . from person name;
			if (d3.select(this).attr('class')==='inactive btn btn-default btn-xs'){
				//first time
				svg.selectAll('svg .bar').style("visibility","hidden");
				svg.selectAll('svg .bar.'+personflat).style("opacity",activeopacity).style("visibility","visible");
				d3.select(this).transition().duration(0).attr("class","btn-success btn btn-default btn-xs"); //adds class success to button
				svg.selectAll('.personatable text').remove(	);
				svg.selectAll('.vipname').text("");
				svg.selectAll('.description').text("");
				if (d.entidad == '-') { //don't show  ( ) if the field entiad is empty
						svg.select('.persontable').append('text').text(d.people).attr("class","vipname").attr("x", 40).attr("y", 40);
				} else {
						svg.select('.persontable').append('text').text(d.people + " ("+ d.entidad+")").attr("class","vipname").attr("x", 40 ).attr("y", 40);
				}
				svg.select('.persontable').append('text').text(d.description).attr("class","description").attr("x", 40 ).attr("y", 60);
			//second time
			} else if (d3.select(this).attr('class')==='btn-success btn btn-default btn-xs'){
				svg.selectAll('.vipname').text("");
				svg.selectAll('.description').text("");
				svg.selectAll('.personatable').remove(	);
				d3.select(this).attr("class",function(d) { return "inactive btn btn-default btn-xs";}); //removes .success class
				svg.selectAll('svg .bar').style("opacity",.4).style("visibility","visible");
			}
		}).append('img')
		.attr('src', function(d) { return d.img; });
}); //end read viplist.tsv file

//Legend de cosas
d3.tsv("data/thinglist.tsv", function(error, data) {//reads the thinglist.tsv file
	legendcosas.selectAll('div')
		.data(data)
		.enter().append("div")
		.attr("class", function(d) { return "inactive btn btn-default btn-xs thing";})
		.attr("id",function(d) { return d.cosa;})
		.text(function(d) { return d.cosa; })
		.on('click',function(d) { //when click on name
			var cosa = d.cosa;
			if (d3.select(this).attr('class')==='inactive btn btn-default btn-xs thing'){
				//first time
				svg.selectAll('svg .bar').style("visibility","hidden");
				svg.selectAll('svg .bar.'+ cosa).style("opacity",activeopacity).style("visibility","visible");
				d3.select(this).transition().duration(0).attr("class","btn-success btn btn-default btn-xs thing"); //adds class success to button
				svg.selectAll('.personatable text').remove(	);
				svg.selectAll('.vipname').text("");
				svg.selectAll('.description').text("");
				svg.select('.persontable').append('text').text(cosa).attr("class","vipname").attr("x", 40).attr("y", 40);
			//second time
			} else if (d3.select(this).attr('class')==='btn-success btn btn-default btn-xs thing'){
				svg.selectAll('.vipname').text("");
				svg.selectAll('.personatable').remove(	);
				d3.select(this).attr("class",function(d) { return "inactive btn btn-default btn-xs thing";}); //removes .success class
				svg.selectAll('svg .bar').style("opacity",.4).style("visibility","visible");
			}
		});	
	legendcosas.select('#ingles').html("El Corte Inglés");
	legendcosas.select('#efectivo').html("Disposición en efectivo oficina");
}); //end read thinglist.tsv file

//Enters data.tsv and starts the graph-----------------------------------------
d3.tsv("data/data.tsv", type, function(error, data) {//reads the data.tsv file
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
		.attr("fill", function(d) { return d.importe < 0 ? "#339900" : "#336600"; })
		.style("opacity",0.4)
		.attr("class",
			function(d) {
				return replacement(d.quien) + " bar " + d.operacion.toLowerCase() + "  " + d.actividad.replace(/\,+/g, ' ').toLowerCase() + "  " + d.comercio.replace(/\,+/g, ' ').toLowerCase() + " " + (d.importe < 0 ? " negativo" : " positivo"); 
			//sets the name of the person without spaces as class for the bar and adds class negativo/positivo depending on value
		}) 
	.attr("x", function(d) { return xScale(d.date); })
	.attr("width", barwidth+1)
	//.attr("y", function(d) { return yScale(Math.max(0, d.importe)); })
	.attr("y", function(d) { return yScale(Math.max(0, d.importe > topvalue ? topvalue : d.importe)); })
	//.attr("height", function(d) { return d.importe > topvalue ? yScale(topvalue) : yScale(Math.max(0, d.importe)); })
	.attr("height", function(d) { return Math.abs(yScale( d.importe > topvalue ? topvalue : d.importe) - yScale(0)); })
	//.attr("height", function(d) { return Math.abs(yScale(d.importe < 0 ? 0 : d.importe) - yScale(0)); })
	//The tooltips time scale
		.on("mouseover", function(d) {
				div.transition().style("opacity", 1);
				div.html(d.date.getFullYear() + '-' + (d.date.getMonth()+1) + '-' + d.date.getDate() + "<br/><strong/>"  + d.quien + "</strong/><br/>"  + formatComma(d.importe) + "€ <br/>"  + d.actividad + "<br/>"  + d.comercio + "<br/>"  + d.operacion)
					.style("left", (d3.event.pageX + 1) + "px")
					.style("top", (d3.event.pageY - 120) + "px");
			})
		.on("mouseout", function(d) {
		    div.transition()
			.duration(500)
			.style("opacity", 0);
		});
		
	//Random button: posiciona las barras aleatoriamente en el eje vertical, manteniendo su posición horizontal por fecha
	legendcosas.append("div").attr("class","inactive btn btn-default btn-xs pull-right")
		.text("Posición vertical aleatoria")
		.attr("title","Posiciona las barras que representan los gastos aleatoriamente, manteniendo la posición por fecha")
		.on('click',function(d) {
			svg.selectAll('svg .bar')
			.attr("y",function(d) { return Math.random() * yScale(d.importe > topvalue ? topvalue : d.importe);});
			svg.select('#topline').style("visibility","hidden");
			d3.select(this).style("border","2px solid #000"); //adds class success to button
		});
	
		
	//Special dates
	specialdates.append("text")
		.attr("x", 5)
		.attr("y", height+40)
		.text("Eventos relacionados");
	specialdates.append("text")
		.attr("x", function(d) { return xScale(parseDate('2009-05-22')) + 3; })
		.attr("y", height+40)
		.text("Lanzamiento de preferentes de Caja de Madrid"); 
	specialdates.append('line')
    .attr('y1', height+24)
    .attr('y2', height+40)
    .attr('x1', function(d) { return xScale(parseDate('2009-05-22')); })
    .attr('x2', function(d) { return xScale(parseDate('2009-05-22')); })
		.attr('title','Lanzamiento de preferentes de Caja de Madrid\n2009-05-22')
		.on("mouseover", function(d) {      
		  d3.select(this).attr('y1', 0)
		    })
		.on("mouseout", function(d) {       
		    d3.select(this).attr('y1', height+20)  
			});
	specialdates.append("text")
		.attr("x", function(d) { return xScale(parseDate('2010-01-28')) + 6; })
		.attr("y", height+60)
		.text("Nombramiento Rato como presidente de Caja de Madrid"); 
	specialdates.append('line')
    .attr('y1', height+44)
    .attr('y2', height+60)
    .attr('x1', function(d) { return xScale(parseDate('2010-01-28')) + 1; })
    .attr('x2', function(d) { return xScale(parseDate('2010-01-28')) + 1; })
		.attr('title','Nombramiento de Rato\ncomo Presidente de Caja de Madrid\n2010-01-28')
		.on("mouseover", function(d) {      
		  d3.select(this).attr('y1', 0)
		    })
		.on("mouseout", function(d) {       
		    d3.select(this).attr('y1', height+44)  
			});
	specialdates.append("text")
		.attr("x", function(d) { return xScale(parseDate('2011-07-20')) + 3; })
		.attr("y", height+40)
		.text("Salida a bolsa Bankia"); 
	specialdates.append('line')
    .attr('y1', height+24)
    .attr('y2', height+40)
    .attr('x1', function(d) { return xScale(parseDate('2011-07-20')); })
    .attr('x2', function(d) { return xScale(parseDate('2011-07-20')); })
		.attr('title','Salida a bolsa de Bankia\n2011-07-20')
		.on("mouseover", function(d) {      
		  d3.select(this).attr('y1', 0)
		    })
		.on("mouseout", function(d) {       
		    d3.select(this).attr('y1', height+20)  
			});
});

//Top line
topline.append('line')
	.attr('y1', 4)
	.attr('y2', 4)
	.attr('x1', 0)
	.attr('x2', 1400)
	.attr("class", "topline")
	.on("mouseover", function(d) {
	  div.transition()
	      .duration(200)
	      .style("opacity", .9);
	  div.html("Gastos por encima de 10.000€" )
	      .style("left", (d3.event.pageX) + "px") 
	      .style("top", (d3.event.pageY) - 35 + "px");  
	  })
	.on("mouseout", function(d) { 
	  div.transition()
	      .duration(500)
	      .style("opacity", 0);
	});

function type(d) {
  return d;
}
