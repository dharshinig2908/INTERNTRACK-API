const express = require("express");
const db = require("./database");
const { validateInternship } = require("./validation");

const router = express.Router();

const allowedFields = [
  "title",
  "company",
  "location",
  "type",
  "status",
  "description",
  "applicationUrl"
];

// GET: List internships with pagination
router.get("/", (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);

  if (
    !Number.isInteger(page) ||
    !Number.isInteger(limit) ||
    page < 1 ||
    limit < 1 ||
    limit > 100
  ) {
    return res.status(400).json({
      success: false,
      error: "Page must be positive and limit must be between 1 and 100."
    });
  }

  const total = db
    .prepare("SELECT COUNT(*) AS count FROM internships")
    .get().count;

  const data = db.prepare(`
    SELECT * FROM internships
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `).all(limit, (page - 1) * limit);

  res.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// GET: Get one internship
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      success: false,
      error: "Invalid internship ID."
    });
  }

  const internship = db
    .prepare("SELECT * FROM internships WHERE id = ?")
    .get(id);

  if (!internship) {
    return res.status(404).json({
      success: false,
      error: "Internship not found."
    });
  }

  res.json({ success: true, data: internship });
});

// POST: Create an internship
router.post("/", validateInternship, (req, res) => {
  const {
    title,
    company,
    location = "",
    type = "Internship",
    status = "Open",
    description = "",
    applicationUrl = ""
  } = req.body;

  const result = db.prepare(`
    INSERT INTO internships
    (title, company, location, type, status, description, applicationUrl)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    title.trim(),
    company.trim(),
    location,
    type,
    status,
    description,
    applicationUrl
  );

  const internship = db
    .prepare("SELECT * FROM internships WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json({
    success: true,
    data: internship
  });
});

// PATCH: Update an internship
router.patch("/:id", validateInternship, (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      success: false,
      error: "Invalid internship ID."
    });
  }

  const existing = db
    .prepare("SELECT * FROM internships WHERE id = ?")
    .get(id);

  if (!existing) {
    return res.status(404).json({
      success: false,
      error: "Internship not found."
    });
  }

  const fields = Object.keys(req.body).filter(
    field => allowedFields.includes(field)
  );

  if (fields.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Provide at least one valid field to update."
    });
  }

  const assignments = fields
    .map(field => `${field} = @${field}`)
    .join(", ");

  const values = Object.fromEntries(
    fields.map(field => [
      field,
      typeof req.body[field] === "string" &&
      ["title", "company"].includes(field)
        ? req.body[field].trim()
        : req.body[field]
    ])
  );

  db.prepare(`
    UPDATE internships
    SET ${assignments}, updatedAt = CURRENT_TIMESTAMP
    WHERE id = @id
  `).run({ ...values, id });

  const updated = db
    .prepare("SELECT * FROM internships WHERE id = ?")
    .get(id);

  res.json({ success: true, data: updated });
});

// DELETE: Remove an internship
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      success: false,
      error: "Invalid internship ID."
    });
  }

  const result = db
    .prepare("DELETE FROM internships WHERE id = ?")
    .run(id);

  if (result.changes === 0) {
    return res.status(404).json({
      success: false,
      error: "Internship not found."
    });
  }

  res.json({
    success: true,
    message: "Internship deleted successfully."
  });
});

module.exports = router;