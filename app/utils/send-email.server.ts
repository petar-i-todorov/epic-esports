import { singleton } from './singeton.server.ts'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
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
	console.log({
		to,
		subject,
		html,
	})
	return transporter.sendMail({
		from: 'petardotjs@gmail.com',
		to,
		subject,
		html,
	})
}
