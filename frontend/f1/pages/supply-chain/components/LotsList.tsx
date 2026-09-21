import React, { useState, useEffect } from "react";
import { supplyChainService, LotResponse } from "../../../services/supply-chain";

export default function LotsList() {
  const [lots, setLots] = useState<LotResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      setLoading(true);
      const data = await supplyChainService.listLots();
      setLots(data.items || (data as any));
    } catch (error) {
      console.error("Failed to fetch lots", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading lots...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Material Lots</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Add Lot
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="p-3">Lot ID</th>
              <th className="p-3">Facility</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {lots.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-3 text-center text-gray-500">
                  No lots found.
                </td>
              </tr>
            ) : (
              lots.map((lot) => (
                <tr key={lot.id} className="border-b border-gray-800 hover:bg-gray-800">
                  <td className="p-3 text-white font-medium">{lot.lot_id || lot.id}</td>
                  <td className="p-3 text-gray-400">{lot.facility?.name || "N/A"}</td>
                  <td className="p-3 text-gray-400">{lot.quantity} {lot.unit || "units"}</td>
                  <td className="p-3">
                    <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded">
                      {lot.status || "CREATED"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
