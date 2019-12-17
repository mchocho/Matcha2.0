function registration_verifiaction(url) {
	return `<h1>Verify Your Email</h1>
		<p>Please confirm that you want to use this email address for your Cupid's Arrow account. Once it's done you will be able to start using this service.</p>
		<button>
			<a href="${url}" target="_blank">Verify my email</a>
		</button>
		<br />
		Or copy and paste the link below into the address bar
		<br />
		<br />
		<p align="center">&copy Cupid's Arrow | 2019</p>`;
}

// export function 

module.exports.verify_signup = registration_verifiaction;