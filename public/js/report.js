document.addEventListener("DOMContentLoaded", script);

function script()
{
  const name      = document.getElementById("username").textContent;
  const reportBtn = document.getElementById("reportuser_btn");

  reportBtn
  .addEventListener("click", e =>
  {
    const confirmMsg = `You are about to report ${name}. There are other ways to settle disputes. Are you sure?`;

    //Confirm report action
    alertify.confirm(confirmMsg, () =>
    {
      const id = document.getElementById("profile_id").value;

      xhr("/report", "POST", { id }, onReportRequest);
    },
    () =>
    {
      alertify.success(`Maybe, you & ${name} should talk more.`);
    });    
  });

  function onReportRequest(xhr)
  {
    const res = JSON.parse(xhr.responseText);

    if (res.result === "Success")
      alertify.success(`You have successfuly reported ${name}'s account.`);
    else
      alertify.error("Something went wrong. Please try again.");   
  };

}