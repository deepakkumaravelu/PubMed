const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors()); 
app.get("/api/pubmed", async (req, res) => {
  try {
    const keyword = req.query.term;
    if (!keyword) return res.status(400).json({ error: "Keyword required" });

    const response = await fetch(`https://www.ncbi.nlm.nih.gov/pmc/?term=${keyword}`);
    const html = await response.text();
    res.send(html);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on :${PORT}`));
