var dataloaded = false;
var artData;

var imgURL;

$(function () {
	function loadData() {
		$.getJSON('artworks.json')
		.done( function(data) {
			artData = data['v1'][0];

			imgURL = 'img/'+artData['bgImg'];
			dataloaded = true;

			$('#about-link').html(artData['title']);
			// $('#about-link').on('click', showInfo());

		}).fail( function() {
			$('body').html('Loading');
		});
	}
	loadData();

})