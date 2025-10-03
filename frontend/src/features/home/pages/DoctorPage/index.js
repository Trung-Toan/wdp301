import { useParams } from "react-router-dom";
import { DoctorDetailContent } from "./doctor-detail-content";

export default function DoctorDetailPage() {
    const { id } = useParams();

    return (
        <div className="min-h-screen">
            <main>
                <DoctorDetailContent doctorId={id || "1"} />
            </main>
        </div>
    );
}
