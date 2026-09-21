import React, { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import SuppliersList from "./components/SuppliersList";
import FacilitiesList from "./components/FacilitiesList";
import LotsList from "./components/LotsList";
import ShipmentsList from "./components/ShipmentsList";

export default function SupplyChainDashboardPage() {
  const [activeTab, setActiveTab] = useState("suppliers");

  const tabs = [
    { id: "suppliers", label: "Suppliers" },
    { id: "facilities", label: "Facilities" },
    { id: "lots", label: "Lots" },
    { id: "shipments", label: "Shipments" },
  ];

  return (
    <div className="page-fade">
      <PageHeader
        title="Supply Chain Dashboard"
        subtitle="End-to-end supply chain visibility and custody tracking"
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Supply Chain" },
        ]}
      />

      <div className="flex space-x-4 mb-6 border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-4 border-b-2 font-medium text-sm focus:outline-none ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="panel p-6">
        {activeTab === "suppliers" && (
          <div>
            <p className="text-gray-400 mb-6">Manage your supply chain partners and vendors.</p>
            <SuppliersList />
          </div>
        )}
        {activeTab === "facilities" && (
          <div>
            <p className="text-gray-400 mb-6">Track manufacturing and storage locations.</p>
            <FacilitiesList />
          </div>
        )}
        {activeTab === "lots" && (
          <div>
            <p className="text-gray-400 mb-6">Monitor production batches and material provenance.</p>
            <LotsList />
          </div>
        )}
        {activeTab === "shipments" && (
          <div>
            <p className="text-gray-400 mb-6">Real-time custody transfer and shipment tracking.</p>
            <ShipmentsList />
          </div>
        )}
      </div>
    </div>
  );
}
