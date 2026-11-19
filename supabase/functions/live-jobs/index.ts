const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const COUNTRY_LATLNG: Record<string, [number, number]> = {
  Germany: [51.16, 10.45],
  France: [46.6, 2.35],
  Spain: [40.2, -3.7],
  Italy: [42.8, 12.5],
  Netherlands: [52.13, 5.29],
  Belgium: [50.5, 4.47],
  Austria: [47.52, 14.55],
  Poland: [51.92, 19.15],
  Sweden: [60.13, 18.64],
  Denmark: [56.13, 9.5],
  Finland: [61.92, 25.75],
  Ireland: [53.14, -7.69],
  Portugal: [39.4, -8.22],
  Greece: [39.07, 21.82],
  Czechia: [49.82, 15.47],
  Romania: [45.94, 24.97],
  Hungary: [47.16, 19.5],
  "Remote / EU-wide": [50.11, 8.68],
};

function normalizeCountry(raw: string | null): string {
  if (!raw) return "Remote / EU-wide";
  const trimmed = raw.trim();
  const match = Object.keys(COUNTRY_LATLNG).find(
    (k) => k.toLowerCase() === trimmed.toLowerCase()
  );
  return match ?? trimmed;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pages = Math.min(Math.max(Number(url.searchParams.get("pages") ?? "3"), 1), 5);

    const all: unknown[] = [];
    let page = 1;
    let seen = false;
    while (page <= pages) {
      const res = await fetch(`https://www.arbeitnow.com/api/job-board-api?page=${page}`, {
        headers: { "User-Agent": "Alicemplea/1.0 (community jobs aggregator)" },
      });
      if (!res.ok) break;
      const body = await res.json();
      const batch: unknown[] = body?.data ?? [];
      if (batch.length === 0) break;
      all.push(...batch);
      seen = true;
      page += 1;
    }

    if (!seen) {
      return new Response(JSON.stringify({ jobs: [], error: "Upstream job feed unavailable" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const jobs = all
      .map((raw) => {
        const j = raw as Record<string, unknown>;
        const country = normalizeCountry((j.location as string | null)?.split(",").pop() ?? null);
        const latlng = COUNTRY_LATLNG[country];
        return {
          id: `arbeitnow-${j.slug}`,
          title: (j.title as string | null) ?? "Untitled role",
          company: (j.company_name as string | null) ?? "",
          country,
          city: (j.location as string | null)?.split(",")[0]?.trim() || country,
          latitude: latlng?.[0] ?? null,
          longitude: latlng?.[1] ?? null,
          salaryText: (j.salary as string | null) ?? (j.remote ? "Remote" : ""),
          jobType: (j.job_type as string | null) ?? "",
          languages: (j.tags as string[] | null)?.slice(0, 4).join(", ") ?? "",
          applyUrl: (j.url as string | null) ?? "",
          description: String(j.description_html ?? "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .slice(0, 300),
          postedAt: j.created_at as number | null,
        };
      })
      .filter((j) => COUNTRY_LATLNG[j.country] !== undefined);

    return new Response(JSON.stringify({ jobs }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ jobs: [], error: err instanceof Error ? err.message : "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
