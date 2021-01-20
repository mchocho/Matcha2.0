document.addEventListener("DOMContentLoaded", script);

function script() {
	// $(".slider").bxSlider();
	const DEVMODE 	= true;
	const interests = document.getElementById("interests_list").childNodes;
	const imgInput 	= document.getElementById("image");

	flatpickr(document.getElementById("dob_txt"), {});

	//Enable text input editing
	editActions(
		document.getElementById("username_edit_btn"),
		document.getElementById("username_edit_container"),
		document.getElementById("username_confirm"),
		document.getElementById("username_cancel")
	);

	editActions(
		document.getElementById("fullname_edit_btn"),
		document.getElementById("fullname_edit_container"),
		document.getElementById("fullname_confirm"),
		document.getElementById("fullname_cancel")
	);

	editActions(
		document.getElementById("dob_edit_btn"),
		document.getElementById("dob_edit_container"),
		document.getElementById("dob_confirm"),
		document.getElementById("dob_cancel")
	);

	editActions(
		document.getElementById("email_edit_btn"),
		document.getElementById("email_edit_container"),
		document.getElementById("email_confirm"),
		document.getElementById("email_cancel")
	);

	editActions(
		document.getElementById("password_edit_btn"),
		document.getElementById("password_edit_container"),
		document.getElementById("password_confirm"),
		document.getElementById("password_cancel")
	);

	editActions(
		document.getElementById("interests_add_btn"),
		document.getElementById("interest_edit_container"),
		document.getElementById("interests_confirm"),
		document.getElementById("interests_cancel")
	);

	editActions(
		document.getElementById("biography_edit_btn"),
		document.getElementById("biography_edit_container"),
		document.getElementById("biography_confirm"),
		document.getElementById("biography_cancel")
	);

	//Add update events to gender buttons
	updateGender(document.getElementById("gender_female_btn"));
	updateGender(document.getElementById("gender_male_btn"));


	//Add update events to preference buttons
	updatePreference(document.getElementById("preference_female_btn"));
	updatePreference(document.getElementById("preference_male_btn"));
	updatePreference(document.getElementById("preference_both_btn"));

	interests.forEach(function(res) {
		rmPreferenceEvent(res);
	});


	//Image field controls
	imgInput.value = null;

	imgInput.addEventListener("change", function(e)
	{
		const form = document.getElementById("profile_picture_form");

		if (imgInput.files)
			form.submit();
	});

	//Link img to input
	document.getElementById("image_input_container")
	.addEventListener("click", function(e)
	{
		imgInput.click();
	}, true);

	function isNode(el) {
       	return (el instanceof Element);
    }

    function isEmail(value) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
	}

	function isValidStr(value) {
		return (Object.prototype.toString.call(value) === "[object String]"
			&& value.length > 0 && /^[a-zA-Z]+$/.test(value))
	}

	function editActions(edit_btn, edit_container, confirm_btn, cancel_btn, validation) {
		edit_btn.addEventListener("click", function() {
			edit_btn.classList.add("hide");
			edit_container.classList.remove("hide");
			return;
		}, true);

		cancel_btn.addEventListener("click", function() {
			edit_container.classList.add("hide");
			edit_btn.classList.remove("hide");
			return;
		}, true);
	}


	function updateGender(node)
	{
		node.addEventListener("click", function(e)
		{
			const value 		= (node.id === "gender_female_btn") ? "F" : "M";
			const error_node 	= document.getElementById("error_2");
			
			xhr("/gender", "POST", { value }, function(xhr)
			{
					const res = JSON.parse(xhr.responseText);
					
					if (res.result !== "Success")
						error_node.textContent = "Gender change request failed. Please try again.";
			});
		});
	}

	function updatePreference(node)
	{
		node.addEventListener("click", function(e)
		{
			const error_node = document.getElementById("error_3");
			let value;

			if (node.id === "preference_female_btn")
				value = "F";
			else if (node.id === "preference_male_btn")
				value = "M"
			else if (node.id === "preference_both_btn")
				value = "B";
			else
				return; 

			xhr("/preferences", "POST", { value }, function(xhr)
			{
				const res = JSON.parse(xhr.responseText);
				
				if (res.result !== "Success")
					error_node.textContent = "Preference change request failed. Please try again.";
			});
		});
	}

	function rmPreferenceEvent(node)
	{
		if (!isNode(node)) 
			return;

		const list = document.getElementById("interests_list");
		
		node.addEventListener("click", function(e)
		{
			const value = node.id;

			xhr("/interests/delete", "POST", { value }, function(xhr)
			{
				const res = JSON.parse(xhr.responseText);

				if (res.result === "Success")
					list.removeChild(node);
			});
		});
	}
}
