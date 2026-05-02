import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "fallback_secret";

export const generateToken = (id: number): string => {
  return jwt.sign({ id }, SECRET, { expiresIn: "1d" });
};

export const verifyToken = (token: string): jwt.JwtPayload | string => {
  return jwt.verify(token, SECRET);
};
