"use client";

import { useEffect, useState } from "react";
import { AdminModal } from "./AdminModal";
import { VehiclesApi, AdminVehiclesApi, Vehicle } from "@/lib/api";

export function VehiclesManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    slug: "",
    name: "",
    icon: "",
    tagline: "",
    description: "",
    pricePerDay: "",
    passengers: "",
    luggage: "",
    hasAC: false,
    features: "",
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  async function fetchVehicles() {
    try {
      setLoading(true);
      const data = (await VehiclesApi.list()) as Vehicle[];
      setVehicles(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  }

  function openModal(vehicle?: Vehicle) {
    if (vehicle) {
      setEditingId(vehicle.id);
      setFormData({
        slug: vehicle.slug,
        name: vehicle.name,
        icon: vehicle.icon,
        tagline: vehicle.tagline,
        description: vehicle.description,
        pricePerDay: vehicle.pricePerDay.toString(),
        passengers: vehicle.passengers,
        luggage: vehicle.luggage,
        hasAC: vehicle.hasAC,
        features: vehicle.features,
      });
    } else {
      setEditingId(null);
      setFormData({
        slug: "",
        name: "",
        icon: "",
        tagline: "",
        description: "",
        pricePerDay: "",
        passengers: "",
        luggage: "",
        hasAC: false,
        features: "",
      });
    }
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dto = {
        slug: formData.slug,
        name: formData.name,
        icon: formData.icon,
        tagline: formData.tagline,
        description: formData.description,
        pricePerDay: parseFloat(formData.pricePerDay),
        passengers: formData.passengers,
        luggage: formData.luggage,
        hasAC: formData.hasAC,
        features: formData.features,
      };

      if (editingId) {
        await AdminVehiclesApi.update(editingId, dto);
      } else {
        await AdminVehiclesApi.create(dto);
      }

      setIsModalOpen(false);
      await fetchVehicles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save vehicle");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this vehicle?")) return;
    try {
      await AdminVehiclesApi.delete(id);
      await fetchVehicles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete vehicle");
    }
  }

  if (loading) return <div className="text-center py-8">Loading vehicles...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">Vehicles</h3>
        <button
          onClick={() => openModal()}
          className="px-3 py-1 bg-[var(--brand)] text-white rounded text-sm hover:opacity-90"
        >
          + Add Vehicle
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-900 rounded text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-2 px-3">Name</th>
              <th className="text-left py-2 px-3">Price/Day</th>
              <th className="text-left py-2 px-3">Passengers</th>
              <th className="text-left py-2 px-3">AC</th>
              <th className="text-left py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="border-b border-[var(--border)] hover:bg-[var(--surface)]">
                <td className="py-2 px-3">{vehicle.name}</td>
                <td className="py-2 px-3">${vehicle.pricePerDay}</td>
                <td className="py-2 px-3">{vehicle.passengers}</td>
                <td className="py-2 px-3">{vehicle.hasAC ? "Yes" : "No"}</td>
                <td className="py-2 px-3 space-x-2">
                  <button
                    onClick={() => openModal(vehicle)}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle.id)}
                    className="text-red-600 hover:underline text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminModal
        isOpen={isModalOpen}
        title={editingId ? "Edit Vehicle" : "Add New Vehicle"}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      >
        <div>
          <label className="block text-sm font-semibold mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Slug</label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded"
            placeholder="e.g., sedan, van-7-seater"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Icon</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border)] rounded"
              placeholder="e.g., 🚗"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Price/Day ($)</label>
            <input
              type="number"
              value={formData.pricePerDay}
              onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border)] rounded"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Tagline</label>
          <input
            type="text"
            value={formData.tagline}
            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded"
            placeholder="e.g., Comfort in every journey"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Passengers</label>
            <input
              type="text"
              value={formData.passengers}
              onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border)] rounded"
              placeholder="e.g., 4 seats"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Luggage</label>
            <input
              type="text"
              value={formData.luggage}
              onChange={(e) => setFormData({ ...formData, luggage: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border)] rounded"
              placeholder="e.g., 2 large bags"
              required
            />
          </div>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="hasAC"
            checked={formData.hasAC}
            onChange={(e) => setFormData({ ...formData, hasAC: e.target.checked })}
            className="mr-2"
          />
          <label htmlFor="hasAC" className="text-sm font-semibold">
            Has Air Conditioning
          </label>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Features (comma-separated)</label>
          <input
            type="text"
            value={formData.features}
            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded"
            placeholder="e.g., Bluetooth, Navigation, USB charger"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded"
            rows={3}
            required
          />
        </div>
      </AdminModal>
    </div>
  );
}
