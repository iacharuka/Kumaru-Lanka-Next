"use client";

import { useEffect, useState } from "react";
import { AdminModal } from "./AdminModal";
import { ToursApi, AdminToursApi, Tour, ApiError } from "@/lib/api";

export function ToursManagement() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    duration: "",
    paxRange: "",
    accommodation: "",
    price: "",
    description: "",
    tags: "",
    highlights: "",
    includes: "",
  });

  useEffect(() => {
    fetchTours();
  }, []);

  async function fetchTours() {
    try {
      setLoading(true);
      const data = await ToursApi.list();
      setTours(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tours");
    } finally {
      setLoading(false);
    }
  }

  function openModal(tour?: Tour) {
    if (tour) {
      setEditingId(tour.id);
      setFormData({
        title: tour.title,
        category: tour.category,
        duration: tour.duration,
        paxRange: tour.paxRange,
        accommodation: tour.accommodation,
        price: tour.price.toString(),
        description: tour.description,
        tags: tour.tags.join(", "),
        highlights: tour.highlights.join(", "),
        includes: tour.includes.join(", "),
      });
      setImagePreview(tour.imageUrl);
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        category: "",
        duration: "",
        paxRange: "",
        accommodation: "",
        price: "",
        description: "",
        tags: "",
        highlights: "",
        includes: "",
      });
      setImagePreview(null);
    }
    setSelectedImage(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dto = {
        title: formData.title,
        category: formData.category,
        duration: formData.duration,
        paxRange: formData.paxRange,
        accommodation: formData.accommodation,
        price: parseFloat(formData.price),
        description: formData.description,
        tags: formData.tags.split(",").map((t) => t.trim()),
        highlights: formData.highlights.split(",").map((h) => h.trim()),
        includes: formData.includes.split(",").map((i) => i.trim()),
      };

      if (editingId) {
        await AdminToursApi.update(editingId, dto, selectedImage || undefined);
      } else {
        await AdminToursApi.create(dto, selectedImage || undefined);
      }

      setIsModalOpen(false);
      await fetchTours();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save tour");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this tour?")) return;
    try {
      await AdminToursApi.delete(id);
      await fetchTours();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete tour");
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  if (loading) return <div className="text-center py-8">Loading tours...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">Tours</h3>
        <button
          onClick={() => openModal()}
          className="px-3 py-1 bg-[var(--brand)] text-white rounded text-sm hover:opacity-90"
        >
          + Add Tour
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
              <th className="text-left py-2 px-3">Title</th>
              <th className="text-left py-2 px-3">Category</th>
              <th className="text-left py-2 px-3">Price</th>
              <th className="text-left py-2 px-3">Duration</th>
              <th className="text-left py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tours.map((tour) => (
              <tr key={tour.id} className="border-b border-[var(--border)] hover:bg-[var(--surface)]">
                <td className="py-2 px-3">{tour.title}</td>
                <td className="py-2 px-3">{tour.category}</td>
                <td className="py-2 px-3">${tour.price}</td>
                <td className="py-2 px-3">{tour.duration}</td>
                <td className="py-2 px-3 space-x-2">
                  <button
                    onClick={() => openModal(tour)}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tour.id)}
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
        title={editingId ? "Edit Tour" : "Add New Tour"}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      >
        <div>
          <label className="block text-sm font-semibold mb-1">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border)] rounded"
              placeholder="e.g., Cultural, Adventure"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Duration</label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border)] rounded"
              placeholder="e.g., 3 Days / 2 Nights"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Pax Range</label>
            <input
              type="text"
              value={formData.paxRange}
              onChange={(e) => setFormData({ ...formData, paxRange: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border)] rounded"
              placeholder="e.g., 2-6 persons"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Price ($)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border)] rounded"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Accommodation</label>
          <input
            type="text"
            value={formData.accommodation}
            onChange={(e) => setFormData({ ...formData, accommodation: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded"
            placeholder="e.g., 3-star, 4-star"
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
        <div>
          <label className="block text-sm font-semibold mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded"
            placeholder="e.g., hiking, nature, adventure"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Highlights (comma-separated)</label>
          <input
            type="text"
            value={formData.highlights}
            onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded"
            placeholder="e.g., Ancient temples, Mountain views"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Includes (comma-separated)</label>
          <input
            type="text"
            value={formData.includes}
            onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded"
            placeholder="e.g., Meals, Guide, Transport"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Image</label>
          {imagePreview && (
            <div className="mb-3">
              <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-[var(--border)] rounded"
          />
        </div>
      </AdminModal>
    </div>
  );
}
