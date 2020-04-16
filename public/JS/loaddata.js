// var dataloaded = false;
var artData;

var imgURL;

$(function () {
	function loadData() {
		$.getJSON('artworks.json')
		.done( function(data) {
			var dataVersion = data['current_version'];
			// Get data based on UTC day
			var d = new Date();
			var n = d.getUTCDay();
			artData = data[dataVersion][n];

			// load canvas image info
			imgURL = artData['bgImg'];
			startSketch();
			// dataloaded = true

			// load start page info
			$('#about-link').html(artData['title']);
			// $('#about-link').on('click', showInfo());

			// load about page info
			$('#infoImg').html('<img src="' + artData['infoImg'] + '" alt="painting">');

			var info = '<i>' + artData['title'] + '</i>, ' + artData['artist'] + ', ' + artData['year'];
			info += '<br><cite>' + artData['cite'] +'</cite><br>';
			$('#info-content').html(info);

			$('#infoURL a').attr("href", artData['infoURL']);

		}).fail( function() {
			$('body').html('Loading');
		});
	}
	loadData();

})