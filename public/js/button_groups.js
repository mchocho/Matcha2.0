document.addEventListener("DOMContentLoaded", script);

function script() {
  const dob             = document.getElementById('dob');
  const gender_btns     = document.getElementById('gender_group').childNodes;
  const preference_btns = document.getElementById('preference_group').childNodes;
  
  if ('flatpickr' in window) flatpickr(dob, {});

  [...gender_btns].forEach((btn, i, arr) =>
  {
    buttonClickListener(btn, arr);
  });

  [...preference_btns].forEach((btn, i, arr) =>
  {
    buttonClickListener(btn, arr);
  });

  function buttonClickListener(btn, arr)
  {
    btn.addEventListener("click", e =>
    {
      const target  = e.currentTarget;

      arr.forEach(value =>
      {
        value.classList.remove("option");
      });

      target.classList.add("option");
    });
  }
}