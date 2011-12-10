<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF8">
		<title>DMA AisViewWeb</title>
		<link rel="stylesheet" type="text/css" href="css/style.css" />
		<script type="text/javascript" src="http://code.jquery.com/jquery-1.6.2.min.js"></script>
		<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=true"></script>
		<script type="text/javascript" src="http://google-maps-utility-library-v3.googlecode.com/svn/tags/markermanager/1.0/src/markermanager.js"></script>
		<script type="text/javascript" src="http://google-maps-utility-library-v3.googlecode.com/svn/tags/markerclustererplus/2.0.6/src/markerclusterer.js"></script>
		<script type="text/javascript" src="http://google-maps-utility-library-v3.googlecode.com/svn/tags/infobox/1.1.9/src/infobox.js"></script>
		<script type="text/javascript" src="js/ais.js"></script>
	</head>
	<body onload="setupMap()">
		<div id="sidebar">
			<div id="info">
				callsign: <div id="callsign"></div>
				cargo: <div id="cargo"></div>
				cog: <div id="cog"></div>
				currentTime: <div id="currentTime"></div>
				destination: <div id="destintation"></div>
				draught: <div id="draught"></div>
				eta: <div id="eta"></div>
				heading: <div id="heading"></div>
				id: <div id="id"></div>
				imoNo: <div id="imoNo"></div>
				lastReceived: <div id="lastReceived"></div>
				lat: <div id="lat"></div>
				length: <div id="length"></div>
				lon: <div id="lon"></div>
				mmsi: <div id="mmsi"></div>
				moored: <div id="moored"></div>
				name: <div id="name"></div>
				navStatus: <div id="navStatus"></div>
				posAcc: <div id="posAcc"></div>
				sog: <div id="sog"></div>
				source: <div id="source"></div>
				vesselClass: <div id="vesselClass"></div>
				vesselType: <div id="vesselType"></div>
				width: <div id="width"></div>
			</div>
			<div id="filter">
				<h3>Filters:</h3>			
				<form action="">
					<input type="checkbox" id="DNK">Danish ships
				</form>
			</div>
			<script type="text/javascript">
				$("#DNK").click(function() {
					if($(this).is(":checked")) {
						countries = "DNK";				      
				    } else {
				    	countries = "";
					}
					filterChanged();		
				});
			</script>
		</div>
		<div id="content-container">
			<div id="map_canvas"></div>
		</div>
	</body>
</html>