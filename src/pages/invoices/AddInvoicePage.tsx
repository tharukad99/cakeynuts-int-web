import { useState } from "react";
import { createInvoice } from "../../api/invoices";

export default function AddInvoicePage() {
  const [customerName, setCustomerName] = useState("");
  const [itemName, setItemName] = useState("Chocolate Bento Cake");
  const [qty, setQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState(18.99);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await createInvoice({
        customerName,
        discount: 0,
        tax: 0,
        lines: [{ itemName, unit: "pcs", quantity: qty, unitPrice }],
      });
      setMessage({ text: `Invoice saved successfully! #${res.invoiceNo}`, type: 'success' });
      // Reset form optionally
      setCustomerName("");
      setQty(1);
    } catch (err) {
      setMessage({ text: "Failed to create invoice.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2>Create New Invoice</h2>
        <p style={{ color: "var(--color-text-muted)" }}>Enter the details for the new order.</p>
      </div>

      <div className="card">
        <form onSubmit={save} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

          <div style={{ gridColumn: "1 / -1" }}>
            <label>Customer Name</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Alice Baker"
              required
            />
          </div>

          <div style={{ gridColumn: "1 / -1", borderTop: "1px solid var(--color-border)", margin: "8px 0" }}></div>

          <div style={{ gridColumn: "1 / -1" }}>
            <h4 style={{ marginBottom: "16px", color: "var(--color-primary)" }}>Order Items</h4>
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label>Item Description</label>
            <input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. 6-inch Red Velvet"
              required
            />
          </div>

          <div>
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />
          </div>

          <div>
            <label>Unit Price (£)</label>
            <input
              type="number"
              step="0.01"
              value={unitPrice}
              onChange={(e) => setUnitPrice(Number(e.target.value))}
            />
          </div>

          <div style={{ gridColumn: "1 / -1", marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
              Total: <span style={{ color: "var(--color-primary)" }}>£{(qty * unitPrice).toFixed(2)}</span>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Invoice"}
            </button>
          </div>

          {message && (
            <div style={{
              gridColumn: "1 / -1",
              padding: "16px",
              borderRadius: "var(--radius-sm)",
              background: message.type === 'success' ? "#E8F5E9" : "#FFEBEE",
              color: message.type === 'success' ? "#2E7D32" : "#C62828"
            }}>
              {message.text}
            </div>
          )}

        </form>
      </div>
    </div>
  );
}
