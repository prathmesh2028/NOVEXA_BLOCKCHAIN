import React, { useState, useEffect } from "react";
import { supplyChainService, SupplierResponse } from "../../../services/supply-chain";

export default function SuppliersList() {
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplyChainService.listSuppliers();
      setSuppliers(data.items || (data as any)); // fallback to raw array if API changes
    } catch (error) {
      console.error("Failed to fetch suppliers", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading suppliers...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Suppliers</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Add Supplier
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-3 text-center text-gray-500">
                  No suppliers found.
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr key={supplier.id} className="border-b border-gray-800 hover:bg-gray-800">
                  <td className="p-3 text-gray-300">{supplier.supplier_id || supplier.id}</td>
                  <td className="p-3 text-white font-medium">{supplier.name}</td>
                  <td className="p-3 text-gray-400">{supplier.contact_email || supplier.contact_phone || "N/A"}</td>
                  <td className="p-3">
                    <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded">
                      {supplier.status || "ACTIVE"}
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
