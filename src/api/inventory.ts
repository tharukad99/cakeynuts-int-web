import { http } from "./http";

export interface InventoryItem {
    id: number;
    name: string;
    unit: string;
    quantityOnHand: number;
    costPerUnit: number;
    // Pending fields
    newQty?: number | null;
    newCostPerUnit?: number | null;
}

export interface CreateInventoryDto {
    name: string;
    unit: string;
    quantityOnHand: number;
    costPerUnit: number;
}

export const getInventory = async (): Promise<InventoryItem[]> => {
    const res = await http.get("/api/v1/inventory");
    return res.data;
};

export const createInventory = async (dto: CreateInventoryDto): Promise<InventoryItem> => {
    const res = await http.post("/api/v1/inventory", dto);
    return res.data;
};

export const deleteInventory = async (id: number): Promise<void> => {
    await http.delete(`/api/v1/inventory/${id}`);
};

export const adjustStock = async (itemName: string, quantity: number, unit: string) => {
    // Legacy support via name
    const res = await http.post("/api/v1/inventory/adjust", {
        itemName,
        quantity,
        unit
    });
    return res.data;
};

export const stockOut = async (id: number, quantityUsed: number, unit?: string) => {
    const res = await http.post(`/api/v1/inventory/${id}/stockout`, {
        quantityUsed,
        unit
    });
    return res.data;
};

export const setPendingUpdate = async (id: number, newQty: number, newCostPerUnit: number) => {
    const res = await http.put(`/api/v1/inventory/${id}/pending`, {
        newQty,
        newCostPerUnit
    });
    return res.data;
};
