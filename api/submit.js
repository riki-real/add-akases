import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = "web-payment";
const repo = "add-nomor";
const path = "code.json";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metode tidak diizinkan" });
  }

  const { nomor, password, waktu } = req.body;

  try {
    // Ambil isi file yang ada dari GitHub
    const { data: fileData } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path,
    });

    const content = Buffer.from(fileData.content, "base64").toString("utf8");
    const json = JSON.parse(content);

    // Tambahkan data baru
    json.users.push({ nomor, password, waktu });

    // Update file ke GitHub
    const updatedContent = Buffer.from(JSON.stringify(json, null, 2)).toString("base64");

    await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path,
      message: `Menambahkan nomor ${nomor}`,
      content: updatedContent,
      sha: fileData.sha, // WAJIB untuk update
    });

    res.status(200).json({ message: "Berhasil menambahkan" });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Gagal menambahkan", error: error.message });
  }
      }
