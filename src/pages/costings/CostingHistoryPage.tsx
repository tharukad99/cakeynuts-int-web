import { useEffect, useState } from "react";
import { getCostings, deleteCosting } from "../../api/costings";
import type { CostingSummary } from "../../api/costings";
import { Link } from "react-router-dom";

export default function CostingHistoryPage() {
    const [items, setItems] = useState<CostingSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getCostings();
            setItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this costing?")) return;
        try {
            await deleteCosting(id);
            setItems(items.filter((x) => x.id !== id));
        } catch (err) {
            alert("Failed to delete.");
        }
    };

    if (loading) return <div>Loading history...</div>;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h2>Costing History</h2>
                <Link to="/cost/calc" className="btn btn-primary">
                    + New Costing
                </Link>
            </div>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ background: "var(--color-bg)", borderBottom: "2px solid var(--color-border)" }}>
                        <tr>
                            <th style={{ padding: "16px", textAlign: "left" }}>Product Name</th>
                            <th style={{ padding: "16px", textAlign: "right" }}>Total Cost</th>
                            <th style={{ padding: "16px", textAlign: "right" }}>Label Price</th>
                            <th style={{ padding: "16px", textAlign: "right" }}>Profit</th>
                            <th style={{ padding: "16px", textAlign: "right" }}>Margin</th>
                            <th style={{ padding: "16px", textAlign: "center" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((x) => (
                            <tr key={x.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                <td style={{ padding: "16px", fontWeight: 500 }}>{x.productName}</td>
                                <td style={{ padding: "16px", textAlign: "right" }}>£{x.totalCost.toFixed(2)}</td>
                                <td style={{ padding: "16px", textAlign: "right", fontWeight: "bold" }}>£{x.labelPrice.toFixed(2)}</td>
                                <td style={{ padding: "16px", textAlign: "right", color: "var(--color-secondary-dark)" }}>
                                    £{x.profit.toFixed(2)}
                                </td>
                                <td style={{ padding: "16px", textAlign: "right" }}>
                                    {x.profitMarginPercent.toFixed(1)}%
                                </td>
                                <td style={{ padding: "16px", textAlign: "center" }}>
                                    <Link
                                        to={`/cost/calc/${x.id}`}
                                        style={{
                                            marginRight: "8px",
                                            color: "var(--color-primary)",
                                            textDecoration: "none",
                                            fontSize: "0.85rem",
                                            fontWeight: 500
                                        }}>
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(x.id)}
                                        style={{
                                            background: "transparent",
                                            color: "#C62828",
                                            padding: "4px 8px",
                                            fontSize: "0.85rem"
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "var(--color-text-muted)" }}>
                                    No costings saved yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
