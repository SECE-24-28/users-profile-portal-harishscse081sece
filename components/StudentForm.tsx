"use client";
// components/StudentForm.tsx
// Reusable form for creating or editing a student profile.
// Used by both /students/add and /students/edit/[id] pages.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Student } from "./StudentCard";

// Renamed from FormData → StudentFormData to avoid collision with
// the global browser FormData Web API type.
export interface StudentFormData {
  fullName: string;
  email: string;
  department: string;
  academicYear: number;
  profilePic: string;
}

interface Props {
  // If `initial` is provided, the form pre-fills with existing student data (edit mode)
  initial?: Partial<Student>;
  onSubmit: (data: StudentFormData) => Promise<void>;
  submitLabel: string;
}

export default function StudentForm({ initial, onSubmit, submitLabel }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<StudentFormData>({
    fullName: initial?.fullName ?? "",
    email: initial?.email ?? "",
    department: initial?.department ?? "",
    academicYear: initial?.academicYear ?? 1,
    // profilePic can be null from DB — default to empty string for the input
    profilePic: initial?.profilePic ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Generic change handler for all text/number inputs
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "academicYear" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onSubmit(form);
      router.push("/students");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          name="fullName"
          required
          value={form.fullName}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-1">Email Address</label>
        <input
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Department */}
      <div>
        <label className="block text-sm font-medium mb-1">Department</label>
        <input
          name="department"
          required
          value={form.department}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Academic Year */}
      <div>
        <label className="block text-sm font-medium mb-1">Academic Year</label>
        <select
          name="academicYear"
          value={form.academicYear}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {[1, 2, 3, 4].map((y) => (
            <option key={y} value={y}>
              Year {y}
            </option>
          ))}
        </select>
      </div>

      {/* Profile Picture URL */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Profile Picture URL{" "}
          <span className="text-gray-400">(optional)</span>
        </label>
        <input
          name="profilePic"
          type="url"
          value={form.profilePic}
          onChange={handleChange}
          placeholder="https://example.com/photo.jpg"
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.push("/students")}
          className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
