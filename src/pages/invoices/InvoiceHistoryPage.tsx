import { useEffect, useState } from "react";
import { listInvoices } from "../../api/invoices";

/* Inline stylistic helper for status badges */
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid': return { bg: '#E0F2F1', color: '#00695C' };
    case 'pending': return { bg: '#FFF8E1', color: '#FF8F00' };
    case 'cancelled': return { bg: '#FFEBEE', color: '#C62828' };
    default: return { bg: '#F5F5F5', color: '#616161' };
  }
};

export default function InvoiceHistoryPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    listInvoices().then(setItems);
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2>Invoice History</h2>
        {/* Could add a 'New Invoice' button here */}
      </div>

      <div className="card table-responsive" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "var(--color-bg)", borderBottom: "2px solid var(--color-border)" }}>
            <tr>
              <th style={{ padding: "16px", textAlign: "left", color: "var(--color-text-muted)", fontWeight: 600 }}>Invoice #</th>
              <th style={{ padding: "16px", textAlign: "left", color: "var(--color-text-muted)", fontWeight: 600 }}>Customer</th>
              <th style={{ padding: "16px", textAlign: "left", color: "var(--color-text-muted)", fontWeight: 600 }}>Status</th>
              <th style={{ padding: "16px", textAlign: "right", color: "var(--color-text-muted)", fontWeight: 600 }}>Total</th>
              <th style={{ padding: "16px", textAlign: "right", color: "var(--color-text-muted)", fontWeight: 600 }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x, i) => {
              const statusStyle = getStatusColor(x.status || 'pending');
              return (
                <tr key={x.id || i} style={{ borderBottom: "1px solid var(--color-border)", transition: "background 0.2s" }} className="hover-row">
                  <td style={{ padding: "16px", fontWeight: 500 }}>{x.invoiceNo}</td>
                  <td style={{ padding: "16px" }}>{x.customerName}</td>
                  <td style={{ padding: "16px" }}>
                    <span style={{
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "0.85rem",
                      fontWeight: 600
                    }}>
                      {x.status || 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: "16px", textAlign: "right", fontWeight: 600 }}>£{x.total?.toFixed(2)}</td>
                  <td style={{ padding: "16px", textAlign: "right", color: "var(--color-text-muted)" }}>
                    {x.createdUtc ? String(x.createdUtc).replace("T", " ").slice(0, 10) : '-'}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "var(--color-text-muted)" }}>
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .hover-row:hover {
          background-color: var(--color-bg);
        }
      `}</style>
    </div>
  );
}
