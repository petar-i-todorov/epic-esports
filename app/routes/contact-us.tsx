import CustomLink from '#app/components/ui/custom-link'
import TextRoute from '#app/components/ui/text-route'

export const supportUrl = 'app.support@epicesports.net'
export const mailtoSupport = `mailto:${supportUrl}`

/* eslint-disable react/no-unescaped-entities */
export default function ContactUsRoute() {
	const advertisingUrl = 'advertising@epicesports.net'
	const mailtoAdvertising = `mailto:${advertisingUrl}`

	return (
		<TextRoute heading="CONTACT US">
			<p>
				Welcome to the EPIC ESPORTS digital realm. We truly value the trust you
				place in us, ensuring your privacy remains intact. Rest assured, any
				details you decide to share with us on this platform will stay strictly
				confidential.
			</p>
			<p>
				If you decide to share your personal or company details with EPIC
				ESPORTS, whether through our online query system or our newsletter
				sign-up, understand that this is a voluntary action on your part. We'll
				safely store your details for relevant communication, but under no
				circumstances will they be passed on, sold, or shared with third
				parties. <CustomLink to="/privacy">Privacy Policy</CustomLink>
			</p>
			<p>
				EPIC ESPORTS holds the prerogative to modify our privacy policy whenever
				needed. We promise to inform our users about any changes, either via
				email or through a clear notification on our website.
			</p>
			<p>
				If you come across any challenges or queries regarding the EPIC ESPORTS
				mobile app, please don't hesitate to write to us at{' '}
				<CustomLink to={mailtoSupport}>{supportUrl}</CustomLink>
			</p>
			<p>
				For potential advertising partnerships and inquiries, feel free to
				explore more by reaching out to:{' '}
				<CustomLink to={mailtoAdvertising}>{advertisingUrl}</CustomLink>.
			</p>
		</TextRoute>
	)
}
