export async function POST(req) {
    try {
        const body = await req.json();

        if (!body.email_text) {
            return new Response(JSON.stringify({
                error: "Missing email text",
                code: "MISSING_EMAIL_TEXT",
                details: "email_text field is required in request body"
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const response = await fetch("http://antiphishnlp.mrcrafter.tech:5000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email_text: body.email_text }),
        });

        if (!response.ok) {
            throw new Error(`Prediction service error: ${response.status}`);
        }

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        console.error("Error in POST request:", err);
        return new Response(JSON.stringify({
            error: "Prediction failed",
            code: "PREDICTION_SERVICE_ERROR",
            details: err.message
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
