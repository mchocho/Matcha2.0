function registration_verifiaction(url) {
	return `<h1>Verify Your Email</h1>
		<p>Please confirm that you want to use this email address for your Cupid's Arrow account. Once it's done you will be able to start using this service.</p>
		<button>
			<a href="${url}" target="_blank">Verify my email</a>
		</button>
		<br />
		<footer align="center">&copy Cupid's Arrow | 2019</footer>`;
}

function report_account(url) {
	return `<h1>You've been reported</h1>
		<p>Your account has been reported as fake.</p>
		<p>If you believe there has been some mistake just click on the link below</p>
		<button>
			<a href="${url}" target="_blank">Validate my profile</a>
		</button>
		<br />
		<footer align="center">&copy Cupid's Arrow | 2019</footer>`;
}

// export function 

module.exports.verify_signup = registration_verifiaction;
module.exports.report_account = report_account;
