"use client";
// app/students/add/page.tsx
// Page to create a new student profile using GraphQL mutation.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import StudentForm, { StudentFormData } from "@/components/StudentForm";

// GraphQL mutation to create a new student
const CREATE_MUTATION = `
  mutation CreateStudent(
    $fullName: String!
    $email: String!
    $department: String!
    $academicYear: Int!
    $profilePic: String
  ) {
    createStudent(
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

export default function AddStudentPage() {
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!localStorage.getItem("token")) router.push("/login");
  }, [router]);

  // Called by StudentForm when the user submits the form
  async function handleCreate(data: StudentFormData) {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: CREATE_MUTATION,
        variables: {
          ...data,
          // Send null instead of empty string if no picture URL given
          profilePic: data.profilePic || null,
        },
      }),
    });
    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].message);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-blue-700 mb-6">Add New Student</h1>
      <StudentForm onSubmit={handleCreate} submitLabel="Create Student" />
    </div>
  );
}
