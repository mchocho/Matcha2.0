document.addEventListener("DOMContentLoaded", script);

function script()
{
  const socket   = io();

  console.log('frontend socket connected');

  const messages = document.getElementById('messages');
  const form     = document.getElementById('form');
  const input    = document.getElementById('m');
  const username = document.getElementById('username');
  const roomName = document.getElementById('roomName');
  const chatBtn  = document.getElementById("chat");


  socket.emit("joinRoom", {
     username: username.innerText,
     room: roomName.innerText
  });

  form.addEventListener("submit", e =>
  {
    e.preventDefault();
    
    if (input.value)
    {
      socket.emit("fromClient", input.value);
      input.value = ''; // may need to delete this
    }
  });

  socket.on("fromServer", data =>
  {
    let userDiv = document.createElement("span");
    let msgDiv  = document.createElement("span");
    let item    = document.createElement("li");
    
    userDiv.setAttribute("class", "username");
    userDiv.textContent = data.user;

    
    msgDiv.setAttribute("class", "msgBody");
    msgDiv.textContent = data.msg;

    item.append(userDiv, msgDiv);
    messages.appendChild(item);

    window.scrollTo(0, document.body.scrollHeight);
  });

  function onChatRoomRequest(xhr)
  {
    const res = JSON.parse(xhr.responseText);

    if (res.result !== "Success")
    {
      alertify.alert(res.result);
      return;
    }
    else
    {
      console.log(JSON.stringify(res));
    }
  }
}