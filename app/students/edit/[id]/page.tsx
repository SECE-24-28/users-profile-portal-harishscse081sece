"use client";
// app/students/edit/[id]/page.tsx
// Edit page — loads the existing student data, then lets the user update it.
// [id] in the folder name makes `id` a dynamic URL parameter.

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StudentForm, { StudentFormData } from "@/components/StudentForm";
import { Student } from "@/components/StudentCard";

// GraphQL query to fetch a single student by id
const STUDENT_QUERY = `
  query GetStudent($id: Int!) {
    student(id: $id) {
      id fullName email department academicYear profilePic
    }
  }
`;

// GraphQL mutation to update a student's fields
const UPDATE_MUTATION = `
  mutation UpdateStudent(
    $id: Int!
    $fullName: String
    $email: String
    $department: String
    $academicYear: Int
    $profilePic: String
  ) {
    updateStudent(
      id: $id
      fullName: $fullName
      email: $email
      department: $department
      academicYear: $academicYear
      profilePic: $profilePic
    ) {
      id
    }
  }
`;

export default function EditStudentPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);

  // useCallback keeps `gql` stable across renders so useEffect deps are correct
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
  }, []); // no external deps — fetch and localStorage are stable

  // Load existing student data when the page mounts or id changes
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
      return;
    }
    gql(STUDENT_QUERY, { id: Number(id) }).then((json) => {
      // If the student doesn't exist or request fails, go back to list
      if (json.errors || !json.data?.student) {
        router.push("/students");
        return;
      }
      setStudent(json.data.student);
    });
  }, [id, gql, router]); // all referenced variables listed as deps

  // Called by StudentForm on submit
  async function handleUpdate(data: StudentFormData) {
    const json = await gql(UPDATE_MUTATION, {
      id: Number(id),
      ...data,
      profilePic: data.profilePic || null,
    });
    if (json.errors) throw new Error(json.errors[0].message);
  }

  // Show loading state while fetching student
  if (!student) {
    return <p className="p-8 text-gray-400">Loading...</p>;
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-blue-700 mb-6">Edit Student</h1>
      <StudentForm
        initial={student}
        onSubmit={handleUpdate}
        submitLabel="Save Changes"
      />
    </div>
  );
}
