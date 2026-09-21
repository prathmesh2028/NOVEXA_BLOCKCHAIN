import React, { useState, useEffect } from "react";
import { supplyChainService, FacilityResponse } from "../../../services/supply-chain";

export default function FacilitiesList() {
  const [facilities, setFacilities] = useState<FacilityResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const data = await supplyChainService.listFacilities();
      setFacilities(data.items || (data as any));
    } catch (error) {
      console.error("Failed to fetch facilities", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading facilities...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Facilities</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Add Facility
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Supplier</th>
              <th className="p-3">Location</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {facilities.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-3 text-center text-gray-500">
                  No facilities found.
                </td>
              </tr>
            ) : (
              facilities.map((facility) => (
                <tr key={facility.id} className="border-b border-gray-800 hover:bg-gray-800">
                  <td className="p-3 text-gray-300">{facility.facility_id || facility.id}</td>
                  <td className="p-3 text-white font-medium">{facility.name}</td>
                  <td className="p-3 text-gray-400">{facility.supplier?.name || "N/A"}</td>
                  <td className="p-3 text-gray-400">{facility.location || "N/A"}</td>
                  <td className="p-3">
                    <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded">
                      {facility.status || "OPERATIONAL"}
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
