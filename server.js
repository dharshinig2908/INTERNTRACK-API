const express = require("express");
const internshipRoutes = require("./internshipRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the INTERNTRACK-API"
  });
});

app.use("/api/internships", internshipRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found."
  });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      success: false,
      error: "Invalid JSON."
    });
  }

  console.error(err);

  res.status(500).json({
    success: false,
    error: "Internal server error."
  });
});

app.listen(PORT, () => {
  console.log(`INTERNTRACK-API running at http://localhost:${PORT}`);
});