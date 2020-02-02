function getYear() {
	return new Date().getFullYear();
}

module.exports = {
	verify_signup(url) {
		return `<h1>Verify Your Email</h1>
			<p>Please confirm that you want to use this email address for your Cupid's Arrow account. Once it's done you will be able to start using this service.</p>
			<button>
				<a href="${url}" target="_blank">Verify my email</a>
			</button>
			<br />
			<footer align="center">&copy Cupid's Arrow | ${getYear()}</footer>`;
	},
	report_account(url) {
		return `<h1>You've been reported</h1>
			<p>Your account has been reported as fake.</p>
			<p>If you believe there has been some mistake just click on the link below</p>
			<button>
				<a href="${url}" target="_blank">Validate my profile</a>
			</button>
			<br />
			<footer align="center">&copy Cupid's Arrow | ${getYear()}</footer>`;
	},
	passwordReset(url) {
		return `<h1>Verify Password Change</h1>
			<p>Please confirm that you requested to change your password.</p>
			<button>
				<a href="${url}" target="_blank">Verify Password Change</a>
			</button>
			<br />
			<footer align="center">&copy Cupid's Arrow | ${getYear()}</footer>`;
	},
	userLiked(username, profile) {
		return `<h1>Hi ${username}</h1>
		<p>${profile} now likes.</p>
		<p>Like them back quick, to find out more about them. You never know.</p>
		<footer align="center">&copy Cupid's Arrow | ${getYear()}</footer>`;
	},
	connectedUserLiked(username, profile) {
		return `<h1>Hi ${username}</h1>
		<p>${profile} liked you back.</p>
		<p>Why don't you say hi before it's too late.</p>
		<footer align="center">&copy Cupid's Arrow | ${getYear()}</footer>`;
	},
	userUnliked(username, profile) {
		return `<h1>Hi ${username}</h1>
		<p>${profile} decided to let go of you & unlike you.</p>
		<p>Don't give up.</p>
		<footer align="center">&copy Cupid's Arrow | ${getYear()}</footer>`;
	}	
}