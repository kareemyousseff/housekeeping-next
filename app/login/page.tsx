"use client";

import { useActionState } from "react";
import { login } from "../modules/auth/login";
import Card from "../components/card";

export default function Login() {
    const [state, formAction, isPending] = useActionState(login, null);
    return (
        <Card className="card-auth">
            <h1>Login</h1>
            <form action={formAction}>
                <input type="email" name="email" placeholder="Email" />
                <input type="password" name="password" placeholder="Password" />
                <button type="submit" disabled={isPending}>Login</button>
            </form>
            {state && <p>{state.message}</p>}
        </Card>
    );
}