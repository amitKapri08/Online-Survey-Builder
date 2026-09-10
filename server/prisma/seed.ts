import "dotenv/config";
import bcrypt from "bcrypt";
import { randomBytes, randomInt } from "node:crypto";
import { prisma } from "../src/config/prisma.js";

const ADMIN_EMAIL = "admin@surveyhub.com";
const ADMIN_NAME = "Survey Hub Admin";
const SALT_ROUNDS = 10;

const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnopqrstuvwxyz";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%^&*-_=+?";

function shuffle(chars: string[]): string[] {
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    const tmp = chars[i];
    chars[i] = chars[j];
    chars[j] = tmp;
  }
  return chars;
}

function generatePassword(length = 18): string {
  const sets = [UPPER, LOWER, DIGITS, SYMBOLS];
  const chars: string[] = [];
  for (const set of sets) {
    chars.push(set[randomInt(0, set.length)]);
  }
  while (chars.length < length) {
    const set = sets[randomInt(0, sets.length)];
    chars.push(set[randomInt(0, set.length)]);
  }
  return shuffle(chars).join("");
}

async function seedAdmin(): Promise<void> {
  const password = generatePassword();
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

  if (existing) {
    await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: {
        name: ADMIN_NAME,
        role: "ADMIN",
        password: passwordHash,
        deletedAt: null,
      },
    });
    console.log(`Updated existing user ${ADMIN_EMAIL} to ADMIN with a new password.`);
  } else {
    await prisma.user.create({
      data: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: passwordHash,
        role: "ADMIN",
      },
    });
    console.log(`Created admin user ${ADMIN_EMAIL}.`);
  }

  console.log("----------------------------------------");
  console.log(`Email:    ${ADMIN_EMAIL}`);
  console.log(`Password: ${password}`);
  console.log("----------------------------------------");
  console.log("This password was randomly generated and will NOT be shown again. Save it now.");
}

async function main(): Promise<void> {
  try {
    await seedAdmin();
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();