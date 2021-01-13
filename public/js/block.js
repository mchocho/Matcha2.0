document.addEventListener("DOMContentLoaded", script);

function script() {
  const profile_id        = document.getElementById("profile_id").value;
  const profile_name      = document.getElementById("username").textContent;
  const connection_btn    = document.getElementById("connection_btn");
  const block_btn         = document.getElementById("blockuser_btn");

  /*************************************
   *************************************
      
      Event runs request to block 
      the profile

  **************************************
  **************************************/
  block_btn
  .addEventListener("click", e =>
  {
    const confirmMsg = `You are about to block ${profile_name} from your preference list. Are you sure?`;

      //Confirm block profile action
  	alertify.confirm(confirmMsg, () =>
    {
      const value = profile_id;

      xhr("/block", "POST", { value }, onBlockRequest);
  	});


    function onBlockRequest(xhr)
    {
      const res = JSON.parse(xhr.responseText);

      if (res.result === "Success")
      {
        if (res.profileBlocked === "true")
        {
            connection_btn.classList.add("hide");
            block_btn.classList.add("hide");
            alertify.success(`You have succefully blocked ${profile_name}.`);
        }
      }
      else
        alertify.error("Something went wrong. Please try again.");
    }
  });

}
