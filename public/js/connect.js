document.addEventListener("DOMContentLoaded", script);

function script() {
  const profile_id        = document.getElementById("profile_id").value;
  const profile_name      = document.getElementById("username").textContent;
  const connect_status    = document.getElementById("connection_status");
  const connection_btn    = document.getElementById("connection_btn");
  const fameRating        = document.getElementById("rating");
            

  /*************************************
   *************************************
      
      Event runs request to connect to 
      with profile

  **************************************
  **************************************/
  connection_btn
  .addEventListener("click", e =>
  {
    const value = parseInt(profile_id);

    xhr('/connect', "POST", { value }, onConnectRequest);
  }, true);

  function onConnectRequest(xhr)
  {
    const res = JSON.parse(xhr.responseText);

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
        connection_btn.textContent = "Disconnect";

        if (res.userLikesYou) //Connected
          connection_status.textContent = `You and ${profile_name} are both connected`;
        else
          connection_status.textContent = `It seems like ${profile_name} hasn"t liked you back, hang in there.`;
      }
      else
      {
        connection_btn.textContent = "Connect";

        if (res.userLikesYou)
          connection_status.textContent = `${profile_name} now likes you, like them back to get to know more about them.`;
        else
          connection_status.textContent = `You and ${profile_name} are not connected`;
      }
    }
  }
}