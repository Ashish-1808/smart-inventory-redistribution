import jwt from "jsonwebtoken";

// import config from "../../.env";
import dotenv from "dotenv";
import { token } from "morgan";

const authMiddleware = (req, res, next) => {
  //extract the token from the header
  const authHeader = req.headers.authorization;

  try {
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization Header Missing",
      });
    }

    //remove bearer
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token Missing",
      });
    }

    //verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or Expired Token",
    });
  }
};

export default authMiddleware;
