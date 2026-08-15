// Brevo transactional email over their HTTPS API (port 443) instead of
// SMTP (port 587) — Render's free tier blocks outbound SMTP ports, so the
// old nodemailer.createTransport() call would hang forever there.
//
// This keeps the same `transporter.sendMail({ from, to, subject, text })`
// shape your controllers already call, so authController.js needs zero changes.

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export const transporter = {
    sendMail: async ({ from, to, subject, text }) => {
        // TEMP DEBUG — remove once this is confirmed working
        console.log("BREVO_API_KEY present:", !!process.env.BREVO_API_KEY, "length:", process.env.BREVO_API_KEY?.length);

        const response = await fetch(BREVO_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "api-key": process.env.BREVO_API_KEY
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