import cookie from 'cookie'

export function createConfettiCookie(id: string | null = String(Date.now())) {
	return cookie.serialize('ee_confetti', id ?? '', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: id ? 60 : -1,
	})
}

export function getConfetti(request: Request) {
	const cookies = cookie.parse(request.headers.get('Cookie') ?? '')
	const cookieName = 'ee_confetti'
	return cookies[cookieName]
}
