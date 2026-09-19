import Link from "next/link";
import { getCurrentUserId } from "../modules/auth/auth";
import { logout } from "../modules/auth/logout";
import Wordmark from "./wordmark";

export default async function Nav() {
    const userId = await getCurrentUserId();

    return (
        <nav className="app-nav">
            <Wordmark />
            {userId ? (
                <>
                    <Link href="/families">Families</Link>
                    <form action={logout}>
                        <button type="submit">Logout</button>
                    </form>
                </>
            ) : (
                <>
                    <Link href="/login">Login</Link>
                    <Link href="/signup">Signup</Link>
                </>
            )}
        </nav>
    );
}
