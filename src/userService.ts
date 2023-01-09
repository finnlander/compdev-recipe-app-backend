import { LowdbSync } from "lowdb";
import { DB } from "./models/db.model";
import { User } from "./models/user.model";

import crypto from "crypto";

interface UserService {
  getUserById(userId: number): User | undefined;
  exists: (username: string) => boolean;
  getUserByUsername: (username: string) => User | undefined;
  add: (username: string, password: string) => User;
  authorize: (username: string, password: string) => boolean;
}

/**
 * User service that uses simple json file backed 'lowdb' as a data source.
 */
class UserServiceImpl implements UserService {
  constructor(private db: LowdbSync<DB>) {}

  /**
   * Check if user identified by username exists.
   */
  exists = (username: string): boolean => {
    return (
      this.getUsers()
        .findIndex((it) => it.username === username)
        .value() !== -1
    );
  };

  /**
   * Get user by 'username'.
   */
  getUserByUsername = (username: string): User | undefined => {
    const user = this.getUsers().find((it) => it.username === username);
    return user.value();
  };

  /**
   * Get user by 'id'.
   */
  getUserById = (userId: number): User | undefined => {
    const user = this.getUsers().find((it) => it.id === userId);
    return user ? user.value() : undefined;
  };

  /**
   * Add new user.
   * @param username username.
   * @param password password (plaintext, will be hashed).
   * @returns created user.
   * @throws Error, if user already exists.
   */
  add = (username: string, password: string): User => {
    const users = this.getUsers();

    if (this.exists(username)) {
      throw Error(`User ${username} already exists`);
    }

    const salt = crypto.randomBytes(16).toString("hex");

    const user: User = {
      id: users.toLength().value() + 1,
      username,
      passwordHash: getPasswordHash(password, salt),
      passwordSalt: salt,
    };

    users.value().push(user);
    this.db.write();

    return user;
  };

  /**
   * Authorize existing user by username and password (basic auth).
   * @returns 'true' if user authorization is passed; otherwise 'false'.
   */
  authorize = (username: string, password: string): boolean => {
    const match = this.getUsers().find((it) => it.username === username);
    const user = match.value();
    if (!user) {
      return false;
    }

    return user.passwordHash === getPasswordHash(password, user.passwordSalt);
  };

  private getUsers = () => {
    return this.db.get("users");
  };
}

export function createUserService(db: LowdbSync<DB>): UserService {
  return new UserServiceImpl(db);
}

function getPasswordHash(value: string, salt: string): string {
  return crypto.pbkdf2Sync(value, salt, 1000, 256, "sha256").toString("hex");
}
