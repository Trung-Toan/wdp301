import React from "react";
import CurrentDiseases from "./RecordsTab/CurrentDiseases";
import Allergies from "./RecordsTab/Allergies";
import Medications from "./RecordsTab/Medications";
import TestResults from "./RecordsTab/TestResults";


export default function RecordsTab() {
    return (
        <div className="space-y-6">
            {/* Bệnh hiện tại  */}
            <CurrentDiseases />

            {/* Dị Ứng */}
            <Allergies />

            {/* Thuốc */}
            <Medications />

            {/* Kết quả khám */}
            <TestResults />
        </div>
    );
}
