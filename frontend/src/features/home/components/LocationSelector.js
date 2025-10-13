import React, { useState, useEffect } from "react";
import Input from "../../../components/ui/Input";


export default function LocationSelector({ onChange }) {
    const [data, setData] = useState([]);
    const [province, setProvince] = useState("");
    const [district, setDistrict] = useState("");
    const [ward, setWard] = useState("");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // Lấy dữ liệu hành chính Việt Nam
        fetch("https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json")
            .then((res) => res.json())
            .then(setData);
    }, []);

    const handleSelect = (type, value) => {
        if (type === "province") {
            setProvince(value);
            setDistrict("");
            setWard("");
        } else if (type === "district") {
            setDistrict(value);
            setWard("");
        } else {
            setWard(value);
            setOpen(false);
            onChange && onChange(`${value.Name}, ${district.Name}, ${province.Name}`);
        }
    };

    const selectedProvince = data.find((p) => p.Name === province.Name);
    const selectedDistrict =
        selectedProvince?.Districts?.find((d) => d.Name === district.Name) || null;

    return (
        <div className="relative">
            <Input
                readOnly
                placeholder="Chọn địa điểm"
                value={ward && district && province ? `${ward.Name}, ${district.Name}, ${province.Name}` : ""}
                className="pl-10 cursor-pointer"
                onClick={() => setOpen(!open)}
            />

            {open && (
                <div className="absolute left-0 top-full mt-2 z-50 w-full bg-white shadow-lg rounded-lg p-4 border">
                    <div className="grid gap-3">
                        {/* Chọn Tỉnh/Thành phố */}
                        <select
                            className="border rounded p-2 w-full"
                            onChange={(e) =>
                                handleSelect("province", data.find((p) => p.Name === e.target.value))
                            }
                            value={province.Name || ""}
                        >
                            <option value="">-- Chọn Tỉnh/Thành phố --</option>
                            {data.map((item) => (
                                <option key={item.Id} value={item.Name}>
                                    {item.Name}
                                </option>
                            ))}
                        </select>

                        {/* Chọn Quận/Huyện */}
                        {province && (
                            <select
                                className="border rounded p-2 w-full"
                                onChange={(e) =>
                                    handleSelect(
                                        "district",
                                        selectedProvince.Districts.find((d) => d.Name === e.target.value)
                                    )
                                }
                                value={district.Name || ""}
                            >
                                <option value="">-- Chọn Quận/Huyện --</option>
                                {selectedProvince?.Districts?.map((d) => (
                                    <option key={d.Id} value={d.Name}>
                                        {d.Name}
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* Chọn Xã/Phường */}
                        {district && (
                            <select
                                className="border rounded p-2 w-full"
                                onChange={(e) =>
                                    handleSelect(
                                        "ward",
                                        selectedDistrict.Wards.find((w) => w.Name === e.target.value)
                                    )
                                }
                                value={ward.Name || ""}
                            >
                                <option value="">-- Chọn Xã/Phường --</option>
                                {selectedDistrict?.Wards?.map((w) => (
                                    <option key={w.Id} value={w.Name}>
                                        {w.Name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
