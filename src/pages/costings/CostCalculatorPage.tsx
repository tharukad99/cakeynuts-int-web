import { useState, useEffect } from "react";
import { createCosting, getCostingById, updateCosting } from "../../api/costings";
import type { CostingLine } from "../../api/costings";
import { getInventory, stockOut } from "../../api/inventory";
import type { InventoryItem } from "../../api/inventory";
import { useNavigate, useParams } from "react-router-dom";

// Extended interface for internal UI state to handle unit conversion
interface ExtendedCostingLine extends CostingLine {
    masterUnit?: string;
    masterCost?: number;
}

export default function CostCalculatorPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    // Basic Details
    const [productName, setProductName] = useState("");
    const [servings, setServings] = useState(1);

    // Data Source
    const [inventory, setInventory] = useState<InventoryItem[]>([]);

    // Ingredients (Lines)
    const [lines, setLines] = useState<ExtendedCostingLine[]>([
        { itemName: "", quantity: 0, unit: "g", costPerUnit: 0 }
    ]);

    // Overheads
    const [labourCost, setLabourCost] = useState(0);
    const [packagingCost, setPackagingCost] = useState(0);
    const [overheadCost, setOverheadCost] = useState(0); // e.g. electricity/gas
    const [wastagePercent, setWastagePercent] = useState(5); // Default 5%

    // Pricing
    const [pricingMethod, setPricingMethod] = useState<"Markup" | "Margin">("Markup");
    const [pricingPercent, setPricingPercent] = useState(40); // 40% markup

    // Calculated Results
    const [results, setResults] = useState({
        ingredientsTotal: 0,
        baseCost: 0,
        wastageValue: 0,
        totalCost: 0,
        suggestedPrice: 0,
        profit: 0
    });

    useEffect(() => {
        // Load Inventory for dropdown
        getInventory().then(items => {
            setInventory(items);

            // If items already loaded from edit mode, try to match master details
            // This is tricky if edit mode loads first. 
            // Safe bet: load inventory first, then editing data won't overwrite master details 
            // if we merge carefully, OR we just let edit load refresh.
            // Actually, standard edit flow: load inv, then load detail.
        }).catch(console.error);

    }, []);

    useEffect(() => {
        if (isEditMode && id && inventory.length > 0) {
            getCostingById(Number(id)).then(data => {
                setProductName(data.productName);
                setServings(data.servings);
                setPackagingCost(data.packagingCost);
                setLabourCost(data.labourCost);
                setOverheadCost(data.overheadCost);
                setWastagePercent(data.wastagePercent);
                setPricingMethod(data.pricingMethod as any);
                setPricingPercent(data.pricingPercent);

                // Map lines
                setLines(data.lines.map((l: any) => {
                    // Find master item to get original unit/cost context if possible
                    // But beware, price might have changed. 
                    // For calculation consistency, we should probably stick to what was saved?
                    // BUT request says: "master table only have kg... it should be only selected g..."
                    // So we should try to map back to master item properties.
                    const master = inventory.find(i => i.name === l.itemName);

                    return {
                        itemName: l.itemName,
                        unit: l.unit,
                        quantity: l.quantity,
                        costPerUnit: l.costPerUnit,
                        masterUnit: master?.unit,
                        masterCost: master?.costPerUnit
                    };
                }));
            }).catch(err => {
                console.error(err);
                alert("Failed to load costing details.");
                navigate("/cost/history");
            });
        }
    }, [id, isEditMode, navigate, inventory.length]); // Dependency on inventory.length ensures we wait for inv load

    // Helper to get cost based on unit conversion and stock levels
    const calculateLineCost = (line: ExtendedCostingLine) => {
        const invItem = inventory.find(i => i.name === line.itemName);

        // Basic conversion to master unit (e.g. g -> kg)
        const conversion = getConversionFactor(line.unit, line.masterUnit);

        // Calculate Quantity in Master Unit (e.g. 500g -> 0.5kg)
        const qtyInMaster = line.quantity * conversion;

        // If we have inventory data, try to use split pricing
        if (invItem && line.masterCost) {
            const currentQty = Math.max(0, invItem.quantityOnHand);
            const currentPrice = line.masterCost;

            // Scenario 1: Enough stock in current batch
            if (currentQty >= qtyInMaster) {
                return qtyInMaster * currentPrice;
            }

            // Scenario 2: Split stock (Use all current + remainder from new)
            // If newCostPerUnit is available, use it. Otherwise fallback to current price.
            const newPrice = (invItem.newCostPerUnit && invItem.newCostPerUnit > 0)
                ? invItem.newCostPerUnit
                : currentPrice;

            const remainder = qtyInMaster - currentQty;

            const costFromCurrent = currentQty * currentPrice;
            const costFromNew = remainder * newPrice;

            return costFromCurrent + costFromNew;
        }

        // Fallback if no inventory link (standard calc)
        return line.quantity * line.costPerUnit;
    };

    const getConversionFactor = (recipeUnit: string, masterUnit?: string) => {
        if (!masterUnit) return 1; // Fallback

        const r = recipeUnit.toLowerCase();
        const m = masterUnit.toLowerCase();

        if (r === m) return 1;

        // Weight
        if (m === 'kg' && r === 'g') return 0.001;
        if (m === 'kg' && r === 'kg') return 1;

        // Volume
        if (m === 'l' && r === 'ml') return 0.001;
        if (m === 'l' && r === 'l') return 1;

        // Pieces
        if ((m === 'pcs' || m === 'qty') && (r === 'pcs' || r === 'qty')) return 1;

        return 1; // Unknown conversion
    };

    // Calculate whenever inputs change
    useEffect(() => {
        const ingredientsTotal = lines.reduce((sum, line) => sum + calculateLineCost(line), 0);
        const baseCost = ingredientsTotal + labourCost + packagingCost + overheadCost;
        const wastageValue = baseCost * (wastagePercent / 100);
        const totalCost = baseCost + wastageValue;

        let suggestedPrice = 0;
        if (pricingMethod === "Margin") {
            // Price = Cost / (1 - Margin)
            const marginDecimal = pricingPercent / 100;
            if (marginDecimal < 1) {
                suggestedPrice = totalCost / (1 - marginDecimal);
            }
        } else {
            // Markup = Cost * (1 + Markup)
            suggestedPrice = totalCost * (1 + (pricingPercent / 100));
        }

        const profit = suggestedPrice - totalCost;

        setResults({
            ingredientsTotal,
            baseCost,
            wastageValue,
            totalCost,
            suggestedPrice,
            profit
        });
    }, [lines, labourCost, packagingCost, overheadCost, wastagePercent, pricingMethod, pricingPercent]);

    const addLine = () => {
        setLines([...lines, { itemName: "", quantity: 0, unit: "g", costPerUnit: 0 }]);
    };

    const removeLine = (index: number) => {
        setLines(lines.filter((_, i) => i !== index));
    };

    const updateLine = (index: number, field: keyof ExtendedCostingLine, value: any) => {
        // If updating quantity, we rely on the useEffect to recalculate totals using calculateLineCost
        const newLines = [...lines];
        newLines[index] = { ...newLines[index], [field]: value };
        setLines(newLines);
    };

    const handleIngredientSelect = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedName = e.target.value;
        const item = inventory.find(x => x.name === selectedName);

        if (item) {
            const newLines = [...lines];

            // Intelligent Default Unit based on Master
            let defaultUnit = item.unit;
            if (item.unit === 'kg') defaultUnit = 'g';
            if (item.unit === 'l') defaultUnit = 'ml';

            newLines[index] = {
                ...newLines[index],
                itemName: item.name,
                unit: defaultUnit,
                costPerUnit: item.costPerUnit, // Storing MASTER cost per MASTER unit
                masterUnit: item.unit,
                masterCost: item.costPerUnit
            };
            setLines(newLines);
        } else {
            updateLine(index, 'itemName', selectedName);
        }
    };

    const handleSave = async () => {
        if (!productName) return alert("Please enter a product name");
        if (lines.length === 0) return alert("Please add at least one ingredient");

        // Ask for confirmation to deduct stock
        const shouldDeductStock = confirm("Do you want to deduct these ingredients from your inventory stock?");

        // Prepare DTO
        const linesToSave = lines.map(l => {
            // Calculate actual total cost for this line (including potential split pricing)
            const totalLineCost = calculateLineCost(l);

            // Calculate effective cost per unit (Blended Rate)
            // TotalCost = Qty * EffectiveCostPerUnit
            // EffectiveCostPerUnit = TotalCost / Qty
            let effectiveCostPerUnit = 0;
            if (l.quantity > 0) {
                effectiveCostPerUnit = totalLineCost / l.quantity;
            }

            return {
                itemName: l.itemName,
                unit: l.unit,
                quantity: l.quantity,
                costPerUnit: effectiveCostPerUnit // Save the blended rate
            };
        });

        const dto = {
            productName,
            servings,
            lines: linesToSave,
            packagingCost,
            labourCost,
            overheadCost,
            wastagePercent,
            pricingMethod,
            pricingPercent
        };

        try {
            if (isEditMode && id) {
                await updateCosting(Number(id), dto);
                alert("Updated successfully!");
            } else {
                await createCosting(dto);

                // If new costing, and user agreed, adjust stock
                if (shouldDeductStock) {
                    for (const line of lines) {
                        if (line.itemName && line.quantity > 0) {
                            // Fire and forget stock adjustment, or await?
                            // Await to ensure integrity.
                            try {
                                const invItem = inventory.find(x => x.name === line.itemName);
                                if (invItem) {
                                    await stockOut(invItem.id, line.quantity, line.unit);
                                } else {
                                    // Fallback for custom entries if needed? 
                                    // Actually, we can't stock out something not in inventory by ID.
                                    // So skip.
                                    console.warn(`Cannot deduct stock for custom item: ${line.itemName}`);
                                }
                            } catch (e) {
                                console.error(`Failed to adjust stock for ${line.itemName}`, e);
                            }
                        }
                    }
                }

                alert("Saved successfully!");
            }
            navigate("/cost/history");
        } catch (err) {
            alert("Failed to save.");
            console.error(err);
        }
    };

    // Available units for dropdown
    const getAvailableUnits = (masterUnit?: string) => {
        const u = masterUnit?.toLowerCase();
        if (!u) return ["g", "kg", "ml", "l", "pcs"]; // Default

        if (u === 'kg' || u === 'g') return ["g", "kg"];
        if (u === 'l' || u === 'ml') return ["ml", "l"];
        if (u === 'pcs' || u === 'qty') return ["pcs"];

        return [u]; // Fallback to whatever matches
    };

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h2>{isEditMode ? "Edit Product Costing" : "New Product Costing"}</h2>
                <button className="btn btn-secondary" onClick={() => navigate("/cost/history")}>View History</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>

                {/* LEFT COLUMN: INPUTS */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                    {/* Section 1: Product Info */}
                    <div className="card">
                        <h3>1. Product Details</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: "16px" }}>
                            <div>
                                <label>Product Name</label>
                                <input value={productName} onChange={e => setProductName(e.target.value)} placeholder="e.g. Vanilla Sponge 8 inch" />
                            </div>
                            <div>
                                <label>Servings</label>
                                <input type="number" value={servings} onChange={e => setServings(Number(e.target.value))} />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Ingredients */}
                    <div className="card">
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                            <h3>2. Ingredients</h3>
                            <button className="btn btn-sm" onClick={addLine} style={{ fontSize: "0.8rem" }}>+ Add Item</button>
                        </div>

                        {lines.map((line, i) => (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr 30px", gap: "8px", marginBottom: "8px", alignItems: "end" }}>
                                <div>
                                    {i === 0 && <label style={{ fontSize: "0.8rem" }}>Item (Select from Master)</label>}
                                    <select
                                        value={line.itemName}
                                        onChange={(e) => handleIngredientSelect(i, e)}
                                        style={{ width: "100%" }}
                                    >
                                        <option value="">-- Choose Ingredient --</option>
                                        {inventory.map(inv => (
                                            <option key={inv.id} value={inv.name}>
                                                {inv.name} (£{inv.costPerUnit} / {inv.unit})
                                            </option>
                                        ))}
                                        {!inventory.find(x => x.name === line.itemName) && line.itemName && (
                                            <option value={line.itemName}>{line.itemName} (Custom)</option>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    {i === 0 && <label style={{ fontSize: "0.8rem" }}>Qty</label>}
                                    <div style={{ display: "flex", gap: "4px" }}>
                                        <input
                                            type="number"
                                            value={line.quantity}
                                            onChange={e => updateLine(i, 'quantity', Number(e.target.value))}
                                            style={{ flex: 1 }}
                                        />
                                        <select
                                            value={line.unit}
                                            onChange={e => updateLine(i, 'unit', e.target.value)}
                                            style={{ width: "80px", padding: "8px 4px" }}
                                        >
                                            {getAvailableUnits(line.masterUnit).map(u => (
                                                <option key={u} value={u}>{u}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    {i === 0 && <label style={{ fontSize: "0.8rem" }}>Master Cost</label>}
                                    <input type="number" step="0.001" value={line.costPerUnit} readOnly style={{ background: "#f5f5f5", color: "#888" }} />
                                </div>
                                <div>
                                    {i === 0 && <label style={{ fontSize: "0.8rem" }}>Total</label>}
                                    <div style={{ padding: "10px", background: "var(--color-bg)", borderRadius: "4px", textAlign: "right", fontSize: "0.9rem" }}>
                                        £{calculateLineCost(line).toFixed(2)}
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeLine(i)}
                                    style={{ color: "#DD2C00", padding: "8px", background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem" }}
                                    title="Remove line"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}

                        <div style={{ textAlign: "right", marginTop: "16px", fontWeight: "bold" }}>
                            Ingredients Total: £{results.ingredientsTotal.toFixed(2)}
                        </div>
                    </div>

                    {/* Section 3: Overheads & Wastage */}
                    <div className="card">
                        <h3>3. Overheads & Wastage</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <div>
                                <label>Labour Cost (£)</label>
                                <input type="number" value={labourCost} onChange={e => setLabourCost(Number(e.target.value))} />
                            </div>
                            <div>
                                <label>Packaging Cost (£)</label>
                                <input type="number" value={packagingCost} onChange={e => setPackagingCost(Number(e.target.value))} />
                            </div>
                            <div>
                                <label>Other Overheads (£)</label>
                                <input type="number" value={overheadCost} onChange={e => setOverheadCost(Number(e.target.value))} />
                            </div>
                            <div>
                                <label>Wastage %</label>
                                <input type="number" value={wastagePercent} onChange={e => setWastagePercent(Number(e.target.value))} />
                            </div>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: PRICING & SUMMARY */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                    <div className="card" style={{ position: "sticky", top: "24px", background: "#3E2723", color: "white", border: "none" }}>
                        <h3 style={{ color: "var(--color-accent)" }}>Pricing Strategy</h3>

                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ color: "rgba(255,255,255,0.7)" }}>Method</label>
                            <select
                                value={pricingMethod}
                                onChange={e => setPricingMethod(e.target.value as any)}
                                style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}
                            >
                                <option value="Markup">Markup %</option>
                                <option value="Margin">Gross Margin %</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: "24px" }}>
                            <label style={{ color: "rgba(255,255,255,0.7)" }}>Percentage value</label>
                            <input
                                type="number"
                                value={pricingPercent}
                                onChange={e => setPricingPercent(Number(e.target.value))}
                                style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", fontSize: "1.2rem", fontWeight: "bold" }}
                            />
                        </div>

                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <span>Total Cost</span>
                                <span>£{results.totalCost.toFixed(2)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <span>Profit</span>
                                <span style={{ color: "var(--color-secondary-light)" }}>£{results.profit.toFixed(2)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.5rem", fontWeight: "bold", marginTop: "16px", color: "var(--color-accent)" }}>
                                <span>Price</span>
                                <span>£{results.suggestedPrice.toFixed(2)}</span>
                            </div>
                            <div style={{ textAlign: "right", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
                                (Per serving: £{(results.suggestedPrice / Math.max(1, servings)).toFixed(2)})
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            className="btn"
                            style={{ width: "100%", marginTop: "24px", background: "var(--color-primary)", color: "white", border: "none" }}
                        >
                            {isEditMode ? "Update Costing" : "Save Costing"}
                        </button>

                    </div>

                </div>
            </div>
        </div>
    );
}
