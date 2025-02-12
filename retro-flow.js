const fs = require("fs");
const path = require("path");

// Daftar kategori yang bisa dideteksi
const CATEGORIES = ["absurd", "keluarga", "liburan"];

function detectCategory(mediaFiles) {
  for (const file of mediaFiles) {
    for (const category of CATEGORIES) {
      if (file.toLowerCase().includes(category)) {
        return category; // Return kategori pertama yang cocok
      }
    }
  }
  return "general"; // Default kategori jika tidak ditemukan yang cocok
}

function generateMemories() {
  const mediaDir = path.join(__dirname, "memory-vault");
  const memoryFolders = fs.readdirSync(mediaDir).filter(folder =>
    fs.statSync(path.join(mediaDir, folder)).isDirectory()
  );

  const memories = memoryFolders.map((folder, index) => {
    const folderPath = path.join(mediaDir, folder);
    const mediaFiles = fs.readdirSync(folderPath).map(file => `memory-vault/${folder}/${file}`);
    
    const category = detectCategory(mediaFiles); // Deteksi kategori dari file dalam folder

    return {
      id: index + 1,
      title: `${folder}`,
      description: `Foto dan video dalam album ${folder}`,
      date: new Date().toISOString().split("T")[0],
      category,
      mediaFiles
    };
  });

  fs.writeFileSync("reminisync.json", JSON.stringify({ memories }, null, 2));
  console.log("\nCONSOLE: \nKenangan berhasil dicadangkan! \n\nMemories Of Legacy 9.9");
}

generateMemories();
