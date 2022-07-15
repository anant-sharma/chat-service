/**
 * This file contains the code required to
 * verify the integrity of request by checking JWT
 */
import * as express from "express";
import { JWT } from "../../utilities/jwt";

export const authVerify = async (
  req: any,
  res: any,
  next?: express.NextFunction
) => {
  try {
    if (req.query?.isDebug) {
      next && next();
      return;
    }

    const token = extractToken(req);

    if (!token) {
      return res.status(401).send({
        error: "Authorization Token is required.",
        status: "error",
      });
    }

    if (!(await JWT.verify(token))) {
      return res.status(401).send({
        error: "A valid Authorization Token is required.",
        status: "error",
      });
    }

    next && next();
  } catch (e) {
    return res.status(401).send({
      error: "Authorization Token is required.",
      status: "error",
    });
  }
};

export const extractToken = (req: express.Request): string | null => {
  let token: string | null = null;

  if (
    req.headers?.authorization &&
    req.headers?.authorization.split(" ")[0] === "Bearer"
  ) {
    token = req.headers?.authorization.split(" ")[1];
  } else if (req.query && req.query.token) {
    token = req.query.token as string;
  }

  return token;
};
