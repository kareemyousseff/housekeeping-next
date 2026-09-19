"use client";

import { useActionState } from "react";
import { signup } from "../modules/auth/signup";
import Card from "../components/card";

export default function SignupPage() {
    const [state, formAction, isPending] = useActionState(signup, null);
    return (
        <Card className="card-auth">
            <h1>Signup</h1>
            <form action={formAction}>
                <input type="email" name="email" placeholder="Email" />
                <input type="password" name="password" placeholder="Password" />
                <button type="submit" disabled={isPending}>Signup</button>
            </form>
            {state && <p>{state.message}</p>}
        </Card>
    );
}