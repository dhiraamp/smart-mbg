const BADGE_COLORS = ["emerald", "orange", "blue"];

export function stripHtml(html) {
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  return doc.body.textContent || "";
}

export function mapGarutNews(data) {
  return (data?.blogs?.data || []).map((b, i) => ({
    tag: b.grup?.name || "Berita",
    color: BADGE_COLORS[i % BADGE_COLORS.length],
    time: b.date_upload || "Baru-baru ini",
    title: b.judul || "",
    summary: stripHtml(b.deskripsi).slice(0, 160),
    img: b.gambar || "",
    url: `https://satudata.garutkab.go.id/artikel/${b.slug}`,
    source: "Satu Data Garut",
  }));
}

export function parseDataGoIdNews(html) {
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  const items = [];
  doc.querySelectorAll('a[href^="/news/"]').forEach((a) => {
    const href = a.getAttribute("href") || "";
    const title = (a.textContent || "").trim();
    if (title.length < 10) return;
    const slide = a.closest('[role="group"]');
    const img = slide?.querySelector("img")?.src || "";
    const time = slide?.querySelector("time")?.textContent?.trim() || "";
    const desc = slide?.querySelector(".p-6.pt-0 div.line-clamp-2")?.textContent?.trim() || "";
    const cat = slide?.querySelector(".mt-2 span")?.textContent?.trim() || "Warta SDI";
    items.push({
      tag: cat,
      color: BADGE_COLORS[items.length % BADGE_COLORS.length],
      time,
      title,
      summary: desc,
      img,
      url: `https://data.go.id${href}`,
      source: "data.go.id",
    });
  });
  return items;
}

export async function fetchAllNews() {
  const [garutData, dataGoIdHtml] = await Promise.all([
    fetch("/satudata/api/blog").then((res) => res.json()),
    fetch("/dataid/").then((res) => res.text()),
  ]);
  return [...parseDataGoIdNews(dataGoIdHtml), ...mapGarutNews(garutData)];
}
