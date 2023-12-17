import { execaCommand } from 'execa'

async function go() {
	try {
		console.log('Starting db....')
		await execaCommand('npx prisma migrate deploy', {
			stdio: 'inherit',
		})
		console.log('Starting app....')
		// this fails
		await execaCommand('remix-serve ./build/index.js')

		console.log('App started')
	} catch (error) {
		console.error('Error occurred:', error.message)
		process.exit(1)
	}
}

go()
