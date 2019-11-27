<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<title>Awesome Title</title>
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="manifest" href="manifest.webmanifest">
		<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous" />
		<link rel="stylesheet" href="css/style.css" media="all" />
		<!-- Use inline css -->
		<style>
			body {
			}

			.profile_content {
				width: 100%;
			}

			.profile_pic {
				width: 320px;
				height: 320px;
				display: block;
			}

			.user_rating {
				width: 30%;
				font-size: 90%;
				margin-left: 15%;
			}

			.user_rating img {
				width: 60px;
				height: 60px;
				vertical-align: text-bottom;
			}

			.thumbnails img {
				width: 130px;
				height: 130px;
			}
	
			.views_container {
				font-size: 140%;
				padding-top: 15px;
				padding-bottom: 15px;
			}

			.edit {
				padding-bottom: 10px;
			}

			.ib {
				display: inline-block;
			}

			
			.fullname .txt {
				width: 8%;
				display: inline-block;
			}

			p.bio {
				width: 60%;
			}
			
			div.map {
				width: 250px !important;
				height: 250px !important;
				display: inline-block;
				/*background: #000;*/
				background: orange;
				vertical-align: middle;
			}

			.geo {
				vertical-align: middle;
			}

		</style>
	</head>
	<body>
		<!-- Content goes here -->
		<?php
			include('includes/header.php');
		?>
		<div class="profile_content" align="center">
			<div class="profile_pic_content">
				<img src="https://www.biography.com/.image/t_share/MTE4MDAzNDEwNzQzMTY2NDc4/will-smith-9542165-1-402.jpg" alt="User's profile pic" class="profile_pic" />
				<span class="user_rating">5 <img src="images/icons/star.png" /></span>
				<div class="thumbnails" >
					<img src="https://www.clarku.edu/wp-content/themes/clarku/assets/img/placeholder.png" alt="pics"/>
					<img src="https://www.clarku.edu/wp-content/themes/clarku/assets/img/placeholder.png" />
					<img src="https://www.clarku.edu/wp-content/themes/clarku/assets/img/placeholder.png" />
					<img src="https://www.clarku.edu/wp-content/themes/clarku/assets/img/placeholder.png" />
					<img src="https://www.clarku.edu/wp-content/themes/clarku/assets/img/placeholder.png" />
				</div>
			</div>
			<div class="views_container">
				<a href="view_list.php">42 views this week</a>
			</div>
			<form action="includes/handle_settings.php">
				<div class="edit">
					<span id="username" class="value">IamLegend</span>
					<span class="btns">
						<input type="button" name="e_username" id="e_username" class="custom_btn ib" value="Edit" />
						<input type="button" name="c_username" id="c_username" class="custom_btn ib" value="Cancel" />
					</span>

					<div id="username_edit" class="username_edit">
						<input type="text" id="n_username" class="txt ib" placeholder="New username" />
						<input type="button" id="s_username" class="custom_btn ib" value="Save" />
					</div>
				</div>

				<div class="edit">
					<span id="fullname" class="value">Will Smith</span>
					<span id="fullname" class="value"><?php echo $_SESSION[''];?></span>
					
					<div id="fullname_edit" class="fullname_edit">
						<input type="text" id="n_fname" class="txt ib" placeholder="First name" />
						<input type="text" id="n_lname" class="txt ib" placeholder="Last name" />
						<input type="button" id="s_username" class="custom_btn ib" value="Save" />
					</div>
				</div>

				<div class="edit">
					<p>Gender</p>
					<div id="gender_group" class="btn-group" role="group" aria-label="Gender">
	  					<button type="button" class="btn btn-secondary">Female</button>
	  					<button type="button" class="btn btn-secondary option">Male</button>
					</div>
				</div>

				<div class="edit">
					<p>Sexual preference</p>
					<div id="preference_group" class="btn-group" role="group" aria-label="preferences">
	  					<button type="button" class="btn btn-secondary">Female</button>
	  					<button type="button" class="btn btn-secondary">Male</button>
	  					<button type="button" class="btn btn-secondary option">Both</button>
					</div>
				</div>

				<div class="edit">
					<p>Biography</p>

					<p class="value bio">
						Amet venenatis urna cursus eget nunc scelerisque viverra mauris in. Nulla pharetra diam sit amet. Elementum curabitur vitae nunc sed velit dignissim sodales. Porttitor lacus luctus accumsan tortor posuere. Non quam lacus suspendisse faucibus interdum posuere lorem ipsum. Nullam non nisi est sit amet facilisis magna etiam. Et pharetra pharetra massa massa ultricies mi. Maecenas sed enim ut sem viverra aliquet. Phasellus faucibus scelerisque eleifend donec. Vulputate eu scelerisque felis imperdiet. Malesuada nunc vel risus commodo viverra. Urna nunc id cursus metus aliquam eleifend mi. Nisi scelerisque eu ultrices vitae. Dignissim enim sit amet venenatis urna cursus eget nunc scelerisque. Nec tincidunt praesent semper feugiat nibh. Magna sit amet purus gravida quis. Morbi tristique senectus et netus et malesuada fames ac turpis. Facilisi cras fermentum odio eu feugiat.
					</p>
				</div>

				<div class="edit">
					<div id="gmap" class="map">
						
					</div>
					<input type="button" class="custom_btn ib geo" value="Find Me"/>
				</div>
			</form>
		</div>
	</body>
</html>
