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

//Sets xScale
// define the x scale (horizontal)
//var mindate = new Date(2014,12,1),
//    maxdate = new Date(2015,2,1);

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

//set top line
var topline = svg.append('g').attr('id','topline');
svg.append('g').attr('class','persontable');

//set special dates
var specialdates = svg.append('g').attr('class','specialdates').attr('id','specialdates');

//Legends
var legend = d3.select("#legend").attr("class", "legend");
var legendcosas = d3.select("#legendcosas").attr("class", "legendcosas");
var legendcentros = d3.select("#legendcentros").attr("class", "legendcentros");

d3.tsv("data/viplist.tsv", function(error, data) {//reads the viplist.tsv file
	legend.selectAll('div')
		.data(data)
		.enter().append("div")
		.attr("class", function(d) { return "inactive btn btn-default btn-xs";})
		.text(function(d) { return (d.entidad == '-')? d.people + ' ' : d.people + " ("+ d.ncontratos +") ";})
		.on('click',function(d) { //when click on name
			var personflat = replacement(d.people); //removes spaces and . from person name;
			if (d3.select(this).attr('class')==='inactive btn btn-default btn-xs'){
				//first time
				legend.select('.btn-success').attr('class','inactive btn btn-default btn-xs');
				svg.selectAll('svg .bar').style("visibility","hidden");
				svg.selectAll('svg .bar.'+personflat).style("opacity",activeopacity).style("visibility","visible");
				d3.select(this).transition().duration(0).attr("class","btn-success btn btn-default btn-xs"); //adds class success to button
				svg.selectAll('.personatable text').remove(	);
				svg.selectAll('.vipname').text("");
				svg.selectAll('.description').text("");
				if (d.ncontratos == '-') { //don't show  ( ) if the field entidad is empty
						svg.select('.persontable').append('text').text(d.people).attr("class","vipname")
						.attr("x", function() { return (randomvar == 0) ? 40 : 0;})
						.attr("y", function() { return (randomvar == 0) ? 40 : height + 40;});
				} else {
						svg.select('.persontable').append('text').text(d.people + " (contratos: " + d.ncontratos + ", importe: " + d.importe + "€)" ).attr("class","vipname")
						.attr("x", function(d) { return randomvar == 0 ? 40 : 0;})
						.attr("y", function(d) { return randomvar == 0 ? 40 : height + 40;});
				}
				svg.select('.persontable').append('text').text(d.description).attr("class","description")
						.attr("x", function(d) { return randomvar == 0 ? 40 : 0;})
						.attr("y", function(d) { return randomvar == 0 ? 60 : height + 60;});
				
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
				legendcosas.select('.btn-success').attr('class','inactive btn btn-default btn-xs thing');
				svg.selectAll('svg .bar').style("visibility","hidden");
				svg.selectAll('svg .bar.'+ cosa).style("opacity",activeopacity).style("visibility","visible");
				d3.select(this).transition().duration(0).attr("class","btn-success btn btn-default btn-xs thing"); //adds class success to button
				svg.selectAll('.personatable text').remove(	);
				svg.selectAll('.vipname').text("");
				svg.selectAll('.description').text("");
				svg.select('.persontable').append('text').text(d.cosa).attr("class","vipname")
					.attr("x", function() { return (randomvar == 0) ? 40 : 0;})
					.attr("y", function() { return (randomvar == 0) ? 40 : height + 40;});
			//second time
			} else if (d3.select(this).attr('class')==='btn-success btn btn-default btn-xs thing'){
				svg.selectAll('.vipname').text("");
				svg.selectAll('.personatable').remove(	);
				d3.select(this).attr("class",function(d) { return "inactive btn btn-default btn-xs thing";}); //removes .success class
				svg.selectAll('svg .bar').style("opacity",.4).style("visibility","visible");
			}
		});	
}); //end read thinglist.tsv file

