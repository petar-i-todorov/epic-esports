/* eslint-disable react/no-unescaped-entities */
import { mailtoSupport, supportUrl } from './contact-us'
import CustomParagraph from '~/components/ui/custom-paragraph'
import TextRoute from '~/components/ui/text-route'
import CustomLink from '~/components/ui/custom-link'

export default function PrivacyRoute() {
	return (
		<TextRoute heading="EPIC ESPORTS Privacy Policy">
			<CustomParagraph heading="1. INTRODUCTION">
				Welcome to EPIC ESPORTS. We respect your privacy and are committed to
				safeguarding your personal data. This privacy policy outlines the type
				of information we may gather during your visit to our website and how we
				use this information.
			</CustomParagraph>
			<CustomParagraph heading="2. INFORMATION WE COLLECT">
				2.1. Personal Data: This includes information you provide voluntarily
				such as your name, email address, and phone number when you register for
				an account, sign up for our newsletter, or contact us with inquiries.
			</CustomParagraph>
			<CustomParagraph>
				2.2. Non-Personal Data: We may automatically collect non-personal data
				about you, such as the IP address, browser type, and the pages you visit
				on our website. This helps us understand user behavior and enhance user
				experience.
			</CustomParagraph>
			<CustomParagraph heading="3. HOW WE USE YOUR INFORMATION">
				3.1. To provide, maintain, and improve our services.
			</CustomParagraph>
			<CustomParagraph>
				3.2. To respond to your comments, questions, and provide customer
				service.
			</CustomParagraph>
			<CustomParagraph>
				3.3. To send you technical notices, updates, and promotional messages.
			</CustomParagraph>
			<CustomParagraph>
				3.4. To monitor and analyze trends and usage.
			</CustomParagraph>
			<CustomParagraph heading="4. DATA SHARING AND TRANSFER">
				4.1. Third Parties: We will not share, sell, or trade your information
				with third parties without your consent, except where required to do so
				by law.
			</CustomParagraph>
			<CustomParagraph>
				4.2. Business Transfers: In case of a merger or acquisition, your data
				may be transferred but will remain subject to this privacy policy.
			</CustomParagraph>
			<CustomParagraph heading="5. DATA PROTECTION">
				We use industry-standard methods to protect your personal data against
				unauthorized access, use, or disclosure.
			</CustomParagraph>
			<CustomParagraph heading="6. COOKIES">
				Our website uses cookies to enhance user experience and analyze website
				traffic. You can configure your browser to refuse cookies or notify you
				before accepting them.
			</CustomParagraph>
			<CustomParagraph heading="7. CHILDREN'S PRIVACY">
				Our website is not intended for users under 13 years of age. We do not
				knowingly collect personal information from children under 13.
			</CustomParagraph>
			<CustomParagraph heading="8. CHANGES TO THIS PRIVACY">
				We may occasionally update this policy to reflect changes in our
				practices or for other operational, legal, or regulatory reasons.
			</CustomParagraph>
			<CustomParagraph heading="9. CONTACT US">
				<span>
					For questions regarding this privacy policy, please reach out at{' '}
					<CustomLink to={mailtoSupport}>{supportUrl}</CustomLink>.
				</span>
			</CustomParagraph>
			<span>Last Updated: SEPTEMBER 2023</span>
		</TextRoute>
	)
}
