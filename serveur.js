const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");

const app = express();
const PORT = 3000;

let data = [];

function loadCSV() {
  data = [];
  fs.createReadStream("./data.csv")
    .pipe(csv({
      separator: ",",
      quote: '"',
      escape: '"',
      strict: false
    }))
    .on("data", row => {
      // On ne garde que les lignes qui ont une légende non vide
if (row["Légende"] && row["Légende"].trim() !== "" && row["Légende"].trim() !==  "---"
 && row["Commune"].trim() !== ""   ) {
    const { 
          ["Auteur doc. reproduit"]: _, 
          ["Sujet"]: __, 
          ["Lieu-dit"]: ___, 
          ["Nom du fichier"]:____,
          ["Catégorie"]:_____,
          ["Mot-clé"]:_______,
          ...filteredRow 
        } = row;
  data.push(filteredRow);
}
    })
    .on("end", () => {
      console.log("CSV chargé :", data.length, "lignes avec légende");
      if (data.length > 0) {
        console.log("Colonnes détectées :", Object.keys(data[0]));
      }
    })
    .on("error", err => console.error("Erreur CSV :", err));
}

loadCSV();

// GET ALL
app.get("/all", (req, res) => {
  res.json(data);
});

// GET by Immatriculation
app.get("/byImma/:id", (req, res) => {
  const id = req.params.id;
  const found = data.find(r => r.Immatriculation === id);

  if (!found) {
    return res.status(404).json({ error: "Immatriculation non trouvée" });
  }

  res.json(found);
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé : http://localhost:${PORT}`);
});
