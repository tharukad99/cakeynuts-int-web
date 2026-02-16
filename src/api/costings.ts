import { http } from "./http";

export interface CostingLine {
  itemName: string;
  unit: string;
  quantity: number;
  costPerUnit: number;
}

export interface CreateCostingDto {
  productName: string;
  servings: number;
  lines: CostingLine[];
  packagingCost: number;
  labourCost: number;
  overheadCost: number;
  wastagePercent: number;
  pricingMethod: "Markup" | "Margin";
  pricingPercent: number;
}

export interface CostingSummary {
  id: number;
  productName: string;
  totalCost: number;
  labelPrice: number;
  profit: number;
  profitMarginPercent: number;
  createdUtc: string;
}

export const getCostings = async (): Promise<CostingSummary[]> => {
  const res = await http.get("/api/v1/costings");
  return res.data;
};

export const getCostingById = async (id: number) => {
  const res = await http.get(`/api/v1/costings/${id}`);
  return res.data;
};

export const createCosting = async (dto: CreateCostingDto) => {
  const res = await http.post("/api/v1/costings", dto);
  return res.data;
};

export const updateCosting = async (id: number, dto: CreateCostingDto) => {
  const res = await http.put(`/api/v1/costings/${id}`, dto);
  return res.data;
};

export const deleteCosting = async (id: number) => {
  await http.delete(`/api/v1/costings/${id}`);
};
