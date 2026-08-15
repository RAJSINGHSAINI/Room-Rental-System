const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export const transporter = {
    sendMail: async ({ from, to, subject, text }) => {
        const response = await fetch(BREVO_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "api-key": process.env.SMTP_KEY
            },
            body: JSON.stringify({
                sender: { email: from },
                to: [{ email: to }],
                subject,
                textContent: text
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Brevo API error (${response.status}): ${errorBody}`);
        }

        return response.json();
    }
};