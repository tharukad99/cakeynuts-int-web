import { useState, useEffect } from "react";
import { getInventory, setPendingUpdate } from "../../api/inventory";
import type { InventoryItem } from "../../api/inventory";
import { useNavigate } from "react-router-dom";

export default function EditInventoryPage() {
    const navigate = useNavigate();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [newQty, setNewQty] = useState("");
    const [newCost, setNewCost] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getInventory();
            setItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (item: InventoryItem) => {
        setEditingId(item.id);
        setNewQty(item.newQty ? item.newQty.toString() : "");
        setNewCost(item.newCostPerUnit ? item.newCostPerUnit.toString() : "");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setNewQty("");
        setNewCost("");
    };

    const savePending = async (id: number) => {
        if (!newQty || !newCost) return alert("Please enter both Quantity and Cost for the pending batch.");

        try {
            await setPendingUpdate(id, Number(newQty), Number(newCost));
            alert("Pending update saved! It will apply automatically when stock hits 0.");
            setEditingId(null);
            loadData();
        } catch (err) {
            alert("Failed to save pending update.");
            console.error(err);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h2>Manage Inventory Stock</h2>
                <button className="btn btn-secondary" onClick={() => navigate("/inventory")}>Back to List</button>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ background: "var(--color-bg)", borderBottom: "2px solid var(--color-border)" }}>
                        <tr>
                            <th style={{ padding: "12px", textAlign: "left" }}>Item</th>
                            <th style={{ padding: "12px", textAlign: "right" }}>Current Stock</th>
                            <th style={{ padding: "12px", textAlign: "right" }}>Current Cost</th>
                            <th style={{ padding: "12px", textAlign: "left", background: "#E3F2FD", borderLeft: "2px solid #BBDEFB" }}>Next Batch (Pending)</th>
                            <th style={{ padding: "12px", textAlign: "center" }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                <td style={{ padding: "12px", fontWeight: 500 }}>{item.name} <small>({item.unit})</small></td>

                                <td style={{ padding: "12px", textAlign: "right", color: item.quantityOnHand <= 0 ? "red" : "inherit" }}>
                                    {item.quantityOnHand}
                                </td>
                                <td style={{ padding: "12px", textAlign: "right" }}>£{item.costPerUnit.toFixed(2)}</td>

                                {/* Pending Columns */}
                                <td style={{ padding: "12px", background: "#F5F5F5", borderLeft: "2px solid #BBDEFB" }}>
                                    {editingId === item.id ? (
                                        <div style={{ display: "grid", gap: "8px" }}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                <small>Qty:</small>
                                                <input
                                                    type="number"
                                                    style={{ width: "80px", padding: "4px" }}
                                                    value={newQty}
                                                    onChange={e => setNewQty(e.target.value)}
                                                    placeholder="New Qty"
                                                />
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                <small>Cost £:</small>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    style={{ width: "80px", padding: "4px" }}
                                                    value={newCost}
                                                    onChange={e => setNewCost(e.target.value)}
                                                    placeholder="New Cost"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        item.newQty != null ? (
                                            <div style={{ fontSize: "0.9rem", color: "var(--color-primary)" }}>
                                                <div><strong>Qty:</strong> {item.newQty}</div>
                                                <div><strong>Cost:</strong> £{item.newCostPerUnit?.toFixed(2)}</div>
                                            </div>
                                        ) : <span style={{ color: "#aaa", fontStyle: "italic" }}>- None -</span>
                                    )}
                                </td>

                                <td style={{ padding: "12px", textAlign: "center" }}>
                                    {editingId === item.id ? (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                            <button
                                                className="btn btn-primary"
                                                style={{ fontSize: "0.8rem", padding: "4px" }}
                                                onClick={() => savePending(item.id)}
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                style={{ border: "none", background: "none", color: "#666", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline" }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => startEdit(item)}
                                            style={{
                                                background: "white",
                                                border: "1px solid var(--color-primary)",
                                                color: "var(--color-primary)",
                                                borderRadius: "4px",
                                                padding: "6px 12px",
                                                cursor: "pointer",
                                                fontSize: "0.85rem"
                                            }}
                                        >
                                            Set Pending
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
