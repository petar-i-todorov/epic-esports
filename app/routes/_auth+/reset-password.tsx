import { redirect, type DataFunctionArgs, json } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'
import z from 'zod'
import bcrypt from 'bcryptjs'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { conform, useForm } from '@conform-to/react'
import { AuthButton, AuthPage, authInputsClassNames } from './login'
import { prisma } from '#app/utils/prisma-client.server'
import { ConfirmPasswordSchema, PasswordSchema } from '#app/utils/auth'
import Error from '#app/components/ui/error'
import Mandatory from '#app/components/ui/mandatory'
import JustifyBetween from '#app/components/ui/justify-between'
import { invariantResponse } from '#app/utils/misc.server'
import { getEmail } from '#app/utils/verify.server'

const ResetPasswordSchema = z
	.object({
		password: PasswordSchema,
		confirmPassword: ConfirmPasswordSchema,
	})
	.superRefine(({ password, confirmPassword }, ctx) => {
		if (password !== confirmPassword) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Passwords do not match',
			})
		}
	})

const message =
	'Something went wrong. Please, try to request a verification email again.'

export async function loader({ request }: DataFunctionArgs) {
	const email = await getEmail(request)

	if (typeof email === 'string') {
		const user = await prisma.user.findUnique({
			select: {
				id: true,
			},
			where: {
				email,
			},
		})

		invariantResponse(user, message)
	} else {
		throw redirect('/login')
	}

	return json({})
}

export async function action({ request }: DataFunctionArgs) {
	const email = await getEmail(request)
	const formData = await request.formData()

	const submission = parse(formData, {
		schema: ResetPasswordSchema,
	})

	if (typeof email === 'string') {
		if (submission.value) {
			const user = await prisma.user.findUnique({
				select: {
					id: true,
				},
				where: {
					email,
				},
			})

			if (user) {
				const hash = await bcrypt.hash(submission.value.password, 10)
				await prisma.user.update({
					data: {
						passwordHash: {
							create: {
								hash,
							},
						},
					},
					where: {
						id: user.id,
					},
				})

				return redirect('/login')
			}

			return json({ submission })
		} else {
			return json({ submission }, { status: 400 })
		}
	} else {
		throw redirect('/login')
	}
}

export default function ResetPasswordRoute() {
	const actionData = useActionData<typeof action>()

	const [form, fields] = useForm({
		id: 'reset-password-form',
		constraint: getFieldsetConstraint(ResetPasswordSchema),
		lastSubmission: actionData?.submission,
		onValidate({ formData }) {
			return parse(formData, { schema: ResetPasswordSchema })
		},
	})

	return (
		<AuthPage>
			<Form {...form.props} className="flex flex-col gap-2" method="POST">
				<JustifyBetween>
					<label htmlFor={fields.password.id}>
						Password <Mandatory />
					</label>
					<Error id={fields.password.errorId} error={fields.password.error} />
				</JustifyBetween>
				<input
					className={authInputsClassNames}
					type="password"
					autoComplete="new-password"
					{...conform.input(fields.password)}
				/>
				<JustifyBetween>
					<label htmlFor={fields.confirmPassword.id}>
						Confirm Password <Mandatory />
					</label>
					<Error
						id={fields.confirmPassword.errorId}
						error={fields.confirmPassword.error}
					/>
				</JustifyBetween>
				<input
					className={authInputsClassNames}
					type="password"
					autoComplete="new-password"
					{...conform.input(fields.confirmPassword)}
				/>
				<Error id={form.errorId} error={form.error} />
				<AuthButton>Reset</AuthButton>
			</Form>
		</AuthPage>
	)
}
