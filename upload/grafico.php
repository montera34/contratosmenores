<?php
$dir    = 'data/'; //data directory
$files2 = scandir($dir, 1);	//list of files

$taxonomies = []; //initialize array to hold taxonomies names 
foreach ($files2 as $key => $value) { //for each file
	//match the regexp
	preg_match('/(taxonomy)\.\w+/', $value, $matches, PREG_OFFSET_CAPTURE);
	if (!empty($matches)) { //if not empty. There is match..
		$taxonomy = explode('.', $matches[0][0]); 
		array_push($taxonomies, $taxonomy[1]); //push taxonomy name
	}
}
print_r($taxonomies);

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en-US">
<head profile="http://gmpg.org/xfn/11">
	<title>Contratos menores Ayuntamiento de Valencia 2015</title>
	<meta http-equiv="content-type" content="text/html"/>
	<meta name="description" content="archiving thoughts and images" />
	<meta charset="utf-8">
	<!-- generic meta -->
	<meta content="montera34" name="author" />
	<meta name="title" content="Contratos menores Ayuntamiento de Valencia 2015" />
	<meta content="Gráfico para explicar cómo y en qué se reparten los contratos menores de un Ayuntamiento" />
	<meta content="visualización de datos, contratos menores, datavis, transparencia" name="keywords" />
	<!-- facebook meta 	-->
	<meta property="og:title" content="Contratos menores Ayuntamiento de Valencia 2015" />
	<meta property="og:type" content="article" />
	<meta property="og:description" content="Gráfico para explicar cómo y en qué se reparten los contratos menores de un Ayuntamiento." />
	<meta content="transparencia, ayuntamiento, contratos menores" />
	<meta property="og:url" content="https://lab.montera34.com/contratosmenores/" /> 
	<!-- twitter meta -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@montera34">
	<meta name="twitter:title" content="Contratos menores Ayuntamiento de Valencia 2015" />
	<meta name="twitter:description" content="Gráfico para explicar cómo y en qué se reparten los contratos menores de un Ayuntamiento." />
	<meta name="twitter:creator" content="@montera34">
	<meta name="twitter:image:src" content="https://lab.montera34.com/contratosmenores/img/contratos-menores-ayuntamiento-valencia-2015.png" />
	<meta property="twitter:account_id" content="1494951285" />
	
	<link rel="stylesheet" type="text/css" href="../css/style.css" />
	<link rel="stylesheet" type="text/css" href="../css/libs/bootstrap.min.css" />
</head>
<body>
<div id="fb-root"></div>
	<div class="container main-container">
		<h1><span class="glyphicon glyphicon-stats" aria-hidden="true"></span> Visualizando contratos de la administraci&oacute;n</h1>
		<a class="btn btn-info pull-right" href="https://github.com/montera34/contratosmenores" role="button">Colabora <span class="glyphicon glyphicon-wrench" aria-hidden="true"></span></a>
		<div class="row">
			<ul class="nav nav-tabs">
				<li role="presentation"><a href="/contratosmenores/home.html">Inicio</a></li>
			  <li role="presentation" class="dropdown active">
					<a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false"  class="disabled">
						Valencia <span class="caret"></span>
					</a>
					<ul class="dropdown-menu">
						<li><a href=/contratosmenores/valencia/contratosmenores/2015/index.html>Contratos menores 2015</a></li>
						<li><a href="/contratosmenores/valencia/subvenciones/2015/index.html">Subvenciones 2015</a></li>
						<li><a href="/contratosmenores/valencia/contratosmenores/2016/index.html">Contratos menores 2016</a></li>
					</ul>
				</li>
				<li role="presentation" class="dropdown">
					<a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false"  class="disabled">
						Zaragoza <span class="caret"></span>
					</a>
					<ul class="dropdown-menu">
						<li><a href="/contratosmenores/zaragoza/facturas/2016/index.html">Facturas 2016</a></li>
					</ul>
				</li>
				<li role="presentation"><a href="/contratosmenores/madrid/sanidad/2015/index.html">Sanidad Comunidad de Madrid 2015</a></li>
				<li role="presentation"><a href="/contratosmenores/paracuellos/contratosmenores/2014/index.html">Contratos menores Paracuellos 2014</a></li>
			</ul>
		</div>
		<h2>Contratos menores | Ayuntamiento de Valencia 2015</h2>
		<div class="row" id="select">
		<?php 
		foreach ($taxonomies as $index => $value) {
			echo '<div class="col-md-4"><h5>'.$index.'<h5><div class="dropdown"> 
					<button class="btn btn-default dropdown-toggle btn-sm" type="button" id="dropdownMenu'.$index.'" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">Selecciona proveedor<span class="caret"></span></button>
					<ul id="legend'.$index.'" class="dropdown-menu" aria-labelledby="dropdownMenu'.$index.'">
					</ul>
				</div>
			</div>';
		}
		 ?>
		</div>

		<div id="filters" class="row">
		<?php 
		foreach ($taxonomies as $index => $value) {
			echo '<div class="col-md-4">
							<div class="well well-sm">
								<div id="filterlayout'.$index.'" class="filtro "></div>
							</div>
						</div>';
		}
		?>
		</div>
		<div class="row">
			<div class="col-md-4" style="padding-bottom: 1.2em;" id="barrasactivas">
				<span class="label label-default" style="font-size:1.4em;">14.456.814,33€</span>
			</div>
			<div class="col-md-4">
				<div class="progress">
					<div id="totales">
					</div>
				</div>
			</div>
			<div id="randomselect"></div>
		</div>
		<div id="vis"></div>
		<div class="row" id="select">
			<div id="description" class="col-md-7">		
				<p>Datos limpiados con <a href="http://openrefine.org/">OpenRefine</a>.</p>
			</div>
		</div>
	</div>
	<div class="page-footer text-muted">
		<div class="container">
			<p>Proyecto colaborativo desarrollado por <a href="http://numeroteca.org">numeroteca.org</a> + <a href="https://twitter.com/elctrodnd21">@elctrodnd21</a> + <a href="https://twitter.com/martgnz">@martgnz</a> + <a href="https://smalldata.noblogs.org/">Leo</a> | Alojado en <a href="http://montera34.com">montera34.com</a>.<br>
			Puedes contribuir al proyecto en <a href="https://github.com/montera34/contratosmenores">github.com/montera34/contratosmenores</a></p>
			<p>C&oacute;digo basado en la visualizaci&oacute;n de los gastos de las "tarjetas black" de Caja Madrid/Bankia disponible en <a href="https://github.com/numeroteca/tarjetasblack">https://github.com/numeroteca/tarjetasblack</a>.
			</p>
		</div>
	</div>
</div>	
<script src="../js/d3.v3.min.js"></script>
<!-- <script src="https://d3js.org/d3.v4.min.js"></script> -->
<script src="../js/lodash.js"></script>
<script src="js/dataviz.js"></script>
<script src="../js/lib/jquery-3.2.0.min.js"></script>
<script src="../js/lib/bootstrap.min.js"></script>
<script type="text/javascript" src="../../../js/stats.js"></script>
</body>
</html>
