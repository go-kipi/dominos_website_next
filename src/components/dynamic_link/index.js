import React from "react";
import Link from "next/link";
import { areStringsEqual } from "utils/functions";
import LINK_BEHAVIOR_TYPES from "constants/dynamic-link-behavior-types";

export default function DynamicLink({
	link,
	className = "",
	tabIndex = 0,
	children,
	onClick = () => {},
	ariaLabel,
}) {
	if (!link.url || link.url === "") {
		console.warn(
			"empty or invalid link object supplied to DynamicLink component",
			link,
		);
		return <div className={className}>{children}</div>;
	}

	const linkBehavior = link?.linkBehavior;
	const isInternal = link?.relPath;

	if (
		linkBehavior &&
		areStringsEqual(linkBehavior, LINK_BEHAVIOR_TYPES.RELOAD)
	) {
		return (
			<OutSideLink
				url={link.url}
				className={className}
				tabIndex={tabIndex}
				onClick={onClick}
				ariaLabel={ariaLabel}
				shouldOpenNewTab={false}>
				{children}
			</OutSideLink>
		);
	}

	if (
		(linkBehavior &&
			areStringsEqual(linkBehavior, LINK_BEHAVIOR_TYPES.INTERNAL)) ||
		isInternal
	) {
		return (
			<InteralLink
				url={link.url}
				className={className}
				tabIndex={tabIndex}
				ariaLabel={ariaLabel}
				onClick={onClick}>
				{children}
			</InteralLink>
		);
	}

	if (
		(linkBehavior &&
			areStringsEqual(linkBehavior, LINK_BEHAVIOR_TYPES.NEW_TAB)) ||
		!isInternal
	) {
		return (
			<OutSideLink
				url={link.url}
				className={className}
				tabIndex={tabIndex}
				onClick={onClick}
				ariaLabel={ariaLabel}
				shouldOpenNewTab={true}>
				{children}
			</OutSideLink>
		);
	}

	return <div className={className}>{children}</div>;
}

function InteralLink({
	url,
	className = "",
	tabIndex = 0,
	onClick = () => {},
	children,
 	ariaLabel
}) {
	return (
		<Link
			href={url}
			aria-label={ariaLabel}
			className={className}
			tabIndex={tabIndex}
			onClick={onClick}>
			{children}
		</Link>
	);
}

function OutSideLink({
	url,
	className = "",
	tabIndex = 0,
	onClick = () => {},
	children,
	shouldOpenNewTab = true,
 	ariaLabel,
}) {
	const target = shouldOpenNewTab ? "_blank" : "_self";
	return (
		<a
			aria-label={ariaLabel}
			tabIndex={tabIndex}
			className={className}
			href={url}
			target={target}
			rel="noreferrer"
			onClick={onClick}>
			{children}
		</a>
	);
}
