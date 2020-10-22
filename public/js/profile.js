function script() {
    const profile_id        = document.getElementById("profile_id").value;
    const profile_name      = document.getElementById("username").textContent;
    const connect_status    = document.getElementById("connection_status");
    const connection_btn    = document.getElementById("connection_btn");
    const block_btn         = document.getElementById("blockuser_btn");
    const reportuser_btn    = document.getElementById("reportuser_btn");
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

        xhr(`/profile/connect`, "POST", { value }, xhr =>
        {
        	const res = JSON.parse(xhr.responseText);

            console.log(res);

    		if (res.result === "Success")
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
            else if (res.result === "Blocked")
                alertify.success("You can't connect with a blocked user. Sorry.");
            else if (res.result === "No image client")
                alertify.alert("To connect with users you need a profile picture");
            else if (res.result === "No image profile")
                alertify.alert("You can't connect with a user who doesn't have a profile picture");
        });
    }, true);



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

            xhr("/profile/block", "POST", { value }, xhr =>
            {
                const res = JSON.parse(xhr.responseText);

                if (res.result === "Success")
                {
                    if (res.profileBlocked === "true")
                    {
                        connection_btn.classList.add("hide");
                        block_btn.classList.add("hide");
                        alertify.success("You have succefully blocked " + profile_name + ".");
                    }
                } else
                    alertify.error("Something went wrong. Please try again.");
          });
    	});
    });


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

        	xhr("/profile/report", "POST", { value }, function(xhr) {
        		const res = JSON.parse(xhr.responseText);

                if (res.result === "Success")
                    alertify.success(`You have successfuly reported ${profile_name}'s account.`);
                else
                    alertify.error("Something went wrong. Please try again.");   
        	});
        },
        () =>
        {
            alertify.success(`Maybe, you & ${profile_name} should talk more.`);
        });

    });

}

document.addEventListener("DOMContentLoaded", script);