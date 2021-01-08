function script() {
	// $(".slider").bxSlider();
	const DEVMODE 	= false;
	const interests = document.getElementById("interests_list").childNodes;
	const imgInput 	= document.getElementById("image");

	flatpickr(document.getElementById("dob_txt"), {});

	//Enable text input editing
	editActions(
		document.getElementById("username_edit_btn"),
		document.getElementById("username_edit_container"),
		document.getElementById("username_confirm"),
		document.getElementById("username_cancel"),
		validateUsername
	);

	editActions(
		document.getElementById("fullname_edit_btn"),
		document.getElementById("fullname_edit_container"),
		document.getElementById("fullname_confirm"),
		document.getElementById("fullname_cancel"),
		validateFullname
	);

	editActions(
		document.getElementById("dob_edit_btn"),
		document.getElementById("dob_edit_container"),
		document.getElementById("dob_confirm"),
		document.getElementById("dob_cancel"),
		validateDOB
	);

	editActions(
		document.getElementById("email_edit_btn"),
		document.getElementById("email_edit_container"),
		document.getElementById("email_confirm"),
		document.getElementById("email_cancel"),
		validateEmail	
	);

	editActions(
		document.getElementById("password_edit_btn"),
		document.getElementById("password_edit_container"),
		document.getElementById("password_confirm"),
		document.getElementById("password_cancel"),
		validatePassword
	);

	editActions(
		document.getElementById("interests_add_btn"),
		document.getElementById("interest_edit_container"),
		document.getElementById("interests_confirm"),
		document.getElementById("interests_cancel"),
		validateInterests
	);

	editActions(
		document.getElementById("biography_edit_btn"),
		document.getElementById("biography_edit_container"),
		document.getElementById("biography_confirm"),
		document.getElementById("biography_cancel"),
		validateBio
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

	//Link img to input
	document.getElementById("image_input_container")
	.addEventListener("click", function(e)
	{
		imgInput.click();
	}, true);

	//Submit image
	document.getElementById("image_confirm")
	.addEventListener("click", function(e)
	{
		handleFileUpload();
	}, true);


	function handleFileUpload()
	{
		if (imgInput.files.length === 0) {
			alertify.alert("Please choose a file to upload.");
			return;
		}
		const form = new FormData(document.getElementById("profile_picture_form"));
		
		xhr("/user/image", "POST", form, function(xhr)
		{
			const res = JSON.parse(xhr.responseText);

			if (res.result === "Success")
			{
				document.getElementById("profile_pic").src 	= `/images/uploads/${res.filename}`;
				document.getElementById("avatar").src 		= `/images/uploads/${res.filename}`;
			}
			else if (res.result === "No file" || res.result === "Invalid type")
				alertify.alert("Please insert an image file.");
			else
				alertify.alert("Please try again.");
		}, true);
	}

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

	//Validation methods
	function validateUsername()
	{
		const 	value 		= document.getElementById("username_txt").value.trim();
		const 	error_node 	= document.getElementById("error_0");
		let 	result;

		//
		if (value.length < 2 && !isValidStr(value))
		{
			error_node.textContent = "Please enter a valid username";
			return false;
		}
		error_node.textContent = "";
		
		xhr("/user/new_username", "POST", { value }, xhr => 
		{
			//Onsuccess

			const res = JSON.parse(xhr.responseText);

			if (res.result === "Success") {
				document.getElementById("username").textContent = res.value;
			} else {
				error_node.textContent = res.result;
			}
		}, (e) =>
		{
			//On error
		});
		return true;
	}

	function validateFullname()
	{
		const firstInput	= document.getElementById("firstname_txt");
		const lastInput 	= document.getElementById("lastname_txt");
		const error_node 	= document.getElementById("error_1");
		const first 		= firstInput.value.trim();
		const last 			= lastInput.value.trim();

		if (!isValidStr(first))
		{
			error_node.textContent = "Please enter a first name";
			return false;
		}
		if (!isValidStr(last))
		{
			error_node.textContent = "Please enter a last name";
			return false;
		}

		error_node.textContent = "";
		xhr("/user/fullname", "POST", {first, last}, function(xhr)
		{
			const res = JSON.parse(xhr.responseText);

			if (res.result === "Success")
			{
				document.getElementById("fullname").textContent = res.value;
				firstInput.value = "";
				lastInput.value = "";
			}
			else
				error_node.textContent = res.result;
		});
		return true;
	}

	function validateDOB()
	{
		const text 			= document.getElementById("dob");
		const input 		= document.getElementById("dob_txt");
		const error_node 	= document.getElementById("error_4");
		const value 		= input.value.trim();

		if (value.length != 10)
		{
			error_node.textContent = "Please enter your date of birth";
			return false;
		}
		error_node.textContent = "";
		
		xhr("/user/DOB", "POST", { value }, function(xhr)
		{
			const res = JSON.parse(xhr.responseText);

			if (res.result === "Success")
			{
				text.textContent = res.value;
				input.value = "";
			}
			else
				error_node.textContent = res.result;
		});
		return true;
	}

	function validateEmail()
	{
		const node 			= document.getElementById("email_txt");
		const error_node 	= document.getElementById("error_5");
		const value 		= node.value.trim();

		if (!isEmail(value)) {
			error_node.textContent = "Please enter your new email address";
			return false;
		}

		error_node.textContent = "";
		xhr("/user/new_email", "POST", { value }, function(xhr)
		{
			const res = JSON.parse(xhr.responseText);

			if (res.result === "Success") 
				document.getElementById("email").textContent = res.value;
			else if (res.result === "Not unique")
				error_node.textContent = "Email address already taken";
			else
				error_node.textContent = "Please try again.";
		});
		return true;
	}

	function validatePassword()
	{
		const 	oldpw 		= document.getElementById("old_password_txt").value.trim();
		const 	newpw 		= document.getElementById("new_password_txt").value.trim();
		const 	confirmpw 	= document.getElementById("confirm_password_txt").value.trim();
		const 	error_node 	= document.getElementById("error_6");

		if (oldpw.length < 5)
		{
			error_node.textContent = "Please enter your password";
			return false;
		}
		else if (newpw.length < 5)
		{
			error_node.textContent = "Please enter a new password";
			return false;
		}
		else if (confirmpw.length < 5)
		{
			error_node.textContent = "Please confirm your new password";
			return false;
		}
		else if (oldpw === newpw)
		{
			error_node.textContent = "New password can't be current password";
			return false;
		}
		else if (newpw !== confirmpw)
		{
			error_node.textContent = "The passwords you provided don't match";
			return false;
		}

		error_node.textContent = "";
		xhr("/user/resetpassword", "POST", {oldpw, newpw, confirmpw}, xhr =>
		{
			const res 	= JSON.parse(xhr.responseText);
			const el 	= document.getElementById("username");
			
			if (res.result === "Success")
				el.textContent = "Password changed successful";
			else if (res.result === "Weak password")
				el.textContent = "Please provide a 5 letter password that contains lower and upper cases, as well as numbers";
			else
				el.textContent = "Something went wrong please try again.";
		});
		return true;
	}

	function validateInterests()
	{
		const value 		= document.getElementById("interest_txt").value.trim();
		const error_node 	= document.getElementById("error_7");

		if (value.length < 2)
		{
			error_node.textContent = "Please enter an interest";
			return false;
		}
		
		error_node.textContent = "";
		
		xhr("/user/interest", "POST", { value }, function(xhr)
		{
			const res 	= JSON.parse(xhr.responseText);
			const list 	= document.getElementById("interests_list");
			const newItem 	= document.createElement("li");
			
			if (res.result === "Success")
			{
				newItem.textContent = res.value;
				list.appendChild(newItem);		
			}
			else
				error_node.textContent = "Please try again.";
		});
		return true;
	}

	function validateBio()
	{
		const node 			= document.getElementById("biography");
		const input 		= document.getElementById("biography_txt");
		const error_node 	= document.getElementById("error_8");
		const value 		= input.value.trim();

		if (value.length > 3500)
		{
			error_node.textContent = "Your biography is too long";
			return false;
		}
		error_node.textContent = "";

		xhr("/user/biography", "POST", { value }, function(xhr)
		{
			const res = JSON.parse(xhr.responseText);

			if (res.result === "Success")
				node.textContent = value;
			else
				error_node.textContent = "";
		});
		return true;
	}

	function updateGender(node)
	{
		node.addEventListener("click", function(e)
		{
			const value 		= (node.id === "gender_female_btn") ? "F" : "M";
			const error_node 	= document.getElementById("error_2");
			
			xhr("/user/gender", "POST", { value }, function(xhr)
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

			xhr("/user/preferences", "POST", { value }, function(xhr)
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

			xhr("/user/rm_interest", "POST", { value }, function(xhr)
			{
				const res = JSON.parse(xhr.responseText);

				if (res.result === "Success")
					list.removeChild(node);
			});
		});
	}
}

document.addEventListener("DOMContentLoaded", script);
