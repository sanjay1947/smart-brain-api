const handleRegister = (req, res, db, bcrypt) => {
	const { email, name, password } = req.body;
	// Validation : checks if any of email name or password is empty then returns without executing
	// below code
	if (!email || !name || !password) {
		return res.status(400).json('incorrect form submission')
	}
	const hash = bcrypt.hashSync(password);
		// Transactions created when we have to do more than 2 things at once
		db.transaction(trx => {
			trx.insert({
				hash: hash,
				email: email
			})
			.into('login')
			.returning('email')
			.then(loginEmail => {
				return trx('users')
					.returning('*') // after inserting is response returns all columns
					.insert({
						// [0] is added becox we are returning an array otherwise {} will also appear along with email
						email: loginEmail[0].email,
						name: name,
						joined: new Date()
					})
					.then(user => {
						res.json(user[0]);
					})
			})
			.then(trx.commit) // to get successfully added
			.catch(trx.rollback)
		})			
		.catch(err => res.status(400).json('unable to register'))	
}

module.exports = {
	handleRegister: handleRegister
};