//Legend de centros presupuestarios
d3.tsv("data/centroslist.tsv", function(error, data) {//reads the thinglist.tsv file
	legendcentros.selectAll('div')
		.data(data)
		.enter().append("div")
		.attr("class", function(d) { return "inactive btn btn-default btn-xs centro";})
		.attr("id",function(d) { return d.centro;})
		.text(function(d) { return d.descripEs; }) //Elige el idioma de la leyenda
		.on('click',function(d) { //when click on name
			var centro = d.centro;
			if (d3.select(this).attr('class')==='inactive btn btn-default btn-xs centro'){
				//first time
				legendcentros.select('.btn-success').attr('class','inactive btn btn-default btn-xs centro');
				svg.selectAll('svg .bar').style("visibility","hidden");
				svg.selectAll('svg .bar.'+ centro).style("opacity",activeopacity).style("visibility","visible");
				d3.select(this).transition().duration(0).attr("class","btn-success btn btn-default btn-xs centro"); //adds class success to button
				svg.selectAll('.personatable text').remove(	);
				svg.selectAll('.vipname').text("");
				svg.selectAll('.description').text("");
				svg.select('.persontable').append('text').text(d.descripEs).attr("class","vipname")
					.attr("x", function() { return (randomvar == 0) ? 40 : 0;})
					.attr("y", function() { return (randomvar == 0) ? 40 : height + 40;});
			//second time
			} else if (d3.select(this).attr('class')==='btn-success btn btn-default btn-xs centro'){
				svg.selectAll('.vipname').text("");
				svg.selectAll('.personatable').remove(	);
				d3.select(this).attr("class",function(d) { return "inactive btn btn-default btn-xs centro";}); //removes .success class
				svg.selectAll('svg .bar').style("opacity",.4).style("visibility","visible");
			}
		});
//	legendcentros.select('#publicitat').html("Of. Publicitat Anuncis Oficials");
//	legendcentros.select('#tecnologies').html("S. Tecnologies de la informacio y la comunicacio"); //TODO COntinuar con otros centros presupuestarios
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

//Top line
topline.append('line')
	.attr('y1', yScale(50000))
	.attr('y2', yScale(50000))
	.attr('x1', 0)
	.attr('x2', width)
	.attr("class", "topline")
	.on("mouseover", function(d) {
	  div.transition()
	      .duration(200)
	      .style("opacity", .9);
	  div.html("Límite contratos de obras 50.000€" )
	      .style("left", (d3.event.pageX) + "px")
	      .style("top", (d3.event.pageY) - 35 + "px");
	  })
	.on("mouseout", function(d) {
	  div.transition()
	      .duration(500)
	      .style("opacity", 0);
	});
topline.append('line')
	.attr('y1', yScale(18000))
	.attr('y2', yScale(18000))
	.attr('x1', 0)
	.attr('x2', width)
	.attr("class", "topline")
	.on("mouseover", function(d) {
	  div.transition()
	      .duration(200)
	      .style("opacity", .9);
	  div.html("Límite otros contratos menores 18.000€" )
	      .style("left", (d3.event.pageX) + "px")
	      .style("top", (d3.event.pageY) - 35 + "px");
	  })
	.on("mouseout", function(d) {
	  div.transition()
	      .duration(500)
	      .style("opacity", 0);
	});

	//Sets the bars with time scale
	barstimescale.selectAll(".bar")
		.data(data)
		.enter().append("rect")
		.attr("fill", "#666666")
		.style("opacity",0.4)
		.attr("class",
			function(d) {
				return replacement(d.quien) + " bar " + d.centro.toLowerCase().replace(/\.+/g, '') + "  "  + d.actividad.replace(/\,+/g, ' ').toLowerCase() + " " + (d.importe < 0 ? " negativo" : " positivo"); 
			//sets the name of the person without spaces as class for the bar and adds class negativo/positivo depending on value
		}) 
	.attr("x", function(d) { return xScale(d.date); })
	.attr("width", barwidth+1)
	.attr("y", function(d) { return yScale(Math.max(0, d.importe > topvalue ? topvalue : d.importe)); })
	.attr("height", function(d) { return Math.abs(yScale( d.importe > topvalue ? topvalue : d.importe) - yScale(0)); })
	//The tooltips time scale
		.on("mouseover", function(d) {
				div.transition().style("opacity", 1);
				div.html(d.date.getFullYear() + '-' + (d.date.getMonth()+1) + '-' + d.date.getDate() + "<br/><strong/>"  + d.quien + "</strong/><br/>"  + formatThousand(d.importe) + "€ <br/>"  + d.actividad + "<br/>"  + d.centro + "<br/>"  + d.dni)
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
		.attr("id","random")
		.on('click',function(d) {
			if (randomvar == 0) {
				randomvar = 1;
				svg.selectAll('svg .bar')
				.attr("y",function(d) { return Math.random() * yScale(d.importe > topvalue ? topvalue : d.importe);});
				svg.select('#topline').style("visibility","hidden");
				d3.select(this).style("border","2px solid #000"); //adds class success to button
				svg.selectAll('.vipname').attr("y", height + 40).attr("x", 0);
				svg.selectAll('.description').attr("y", height + 60).attr("x", 0);
				svg.select('#eventos_title').remove();
			} else {
				randomvar = 0;
				svg.selectAll('svg .bar')
				.attr("y", function(d) { return yScale(Math.max(0, d.importe > topvalue ? topvalue : d.importe)); });
				svg.select('#topline').style("visibility","visible");
				svg.selectAll('.vipname').attr("y", 40).attr("x", 40);
				svg.selectAll('.description').attr("y", 60).attr("x", 40);
				d3.select(this).style("border","1px solid #888"); //adds class success to button
			}
		});
		
	//Special dates
	specialdates.append("text")
		.attr("class", "annotation-related")
		.attr("x", 5)
		.attr("y", height+40)
		.text("Eventos relacionados")
		.attr("id","eventos_title");

	specialdates.append("text")
		.attr("class", "annotation-elections")
		.attr("x", function(d) { return xScale(parseDate('2015-05-25')) + 6; })
		.attr("y", height+55)
		.text("Elecciones municipales 24 mayo 2015.");
	specialdates.append('line')
		.attr("class", "annotation-elections-line")
		.attr('y1', height+44)
		.attr('y2', height+60)
		.attr('x1', function(d) { return xScale(parseDate('2015-05-24')) + 1; })
		.attr('x2', function(d) { return xScale(parseDate('2015-05-24')) + 1; })
		.attr('title','Elecciones municipales 24 mayo 2015\n2015-05-28')
		.on("mouseover", function(d) {
		  d3.select(this).attr('y1', 0)
		    })
		.on("mouseout", function(d) {
		    d3.select(this).attr('y1', height+44)
			});

	specialdates.append("text")
		.attr("class", "annotation-major")
		.attr("x", function(d) { return xScale(parseDate('2015-06-14')) + 6; })
		.attr("y", height+35)
		.text("Toma de posesión nuevo alcalde.");

	specialdates.append('line')
		.attr("class", "annotation-major-line")
		.attr('y1', height+25)
		.attr('y2', height+41)
		.attr('x1', function(d) { return xScale(parseDate('2015-06-13')) + 1; })
		.attr('x2', function(d) { return xScale(parseDate('2015-06-13')) + 1; })
		.attr('title','Toma de posesión nuevo alcalde.')
		.on("mouseover", function(d) {
		  d3.select(this).attr('y1', 0)
		    })
		.on("mouseout", function(d) {
		    d3.select(this).attr('y1', height+44)
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
		
		// Update legend and lines
		specialdates.select(".annotation-related")
			.attr("x", 5)
			.attr("y", height+40);

		specialdates.select(".annotation-related-line")
		    .attr('y1', height+44)
    		.attr('y2', height+60)
			.attr("x", function(d) { return xScale(parseDate('2015-05-25')) + 6; })
			.attr("y", height+55);

		specialdates.select(".annotation-elections")
			.attr("x", function(d) { return xScale(parseDate('2015-05-25')) + 6; })
			.attr("y", height+55);
		
		specialdates.select(".annotation-elections-line")
		    .attr('y1', height+44)
    		.attr('y2', height+60)
    		.attr('x1', function(d) { return xScale(parseDate('2015-05-24')) + 1; })
    		.attr('x2', function(d) { return xScale(parseDate('2015-05-24')) + 1; });

		specialdates.select(".annotation-major")
			.attr("x", function(d) { return xScale(parseDate('2015-06-14')) + 6; })
			.attr("y", height+35);
		
		specialdates.select(".annotation-major-line")
			.attr('y1', height+25)
			.attr('y2', height+41)
			.attr('x1', function(d) { return xScale(parseDate('2015-06-13')) + 1; })
			.attr('x2', function(d) { return xScale(parseDate('2015-06-13')) + 1; });
	}
});

function type(d) {
  return d;
}
