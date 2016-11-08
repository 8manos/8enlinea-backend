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
	});

	// Información dinámica en modal de respuestas
	$('#modal_respuesta').on('show.bs.modal', function (event) {
		var button = $(event.relatedTarget) // Button that triggered the modal
		var id = button.data('id') // Extract info from data-* attributes
		// If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
		// Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
		var modal = $(this);
		modal.find('.modal-title').text('Nueva respuesta en plantilla: ' + id);
		modal.find('#de_plantilla').val(id);
	})
}));