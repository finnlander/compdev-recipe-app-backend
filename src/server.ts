import { NextFunction, Request, Response } from "express";
import { readFileSync } from "fs";
import jsonServer from "json-server";
import jwt, { Jwt, JwtPayload, SignOptions, VerifyOptions } from "jsonwebtoken";
import path from "path";
import { createIngredientService } from "./ingredientService";
import { DB } from "./models/db.model";
import { Ingredient } from "./models/ingredient.model";
import { Recipe } from "./models/recipe.model";
import { User } from "./models/user.model";
import { createUserService } from "./userService";

type TokenPayload = JwtPayload & {
  id: number;
  username: string;
};

declare global {
  namespace Express {
    export interface Request {
      auth?: TokenPayload;
    }
  }
}

const port = 3000;

// note: requires 'secret_key' file in project root having some random generated key value
const secretFile = path.join(__dirname, "../secret_key");
const secret = readFileSync(secretFile);

const jwtSignOptions: SignOptions = {
  algorithm: "HS256",
  audience: `http://localhost:${port}`,
  issuer: `recipe-app`,
  subject: "recipe-app",
  expiresIn: 3600,
};

const jwtVerifyOptions: VerifyOptions = {
  algorithms: [jwtSignOptions.algorithm!!],
  audience: jwtSignOptions.audience,
  issuer: jwtSignOptions.issuer,
  subject: jwtSignOptions.subject,
  maxAge: jwtSignOptions.expiresIn,
  complete: true,
};

const server = jsonServer.create();
const router = jsonServer.router<DB>("db.json");
const defaultMiddleware = jsonServer.defaults();

const userService = createUserService(router.db);
const ingredientService = createIngredientService(router.db);

interface AuthRequest {
  username: string;
  password: string;
}

interface AuthResponse {
  token: string;
}

interface GenericResponse {
  status: "OK" | "ERROR";
  error?: string;
}

interface IngredientRequest {
  ingredientNames: string[];
}

server
  .use(defaultMiddleware)
  .use(jsonServer.bodyParser)
  // unauthenticated routes
  .post(
    "/auth/login",
    (
      req: Request<AuthRequest>,
      res: Response<AuthResponse | GenericResponse>
    ) => {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).send({
          status: "ERROR",
          error: "'username' and 'password' required",
        });
      }

      if (!userService.authorize(username, password)) {
        return res
          .status(403)
          .send({ status: "ERROR", error: "invalid 'username' or 'password'" });
      }

      const user = userService.getUserByUsername(username);
      if (!user) {
        return res
          .status(500)
          .send({ status: "ERROR", error: "Unexpected internal error" });
      }

      res.status(200).send(toAuthResponse(user));
    }
  )
  .post(
    "/auth/signup",
    (
      req: Request<any, any, AuthRequest>,
      res: Response<AuthResponse | GenericResponse>
    ) => {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).send({
          status: "ERROR",
          error: "'username' and 'password' required",
        });
      }

      if (userService.exists(username)) {
        console.log('user "' + username + '" already exists');
        return res.status(409).send({
          status: "ERROR",
          error: "'username' already exists",
        });
      }

      const user = userService.add(username, password);
      const resBody = toAuthResponse(user);
      return res.status(200).send(resBody);
    }
  )
  // authenticated routes
  .use((req: Request, res: Response, next: NextFunction) => {
    if (authenticate(req)) {
      next();
    } else {
      res.status(401).send();
    }
  })
  .put(
    "/recipes",
    (req: Request<any, any, Recipe[]>, res: Response<GenericResponse>) => {
      const recipes: Recipe[] = req.body;
      router.db.set("recipes", recipes).commit();
      router.db.write();

      res.status(200).send({ status: "OK" });
    }
  )
  .post(
    "/ingredients",
    (
      req: Request<any, any, IngredientRequest>,
      res: Response<Ingredient[] | GenericResponse>
    ) => {
      if (!req.body || !req.body.ingredientNames) {
        return res.status(400).send({
          status: "ERROR",
          error:
            "request body with 'ingredientNames' string array field required",
        });
      }

      const { ingredientNames } = req.body;

      const ingredients = ingredientNames.map((ingredientName) =>
        ingredientService.getOrAdd(ingredientName)
      );
      return res.status(200).send(ingredients);
    }
  )
  .get("/users", (req: Request<any>, res: Response) => {
    res.status(404).send("NOT FOUND");
  })
  .get(
    "/users/me",
    (req: Request, res: Response<Partial<User> | GenericResponse>) => {
      const authenticatedUser = userService.getUserById(req.auth!!.id);

      if (!authenticatedUser) {
        return res.status(404).send({ status: "ERROR", error: "NOT FOUND" });
      }

      const resBody = toUserResponse(authenticatedUser);
      return res.status(200).send(resBody);
    }
  )
  .get(
    "/users/:id",
    (req: Request, res: Response<Partial<User> | GenericResponse>) => {
      const userId = +req.params.id;
      const authenticatedUserId = req.auth!!.id;

      if (userId !== authenticatedUserId) {
        return res.status(403).send({ status: "ERROR", error: "FORBIDDEN" });
      }

      const user = userService.getUserById(userId);
      if (!user) {
        return res.status(404).send({ status: "ERROR", error: "NOT FOUND" });
      }

      const resBody = toUserResponse(user);
      return res.status(200).send(resBody);
    }
  )
  .use(router)
  .listen(port, () => {
    console.log("JSON Server is running on port:", port);
  });

/* Helper Functions */

function authenticate(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return false;
  }

  // remove 'Bearer ' prefix
  const token = authHeader.split(" ")[1];
  if (!token) {
    return false;
  }

  try {
    const decodedToken = jwt.verify(token, secret, jwtVerifyOptions) as Jwt;
    const payload = decodedToken.payload as TokenPayload;
    req.auth = payload;

    return true;
  } catch (err) {
    console.log("Error in auth check: ", err);
    return false;
  }
}

function toAuthResponse(user: User): AuthResponse {
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    secret,
    jwtSignOptions
  );

  return { token };
}

function toUserResponse(user: User): Partial<User> {
  // omit including some secret fields
  const { passwordHash, passwordSalt, ...resBody } = user;
  return resBody;
}
