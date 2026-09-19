
import { redirect } from "next/navigation";
import { getCurrentUserId } from "./modules/auth/auth";
import Link from "next/link";
import Hero from "./components/hero";

export default async function Home() {
  const userId = await getCurrentUserId();
  if (userId) {
    redirect("/families");
  }
  return (
    <Hero
      title="Welcome to the Home Map Page"
      subtitle="See who’s in the kitchen. Claim the bathroom. Keep the house in sync."
    >
      <Link href="/login">Login</Link>
      <Link href="/signup">Signup</Link>
    </Hero>
  );
}
