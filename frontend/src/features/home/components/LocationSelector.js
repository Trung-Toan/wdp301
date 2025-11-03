import React, { useEffect, useState } from "react";
import { provinceApi, wardApi } from "../../../api";

export default function LocationSelector({ onChange }) {
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedWard, setSelectedWard] = useState("");

    useEffect(() => {
        async function fetchProvinces() {
            try {
                const res = await provinceApi.getProvinces();
                if (res.data.success) setProvinces(res.data.options);
            } catch (err) {
                console.error("Lỗi khi tải tỉnh:", err);
            }
        }
        fetchProvinces();
    }, []);

    const handleProvinceChange = async (e) => {
        const code = e.target.value;
        setSelectedProvince(code);
        setSelectedWard("");
        if (!code) return;
        try {
            const res = await wardApi.getWardsByProvince(code);
            if (res.data.success) setWards(res.data.options);
        } catch (err) {
            console.error("Lỗi khi tải phường:", err);
        }
    };

    const handleWardChange = (e) => {
        const code = e.target.value;
        setSelectedWard(code);
        if (onChange) onChange({ province: selectedProvince, ward: code });
    };

    return (
        <div className="flex flex-col gap-1">
            <div className="hero-select-wrapper">
                <select
                    onChange={handleProvinceChange}
                    value={selectedProvince}
                    className="hero-select"
                >
                    <option value="">-- Chọn Tỉnh --</option>
                    {provinces.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                </select>
            </div>

            <div className="hero-select-wrapper">
                <select
                    disabled={!wards.length}
                    onChange={handleWardChange}
                    value={selectedWard}
                    className="hero-select"
                >
                    <option value="">-- Chọn Phường --</option>
                    {wards.map((w) => (
                        <option key={w.value} value={w.value}>{w.label}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
