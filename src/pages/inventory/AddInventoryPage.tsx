import { useState } from "react";
import { createInventory } from "../../api/inventory";
import { useNavigate } from "react-router-dom";

export default function AddInventoryPage() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [unit, setUnit] = useState("g");
    const [costPerUnit, setCostPerUnit] = useState(0);
    const [quantityOnHand, setQuantityOnHand] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return alert("Name is required");

        setLoading(true);
        try {
            await createInventory({
                name,
                unit,
                costPerUnit: Number(costPerUnit),
                quantityOnHand: Number(quantityOnHand)
            });
            alert("Ingredient added successfully!");
            navigate("/inventory");
        } catch (err) {
            alert("Failed to add Stock.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ marginBottom: "24px" }}>
                <h2>Add New Ingredient</h2>
                <button onClick={() => navigate("/inventory")} style={{ background: "none", border: "none", color: "var(--color-primary)", padding: 0, fontSize: "0.9rem", cursor: "pointer", textDecoration: "underline" }}>
                    &larr; Back to Inventory
                </button>
            </div>

            <div className="card">
                <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                        <label>Item Name</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Plain Flour"
                            autoFocus
                        />
                    </div>

                    <div className="form-row">
                        <div>
                            <label>Unit Type</label>
                            <select
                                value={unit}
                                onChange={e => setUnit(e.target.value)}
                                style={{ padding: "12px", width: "100%", borderRadius: "var(--radius-sm)", border: "2px solid var(--color-border)" }}
                            >
                                <option value="g">Grams (g)</option>
                                <option value="kg">Kilograms (kg)</option>
                                <option value="ml">Milliliters (ml)</option>
                                <option value="l">Liters (l)</option>
                                <option value="pcs">Pieces (pcs)</option>
                                <option value="box">Box</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div>
                            <label>Cost Per Unit (£)</label>
                            <input
                                type="number"
                                step="0.001"
                                value={costPerUnit}
                                onChange={e => setCostPerUnit(Number(e.target.value))}
                            />
                            <small style={{ color: "var(--color-text-muted)" }}>Price for 1 {unit}</small>
                        </div>
                        <div>
                            <label>Current Stock</label>
                            <input
                                type="number"
                                step="0.01"
                                value={quantityOnHand}
                                onChange={e => setQuantityOnHand(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: "16px" }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: "100%" }}
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Ingredient"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
