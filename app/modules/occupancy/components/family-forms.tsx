"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createFamily } from "../../family/createfamily";
import { joinFamily } from "../../family/joinfamily";
import Card from "../../../components/card";

export default function FamilyForms() {
    const [createState, createAction, createPending] = useActionState(createFamily, null);
    const [joinState, joinAction, joinPending] = useActionState(joinFamily, null);

    return (
        <div className="family-forms">
            <Card>
                <h2>Create a family</h2>
                <form action={createAction}>
                    <input type="text" name="name" placeholder="Family name" required />
                    <button type="submit" disabled={createPending}>
                        {createPending ? "Creating..." : "Create family"}
                    </button>
                </form>
                {createState && <p>{createState.message}</p>}
                {createState?.success && createState.familyId && (
                    <p>
                        Family ID: <code>{createState.familyId}</code> — share this so others can join.
                    </p>
                )}
                {createState?.success && createState.familyId && (
                    <p>
                        <Link href={`/map/${createState.familyId}`}>Go to map</Link>
                    </p>
                )}
            </Card>

            <Card>
                <h2>Join a family</h2>
                <form action={joinAction}>
                    <input type="text" name="familyId" placeholder="Paste family ID" required />
                    <button type="submit" disabled={joinPending}>
                        {joinPending ? "Joining..." : "Join family"}
                    </button>
                </form>
                {joinState && <p>{joinState.message}</p>}
                {joinState?.success && joinState.familyId && (
                    <p>
                        <Link href={`/map/${joinState.familyId}`}>Go to map</Link>
                    </p>
                )}
            </Card>
        </div>
    );
}
