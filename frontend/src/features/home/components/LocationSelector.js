import React, { useEffect, useState } from "react";
import { provinceApi, wardApi } from "../../../api/address";
import { MapPin } from "lucide-react";

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
        <div className="flex flex-col gap-3">
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <select
                    onChange={handleProvinceChange}
                    value={selectedProvince}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white/70 py-2 pl-10 pr-4 text-gray-700 backdrop-blur-sm focus:border-primary focus:outline-none"
                >
                    <option value="">-- Chọn Tỉnh --</option>
                    {provinces.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                </select>
            </div>

            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <select
                    disabled={!wards.length}
                    onChange={handleWardChange}
                    value={selectedWard}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white/70 py-2 pl-10 pr-4 text-gray-700 backdrop-blur-sm focus:border-primary focus:outline-none disabled:opacity-50"
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
