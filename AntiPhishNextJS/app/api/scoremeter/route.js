export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const scoreParam = searchParams.get('score') || "0";
    const score = Math.min(parseInt(scoreParam), 100);
  
    const radius = 40;
    const stroke = 8;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
  
    const strokeColor = "#64748b";
  
    const svg = `
      <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="${radius}" stroke="#e5e7eb" stroke-width="${stroke}" fill="none" />
        <circle
          cx="60"
          cy="60"
          r="${radius}"
          stroke="${strokeColor}"
          stroke-width="${stroke}"
          fill="none"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${circumference}"
          stroke-linecap="round"
          transform="rotate(-90 60 60)"
        >
          <animate attributeName="stroke-dashoffset" from="${circumference}" to="${offset}" dur="1.5s" fill="freeze" />
        </circle>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="#1f2937" font-family="sans-serif">
          ${score}%
        </text>
      </svg>
    `;
  
    return new Response(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-store',
      }
    });
  }