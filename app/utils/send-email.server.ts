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
	return transporter.sendMail({
		from: 'Epic Esports <petarmdedicine@gmail.com>',
		to,
		subject,
		html,
	})
}
