// 8enlinea front-end script

// Borrar respuesta
function eliminar_respuesta( id ){
	$.ajax({
		url: '/respuesta/'+id,
		type: 'DELETE',
		success: function(result) {
			alert("Respuesta " + id + " eliminada.");
			location.reload();
		}
	});
}

// Borrar acción
function eliminar_accion( id ){
	$.ajax({
		url: '/accion/'+id,
		type: 'DELETE',
		success: function(result) {
			alert("Acción " + id + " eliminada.");
			location.reload();
		}
	});
}

($(document).ready(function(){
	// Toggle de formularios
	$('#admin-form:not(.visible)').hide();
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

	// Información dinámica en modal de acciones
	$('#modal_accion').on('show.bs.modal', function (event) {
		var button = $(event.relatedTarget) // Button that triggered the modal
		var id = button.data('id') // Extract info from data-* attributes
		// If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
		// Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
		var modal = $(this);
		modal.find('.modal-title').text('Nueva accion en plantilla: ' + id);
		modal.find('#en_plantilla').val(id);
	})

	// Traer respuestas asociadas a plantilla en modal
	$("#modal_ver_respuestas").on("show.bs.modal", function(e) {
		var modal = $(this);
		var button = $(e.relatedTarget);
		var id = button.data('id');
		var body = $(this).find(".modal-body");
		var content = '';

		modal.find('.modal-title').text('Respuestas en plantilla: ' + id );

		$.ajax({
			url: "/plantilla/"+ id +"/respuestas"
		}).done(function( data ) {
			body.text('');
			content += '<table class="table table-striped table-bordered table-hover"><thead><tr><td>Tipo</td><td>Texto</td><td>Destino</td><td>Admin</td></tr></thead><tbody>';
			$.each( data , function( i, item ){
				content += '<tr><td>'+ data[i].tipo +'</td><td>'+ data[i].texto +'</td><td>'+ data[i].destino +'</td><td><a href="#" class="eliminar_respuesta" onclick="return eliminar_respuesta( '+ data[i].id +' );">(Eliminar)</a></td></tr>';
			});
			content += '</tbody></table>';
			body.append( $.parseHTML(content) );
			body.addClass( "done" );
		});		
	});

	// Traer respuestas asociadas a plantilla en modal
	$("#modal_ver_acciones").on("show.bs.modal", function(e) {
		var modal = $(this);
		var button = $(e.relatedTarget);
		var id = button.data('id');
		var body = $(this).find(".modal-body");
		var content = '';

		modal.find('.modal-title').text('Acciones en plantilla: ' + id );

		$.ajax({
			url: "/plantilla/"+ id +"/acciones"
		}).done(function( data ) {
			body.text('');
			content += '<table class="table table-striped table-bordered table-hover"><thead><tr><td>Tipo</td><td>Parametro</td><td>Valor</td><td>Admin</td></tr></thead><tbody>';
			$.each( data , function( i, item ){
				content += '<tr><td>'+ data[i].tipo +'</td><td>'+ data[i].parametro +'</td><td>'+ data[i].valor +'</td><td><a href="#" class="eliminar_accion" onclick="return eliminar_accion( '+ data[i].id +' );">(Eliminar)</a></td></tr>';
			});
			content += '</tbody></table>';
			body.append( $.parseHTML(content) );
			body.addClass( "done" );
		});		
	});

	// Borrar plantilla
	$('.eliminar_plantilla').on( 'click', function( e ){
		e.preventDefault();
		var id = $(this).data('id');
		$.ajax({
			url: '/plantilla/'+id,
			type: 'DELETE',
			success: function(result) {
				alert("Plantilla " + id + " eliminada.");
				location.reload();
			}
		});
	});

}));