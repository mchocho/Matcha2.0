document.addEventListener("DOMContentLoaded", script);

function script()
{
  const profileInput   = document.getElementById("profile_id");
  const usernameDiv    = document.getElementById("username");
  const connection_btn = document.getElementById("connection_btn");
  const block_btn      = document.getElementById("blockuser_btn");


  const id             = profileInput.value;
  const username       = usernameDiv.textContent;


  function onBlockRequest(xhr)
  {
    const res = JSON.parse(xhr.responseText);

    if (res.result === "Success")
    {
      if (res.profileBlocked === "true")
      {
        connection_btn.classList.add("hide");
        block_btn.classList.add("hide");
        alertify.success(`You have succefully blocked ${username}.`);
      }
    }
    else
      alertify.error("Something went wrong. Please try again.");
  }

  block_btn
  .addEventListener("click", e =>
  {
    const confirmMsg = `You are about to block ${username} from your preference list. Are you sure?`;

    //Confirm block profile action
  	alertify.confirm(confirmMsg, () =>
    {
      const value = id;

      xhr("/block", "POST", { value }, onBlockRequest);
  	});
  });
}
