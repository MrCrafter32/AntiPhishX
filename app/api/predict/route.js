export async function POST(req) {
    try {
        const body = await req.json();

        const response = await fetch("http://mrcrafter.tech/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: body.text }),
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: "Prediction failed" }), {
            status: 500,
            error: err.message
        });
    }
}
