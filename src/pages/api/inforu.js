export default async function handler(req, res) {
	const body = JSON.parse(req.body);
	const phone = body.phone;
	const response = await changeSubStatus(phone);
	const json = await response.json();

	res.status(200).json({ body: json });
}

function changeSubStatus(phone) {
	const myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/json");
	myHeaders.append(
		"Authorization",
		"Basic bWFya2V0aW5nZWxnYWQ6YTY1YTM2ZTEtMTA0MC00MTBjLWIxOTYtMjc4OTZhYzAzOGNi",
	);

	const raw = JSON.stringify({
		Data: {
			UnsubscribeReason: "Customer request",
			List: [
				{
					Type: "Phone",
					Value: phone,
				},
			],
		},
	});

	const requestOptions = {
		method: "POST",
		headers: myHeaders,
		body: raw,
		redirect: "follow",
	};

	return fetch(
		"https://capi.inforu.co.il/api/V2/Contact/Unsubscribe",
		requestOptions,
	);
}
