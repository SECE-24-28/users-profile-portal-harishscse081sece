"use client";
// app/students/page.tsx
// Dashboard — shows all student profiles fetched from GraphQL.
// Allows navigating to add/edit pages and deleting students.

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StudentCard, { Student } from "@/components/StudentCard";

// GraphQL query to fetch all students
const STUDENTS_QUERY = `
  query {
    students {
      id fullName email department academicYear profilePic
    }
  }
`;

// GraphQL mutation to delete a student
const DELETE_MUTATION = `
  mutation DeleteStudent($id: Int!) {
    deleteStudent(id: $id)
  }
`;

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // useCallback keeps `gql` stable so it's safe to use in useEffect deps
  const gql = useCallback(async (query: string, variables = {}) => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables }),
    });
    return res.json();
  }, []); // fetch and localStorage are stable — no deps needed

  // Fetch students on page load; redirect to login if not authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    gql(STUDENTS_QUERY).then((json) => {
      if (json.errors) {
        // Token invalid or expired — send back to login
        router.push("/login");
        return;
      }
      setStudents(json.data.students);
      setLoading(false); // always reached on success
    }).catch(() => {
      // Network or parse error — stop loading and show empty state
      setLoading(false);
    });
  }, [gql, router]); // include all referenced stable references

  // Delete a student by id and remove it from local state
  async function handleDelete(id: number) {
    if (!confirm("Delete this student?")) return;
    const json = await gql(DELETE_MUTATION, { id });
    // Only update UI if delete actually succeeded
    if (!json.errors) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Student Profiles</h1>
        <div className="flex gap-3">
          <Link
            href="/students/add"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
          >
            + Add Student
          </Link>
          <button
            onClick={handleLogout}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && <p className="text-gray-500">Loading students...</p>}

      {/* Empty state — only shown after loading finishes */}
      {!loading && students.length === 0 && (
        <p className="text-gray-400 text-center mt-20">
          No students yet.{" "}
          <Link href="/students/add" className="text-blue-600 underline">
            Add one!
          </Link>
        </p>
      )}

      {/* Student cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {students.map((s) => (
          <StudentCard key={s.id} student={s} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
