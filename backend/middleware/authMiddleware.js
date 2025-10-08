const jwt = require("jsonwebtoken");


// authotycation
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ error: "No token provided. Access denied!" });
  }

  if (!token.startsWith("Bearer ")) {
    return res
      .status(403)
      .json({ error: "Invalid token format. Use Bearer token." });
  }

  jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized. Invalid token!" });
    }
    req.account = decoded;
    next();
  });
};

// verify with role is ADMIN
const isAdmin = (req, res, next) => {
  if (req.account.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
};

// verify with role is DOCTOR
const isDoctor = (req, res, next) => {
  if (req.account.role !== "DOCTOR") {
    return res.status(403).json({ error: "Access denied. Doctor only." });
  }
  next();
};

// verify with role is OWNER
const isOwner = (req, res, next) => {
  if (req.account.role !== "owner") {
    return res.status(403).json({ error: "Access denied. Owners only." });
  }
  next();
};

// verify with role is CUSTOMER
const isCustomer = (req, res, next) => {
  if (req.account.role !== "customer") {
    return res.status(403).json({ error: "Access denied. Customers only." });
  }
  next();
};

module.exports = { verifyToken, isAdmin, isOwner, isCustomer };
