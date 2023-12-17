import { execaCommand } from 'execa'

async function go() {
	try {
		console.log('Starting db....')
		await execaCommand('npx prisma migrate deploy', {
			stdio: 'inherit',
		})

		await execaCommand('remix-serve ./build/index.js', {
			stdio: 'inherit',
		})
	} catch (error) {
		console.error('Error occurred:', error.message)
		process.exit(1)
	}
}

go()
