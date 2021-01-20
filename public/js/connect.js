document.addEventListener("DOMContentLoaded", script);

function script()
{
  const connectionBtn = document.getElementById("connection_btn");

  if (!connectionBtn)
    return;

  function onConnectRequest(xhr)
  {
    const res        = JSON.parse(xhr.responseText);
    const name       = document.getElementById("username").textContent;
    const fameRating = document.getElementById("rating");

    console.log(res);

    if (res.result === "Blocked")
      alertify.success("You can't connect with a blocked user. Sorry.");
    else if (res.result === "No image client")
      alertify.alert("To connect with users you need a profile picture");
    else if (res.result === "No image profile")
      alertify.alert("You can't connect with a user who doesn't have a profile picture");
    else if (res.result === "Success")
    {
      //Update fame rating
      fameRating.textContent = res.rating;

      if (res.youLikeUser)
      {
        connectionBtn.textContent = "Disconnect";

        if (res.userLikesYou) //Connected
          connection_status.textContent = `You and ${name} are connected and can now start a conversation.`;
        else
          connection_status.textContent = `It seems like ${name} hasn't liked you back, hang in there.`;
      }
      else
      {
        connectionBtn.textContent = "Connect";

        if (res.userLikesYou)
          connection_status.textContent = `${name} now likes you, like them back to get to know more about them.`;
        else
          connection_status.textContent = `You and ${name} are not connected`;
      }
    }
  }

  connectionBtn
  .addEventListener("click", e =>
  {
    const node  = document.getElementById("profile_id");
    const id    = parseInt(node.value);

    xhr('/connect', "POST", { id }, onConnectRequest);
  }, true);
}