import { singleton } from './singeton.server.ts'
import nodemailer from 'nodemailer'

const transporter = singleton('transporter', () => {
	return nodemailer.createTransport({
		host: 'smtp-mail.outlook.com',
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASSWORD,
		},
	})
})

export function sendEmail({
	to,
	subject,
	html,
}: {
	to: string
	subject: string
	html: string
}) {
	return transporter.sendMail({
		from: 'petardotjs@gmail.com',
		to,
		subject,
		html,
	})
}
