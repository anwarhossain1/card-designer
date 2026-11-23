/**
 * Grants or removes the admin role from the command line.
 *
 *   npm run make-admin -- someone@example.com
 *   npm run make-admin -- --revoke someone@example.com
 *
 * This is how the first admin comes to exist: the admin API can only be used
 * by an admin, so something outside it has to make one. The account must
 * already exist — sign up first, then promote. Every change is written to the
 * audit log with source "cli".
 *
 * The change takes effect on the account's next admin request; AdminGuard
 * reads the role from the database, so nobody needs to sign in again.
 */
import { Logger, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DatabaseModule } from "../config/database.module";
import { AuditModule } from "../modules/audit/audit.module";
import { AuditService } from "../modules/audit/audit.service";
import { UsersModule } from "../modules/users/users.module";
import { UsersService } from "../modules/users/users.service";

@Module({ imports: [DatabaseModule, UsersModule, AuditModule] })
class MakeAdminModule {}

const USAGE = "Usage: npm run make-admin -- [--revoke] <email>";

const parseArgs = (argv: string[]) => {
  const revoke = argv.includes("--revoke");
  const rest = argv.filter((arg) => arg !== "--revoke");
  const email = rest[0]?.trim().toLowerCase();
  if (!email || rest.length !== 1 || !email.includes("@")) return null;
  return { revoke, email };
};

async function run(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  if (!args) {
    console.error(USAGE);
    return 1;
  }

  // Nest's boot logging would bury the one line this script has to say.
  const app = await NestFactory.createApplicationContext(MakeAdminModule, {
    logger: ["error", "warn"],
  });

  try {
    const users = app.get(UsersService);
    const audit = app.get(AuditService);

    const user = await users.findByEmail(args.email);
    if (!user) {
      console.error(`No account for ${args.email}. Sign up first, then rerun.`);
      return 1;
    }

    const userId = user._id.toString();
    const nextRole = args.revoke ? "user" : "admin";

    if (user.role === nextRole) {
      console.log(`${args.email} is already ${nextRole === "admin" ? "an admin" : "not an admin"}. Nothing changed.`);
      return 0;
    }

    if (!args.revoke && !user.isActive) {
      console.error(`${args.email} is deactivated. Reactivate it before promoting.`);
      return 1;
    }

    // Only an active admin counts towards keeping the admin pages reachable.
    if (args.revoke && user.isActive && (await users.countActiveAdmins()) <= 1) {
      console.error(
        `${args.email} is the last active admin. Promote someone else first.`,
      );
      return 1;
    }

    await users.setRole(userId, nextRole);
    await audit.record({
      actorId: null,
      source: "cli",
      action: args.revoke ? "user.demote" : "user.promote",
      target: { kind: "user", id: userId },
      details: { email: args.email, from: user.role, to: nextRole },
    });

    console.log(
      args.revoke
        ? `${args.email} is no longer an admin.`
        : `${args.email} is now an admin.`,
    );
    return 0;
  } finally {
    await app.close();
  }
}

run()
  .then((code) => process.exit(code))
  .catch((error: unknown) => {
    Logger.error(error, "make-admin");
    process.exit(1);
  });
