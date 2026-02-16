import { http } from "./http";

export type InvoiceLineCreate = {
  itemName: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceCreate = {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  discount?: number;
  tax?: number;
  notes?: string;
  lines: InvoiceLineCreate[];
};

export async function createInvoice(payload: InvoiceCreate) {
  const res = await http.post("/api/v1/invoices", payload);
  return res.data as { id: number; invoiceNo: string; total: number };
}

export async function listInvoices() {
  const res = await http.get("/api/v1/invoices");
  return res.data as any[];
}

export async function getInvoice(id: number) {
  const res = await http.get(`/api/v1/invoices/${id}`);
  return res.data;
}
