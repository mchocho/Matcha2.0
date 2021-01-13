document.addEventListener("DOMContentLoaded", script);

function script()
{
  const profile_id        = document.getElementById("profile_id").value;
  const profile_name      = document.getElementById("username").textContent;
  const reportuser_btn    = document.getElementById("reportuser_btn");

  /*************************************
   *************************************
      
      Event runs request to report 
      the profile

  **************************************
  **************************************/
  reportuser_btn
  .addEventListener("click", e =>
  {
    const confirmMsg = `You are about to report ${profile_name}. There are other ways to settle disputes. Are you sure?`;

    //Confirm report action
    alertify.confirm(confirmMsg, () =>
    {
      const value = profile_id;

      xhr("/report", "POST", { value }, onReportRequest);
    },
    () =>
    {
        alertify.success(`Maybe, you & ${profile_name} should talk more.`);
    }

    function onReportRequest(xhr)
    {
      const res = JSON.parse(xhr.responseText);

      if (res.result === "Success")
          alertify.success(`You have successfuly reported ${profile_name}'s account.`);
      else
          alertify.error("Something went wrong. Please try again.");   
    });
  });

}