import React, { useState, useEffect } from "react";
import { supplyChainService, ShipmentResponse } from "../../../services/supply-chain";

export default function ShipmentsList() {
  const [shipments, setShipments] = useState<ShipmentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const data = await supplyChainService.listShipments();
      setShipments(data.items || (data as any));
    } catch (error) {
      console.error("Failed to fetch shipments", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading shipments...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Shipments & Custody</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Create Shipment
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="p-3">Shipment ID</th>
              <th className="p-3">Lot</th>
              <th className="p-3">Origin</th>
              <th className="p-3">Destination</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {shipments.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-3 text-center text-gray-500">
                  No shipments found.
                </td>
              </tr>
            ) : (
              shipments.map((shipment) => (
                <tr key={shipment.id} className="border-b border-gray-800 hover:bg-gray-800">
                  <td className="p-3 text-white font-medium">{shipment.shipment_id || shipment.id}</td>
                  <td className="p-3 text-gray-400">{shipment.lot?.lot_id || "N/A"}</td>
                  <td className="p-3 text-gray-400">{shipment.origin_facility?.name || "N/A"}</td>
                  <td className="p-3 text-gray-400">{shipment.destination_facility?.name || "N/A"}</td>
                  <td className="p-3">
                    <span className="bg-yellow-900 text-yellow-300 text-xs px-2 py-1 rounded">
                      {shipment.status || "PENDING"}
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
