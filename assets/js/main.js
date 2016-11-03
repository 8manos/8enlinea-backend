// 8enlinea front-end script
($(document).ready(function(){
	// Toggle de formularios
	$('#admin-form').hide();
	$('#toggle-form').on('click', function(e) {
		e.preventDefault();
		$('#admin-form').slideToggle( "slow" );
	});

	// Envio de formularios con ajax
	$('.ajax-form').on('submit', function(e){
		e.preventDefault();
		var form = $(this);

		$.ajax({
			url: form.attr('action'),
			type: form.attr('method'),
			data: form.serialize()
		})
		.done(function( response ) {
			alert( 'Exito!' );
			location.reload();
		})
		.fail(function( response ) {
			alert( 'Error: ' + response.responseJSON.originalError.summary );
		})
		.always(function() {
			console.log("complete");
		});
	})
}));