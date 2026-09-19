import FamilyForms from "../modules/occupancy/components/family-forms";
import ListFamilies from "../modules/family/list";
import FamiliesLayout from "../components/families-layout";

export default function FamiliesPage() {
    return (
        <div>
            <h1>Families</h1>
            <FamiliesLayout
                list={<ListFamilies />}
                forms={<FamilyForms />}
            />
        </div>
    );
}
