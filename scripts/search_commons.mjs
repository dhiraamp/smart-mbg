async function searchCommons(name, query) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' + encodeURIComponent(query + ' filetype:bitmap') + '&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|size&format=json';
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'SmartMBGApp/1.0 (contact@smartmbg.id)' } });
    const data = await res.json();
    const pages = Object.values(data.query?.pages || {});
    console.log('=== ' + name + ' ===');
    pages.forEach(p => {
      const u = p.imageinfo?.[0]?.url;
      if (u) {
        console.log(p.title + ' -> ' + u);
      }
    });
  } catch(e) { console.error(e); }
}

async function run() {
  await searchCommons('susu', 'milk glass jug bottle pitcher');
}
run();
