import { connectMongo, disconnectMongo } from "../db/mongo.js";
import { createManagedUser } from "../auth/auth.js";

async function run() {
  await connectMongo();
  try {
    const roles = [
      { email: "manager@gharpayy.com", role: "manager" as const },
      { email: "admin@gharpayy.com", role: "admin" as const },
      { email: "member@gharpayy.com", role: "member" as const },
    ];

    for (const r of roles) {
      try {
        await createManagedUser({
          fullName: `Test ${r.role}`,
          email: r.email,
          password: "password123",
          role: r.role,
        });
        console.log(`Created ${r.role}`);
      } catch (e: any) {
        if (e.code === "CONFLICT") {
          console.log(`${r.role} already exists`);
        } else {
          console.error(`Error creating ${r.role}:`, e);
        }
      }
    }
  } finally {
    await disconnectMongo();
  }
}

run().catch(console.error);
