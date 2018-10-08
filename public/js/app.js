var socket = io.connect();
var message = document.getElementById('m').value;

function send() {
  socket.emit('chat message', message);
  message = '';
}

socket.on('chat message', function(msg){
  var li = document.createElement('li');
  li.appendChild(document.createTextNode(msg));
  document.getElementById('messages').appendChild(li);
});

console.log('app.js here');
