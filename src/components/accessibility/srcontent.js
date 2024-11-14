import React from "react";

/**
 * Screen reader content component.
 *
 * @param {string} message - The message to be announced by the screen reader.
 * @param {string} className - Additional Classname.
 * @param {string} id - id for targeting,
 * @param {string} ariaLive - aria-live - help screen reader to read dynamic texts.
 * @param {boolean} ariaAtomic - aria-atomic
 * @param {string} role - role - role of the element.
 * @returns {JSX.Element} - JSX element.
 */
export default function SRContent({
	id = "",
	message = "",
	className = "",
	ariaLive = "",
	role = "",
	ariaAtomic = false,
}) {
	return (
		<p
			id={id}
			className={"visually-hidden " + className}
			aria-live={ariaLive}
			role={role}
			aria-atomic={ariaAtomic}>
			{typeof message === "string" && message.replaceAll("'", "")}
		</p>
	);
}
