import Link from "next/link";
import { listFamilies } from "./listfamilies";
import Card from "../../components/card";

export default async function ListFamilies() {
    const families = await listFamilies();

    if (!families.success) {
        return <p>{families.message}</p>;
    }

    if (!families.families || families.families.length === 0) {
        return <p>Create or join a family to use the map.</p>;
    }

    return (
        <div>
            {families.families.map((family) => (
                <Card key={family.id}>
                    <h2>{family.name}</h2>
                    <p>
                        Family ID: <code>{family.id}</code>
                    </p>
                    <Link href={`/map/${family.id}`}>Go to map</Link>
                </Card>
            ))}
        </div>
    );
}
