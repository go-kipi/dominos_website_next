import useTranslate from "hooks/useTranslate";

const RecaptchaText = ({ styles }) => {
	const translate = useTranslate();
	return (
		<div className={styles["recaptcha-text"]}>
			<span>{translate("recapcha_message")}</span>
			<a
				href="https://policies.google.com/privacy"
				rel="noreferrer"
				target="_blank">
				{translate("recapcha_privacyPolicy")}
			</a>{" "}
			ו-
			<a
				href="https://policies.google.com/terms"
				rel="noreferrer"
				target="_blank">
				{translate("recapcha_termsPolicy")}
			</a>
			.
		</div>
	);
};
export default RecaptchaText;
