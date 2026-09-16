import fs from "fs";
import crypto from "crypto";

const CREDENTIALS_PATH = "./config/smart-mbg-508408-647620470907.json";
const SPREADSHEET_ID = "1MGiWhVSjRf3JHWibTkw2WQTh5n_IpEB848m3lROTsuA";

function base64url(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getAccessToken() {
  const raw = fs.readFileSync(CREDENTIALS_PATH, "utf-8");
  const creds = JSON.parse(raw);

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: creds.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: creds.token_uri || "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedClaim = base64url(JSON.stringify(claim));
  const signInput = `${encodedHeader}.${encodedClaim}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(signInput);
  const signature = signer.sign(creds.private_key);
  const jwt = `${signInput}.${base64url(signature)}`;

  const res = await fetch(creds.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Failed to get access token: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

async function main() {
  console.log("Mengautentikasi dengan service account pinocioupdate...");
  const token = await getAccessToken();
  console.log("Token berhasil didapatkan.");

  // 1. Dapatkan metadata spreadsheet
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meta = await metaRes.json();
  if (!metaRes.ok) {
    throw new Error(`Gagal membaca spreadsheet: ${JSON.stringify(meta)}`);
  }
  console.log("Judul Spreadsheet:", meta.properties?.title);
  console.log("Daftar Tab Sheet:", meta.sheets?.map((s) => `[${s.properties?.sheetId}] ${s.properties?.title}`).join(" | "));

  const targetSheetTitle = "Progres Harian (14-15 Sep)";
  const existingSheet = meta.sheets?.find((s) => s.properties?.title === targetSheetTitle);
  let sheetId = existingSheet?.properties?.sheetId;

  // 2. Jika sheet belum ada, buat sheet baru
  if (!existingSheet) {
    console.log(`Membuat sheet baru: "${targetSheetTitle}"...`);
    const addRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: targetSheetTitle,
                  gridProperties: {
                    frozenRowCount: 1,
                  },
                  tabColor: {
                    red: 0.1,
                    green: 0.55,
                    blue: 0.25,
                  },
                },
              },
            },
          ],
        }),
      }
    );
    const addData = await addRes.json();
    if (!addRes.ok) {
      throw new Error(`Gagal membuat sheet baru: ${JSON.stringify(addData)}`);
    }
    sheetId = addData.replies?.[0]?.addSheet?.properties?.sheetId;
    console.log("Sheet baru berhasil dibuat dengan ID:", sheetId);
  } else {
    console.log(`Sheet "${targetSheetTitle}" sudah ada dengan ID: ${sheetId}. Memperbarui data...`);
  }

  // 3. Baca data dari docs/progres-kemarin-dan-hari-ini.csv secara dinamis
  const csvPath = "./docs/progres-kemarin-dan-hari-ini.csv";
  const csvContent = fs.readFileSync(csvPath, "utf-8");

  function parseCSV(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i + 1];
      if (c === '"') {
        if (inQuotes && next === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        row.push(cell.trim());
        cell = "";
      } else if ((c === '\r' || c === '\n') && !inQuotes) {
        if (c === '\r' && next === '\n') i++;
        row.push(cell.trim());
        cell = "";
        if (row.some(field => field.length > 0)) {
          rows.push(row);
        }
        row = [];
      } else {
        cell += c;
      }
    }
    if (cell.length > 0 || row.length > 0) {
      row.push(cell.trim());
      if (row.some(field => field.length > 0)) {
        rows.push(row);
      }
    }
    return rows;
  }

  const rows = parseCSV(csvContent);
  console.log(`Memuat ${rows.length} baris (termasuk header) dari ${csvPath}...`);

  // Kosongkan range terlebih dahulu agar data bersih
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/'${targetSheetTitle}'!A:H:clear`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/'${targetSheetTitle}'!A1?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        range: `'${targetSheetTitle}'!A1`,
        majorDimension: "ROWS",
        values: rows,
      }),
    }
  );
  const updateData = await updateRes.json();
  if (!updateRes.ok) {
    throw new Error(`Gagal mengisi data: ${JSON.stringify(updateData)}`);
  }
  console.log("Data berhasil diisi:", updateData.updatedCells, "sel diperbarui.");

  // 4. Format header (background hijau tua, teks putih tebal) dan auto-fit lebar kolom
  if (sheetId !== undefined) {
    const formatRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: 8,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.105, green: 0.368, blue: 0.125 },
                    textFormat: {
                      foregroundColor: { red: 1, green: 1, blue: 1 },
                      bold: true,
                      fontSize: 10,
                    },
                    horizontalAlignment: "CENTER",
                  },
                },
                fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
              },
            },
            {
              autoResizeDimensions: {
                dimensions: {
                  sheetId: sheetId,
                  dimension: "COLUMNS",
                  startIndex: 0,
                  endIndex: 8,
                },
              },
            },
          ],
        }),
      }
    );
    if (formatRes.ok) {
      console.log("Formatting header dan auto-resize selesai diterapkan.");
    }
  }

  console.log("SELESAI! Sheet baru berhasil dibuat dan diperbarui di Google Sheets.");
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
