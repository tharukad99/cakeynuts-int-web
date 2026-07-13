import { useEffect, useState } from "react";
import { getInventory, deleteInventory } from "../../api/inventory";
import type { InventoryItem } from "../../api/inventory";
import { Link } from "react-router-dom";

export default function InventoryListPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

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

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        try {
            await deleteInventory(id);
            setItems(items.filter((x) => x.id !== id));
        } catch (err) {
            alert("Failed to delete.");
        }
    };

    if (loading) return <div>Loading inventory...</div>;

    return (
        <div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", gap: "16px" }}>
                <h2>Inventory / Ingredients</h2>
                <div>
                    <Link to="/inventory/add" className="btn btn-primary">
                        + Add New
                    </Link>
                    <Link to="/inventory/manage" className="btn btn-secondary" style={{ marginLeft: "8px" }}>
                        Manage
                    </Link>
                </div>
            </div>

            <div className="card table-responsive" style={{ padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ background: "var(--color-bg)", borderBottom: "2px solid var(--color-border)" }}>
                        <tr>
                            <th style={{ padding: "16px", textAlign: "left" }}>Item Name</th>
                            <th style={{ padding: "16px", textAlign: "left" }}>Unit</th>
                            <th style={{ padding: "16px", textAlign: "right" }}>Cost Per Unit</th>
                            <th style={{ padding: "16px", textAlign: "right" }}>In Stock</th>
                            <th style={{ padding: "16px", textAlign: "center" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((x) => (
                            <tr key={x.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                <td style={{ padding: "16px", fontWeight: 500 }}>{x.name}</td>
                                <td style={{ padding: "16px" }}>{x.unit}</td>
                                <td style={{ padding: "16px", textAlign: "right" }}>£{x.costPerUnit.toFixed(2)}</td>
                                <td style={{ padding: "16px", textAlign: "right" }}>{x.quantityOnHand}</td>
                                <td style={{ padding: "16px", textAlign: "center" }}>
                                    <button
                                        onClick={() => handleDelete(x.id)}
                                        style={{
                                            background: "transparent",
                                            color: "#C62828",
                                            padding: "4px 8px",
                                            fontSize: "0.85rem",
                                            border: "1px solid #FFCDD2",
                                            borderRadius: "4px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "var(--color-text-muted)" }}>
                                    No ingredients found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
