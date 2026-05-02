"use client";

import { useEffect, useState } from "react";
import { AdminModal } from "./AdminModal";
import { DestinationsApi, AdminDestinationsApi, Destination } from "@/lib/api";

export function DestinationsManagement() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    subtitle: "",
    region: "",
    badge: "",
    imageUrl: "",
    description: "",
    bestTime: "",
    distance: "",
    type: "",
  });

  useEffect(() => {
    fetchDestinations();
  }, []);

  async function fetchDestinations() {
    try {
      setLoading(true);
      const data = await DestinationsApi.list();
      setDestinations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load destinations");
    } finally {
      setLoading(false);
    }
  }

  function openModal(destination?: Destination) {
    if (destination) {
      setEditingId(destination.id);
      setFormData({
        name: destination.name,
        subtitle: destination.subtitle,
        region: destination.region,
        badge: destination.badge || "",
        imageUrl: destination.imageUrl,
        description: destination.description,
        bestTime: destination.bestTime,
        distance: destination.distance,
        type: destination.type,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        subtitle: "",
        region: "",
        badge: "",
        imageUrl: "",
        description: "",
        bestTime: "",
        distance: "",
        type: "",
      });
    }
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dto = {
        name: formData.name,
        subtitle: formData.subtitle,
        region: formData.region,
        badge: formData.badge || undefined,
        imageUrl: formData.imageUrl,
        description: formData.description,
        bestTime: formData.bestTime,
        distance: formData.distance,
        type: formData.type,
      };

      if (editingId) {
        await AdminDestinationsApi.update(editingId, dto);
      } else {
        await AdminDestinationsApi.create(dto);
      }

      setIsModalOpen(false);
      await fetchDestinations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save destination");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this destination?")) return;
    try {
      await AdminDestinationsApi.delete(id);
      await fetchDestinations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete destination");
    }
  }

  if (loading) return <div className="text-center py-8">Loading destinations...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">Destinations</h3>
        <button
          onClick={() => openModal()}
          className="px-3 py-1 bg-[var(--brand)] text-white rounded text-sm hover:opacity-90"
        >
          + Add Destination
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
              <th className="text-left py-2 px-3">Region</th>
              <th className="text-left py-2 px-3">Type</th>
              <th className="text-left py-2 px-3">Best Time</th>
              <th className="text-left py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {destinations.map((dest) => (
              <tr key={dest.id} className="border-b border-[var(--border)] hover:bg-[var(--surface)]">
                <td className="py-2 px-3">{dest.name}</td>
                <td className="py-2 px-3">{dest.region}</td>
                <td className="py-2 px-3">{dest.type}</td>
                <td className="py-2 px-3">{dest.bestTime}</td>
                <td className="py-2 px-3 space-x-2">
                  <button
                    onClick={() => openModal(dest)}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(dest.id)}
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
        title={editingId ? "Edit Destination" : "Add New Destination"}
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
          <label className="block text-sm font-semibold mb-1">Subtitle</label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Region</label>
            <input
              type="text"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border)] rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Type</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border)] rounded"
              placeholder="e.g., Heritage, Beach"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Distance</label>
            <input
              type="text"
              value={formData.distance}
              onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border)] rounded"
              placeholder="e.g., 50 km"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Best Time</label>
            <input
              type="text"
              value={formData.bestTime}
              onChange={(e) => setFormData({ ...formData, bestTime: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border)] rounded"
              placeholder="e.g., Dec - Feb"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Badge (optional)</label>
          <input
            type="text"
            value={formData.badge}
            onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded"
            placeholder="e.g., UNESCO, Must Visit"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Image URL</label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded"
            placeholder="https://..."
            required
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
