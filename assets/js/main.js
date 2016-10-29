// 8enlinea front-end script
io.socket.on('message', function onServerSentEvent (msg) {
  console.log( msg );
});

io.socket.get('/intro', null, function (resData) {
  console.log( resData ); 
});