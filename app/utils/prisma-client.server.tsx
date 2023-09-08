import { PrismaClient } from '@prisma/client'
import chalk from 'chalk'
import closeWithGrace from 'close-with-grace'
import { singleton } from '#app/utils/singeton.server'

const logTrheshold = 1000
let logResult

export const prisma = singleton('prisma', () => {
	const prismaClient = new PrismaClient({
		log: [
			{ level: 'query', emit: 'event' },
			{ level: 'error', emit: 'stdout' },
			{ level: 'info', emit: 'stdout' },
			{ level: 'warn', emit: 'stdout' },
		],
	})

	prismaClient.$on('query', e => {
		const logText = `${e.query} ${e.duration}ms`
		if (e.duration <= logTrheshold) {
			logResult = chalk.green(logText)
		} else if (e.duration <= logTrheshold * 1.1) {
			logResult = chalk.yellow(logText)
		} else if (e.duration <= logTrheshold * 1.2) {
			logResult = chalk.redBright(logText)
		} else {
			logResult = chalk.red(logText)
		}

		console.info(logResult)
	})

	closeWithGrace(async () => {
		await prismaClient.$disconnect()
	})

	return prismaClient
})
