// components/StudentCard.tsx
// Displays one student's info in a card layout.
// Receives student data and callback functions as props.

import Image from "next/image";
import Link from "next/link";

// Type definition for a student object
export interface Student {
  id: number;
  fullName: string;
  email: string;
  department: string;
  academicYear: number;
  profilePic?: string | null;
}

interface Props {
  student: Student;
  onDelete: (id: number) => void; // called when delete button is clicked
}

export default function StudentCard({ student, onDelete }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 flex flex-col gap-3">
      {/* Profile picture or a placeholder avatar */}
      <div className="flex items-center gap-4">
        {student.profilePic ? (
          <Image
            src={student.profilePic}
            alt={student.fullName}
            width={64}
            height={64}
            className="rounded-full object-cover w-16 h-16 border"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
            {student.fullName.charAt(0).toUpperCase()}
          </div>
        )}

        <div>
          <h2 className="font-semibold text-lg">{student.fullName}</h2>
          <p className="text-sm text-gray-500">{student.email}</p>
        </div>
      </div>

      {/* Student details */}
      <div className="text-sm text-gray-600 space-y-1">
        <p><span className="font-medium">Department:</span> {student.department}</p>
        <p><span className="font-medium">Year:</span> {student.academicYear}</p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-auto">
        <Link
          href={`/students/edit/${student.id}`}
          className="flex-1 text-center bg-yellow-400 hover:bg-yellow-500 text-white text-sm py-1.5 rounded-lg transition"
        >
          Edit
        </Link>
        <button
          onClick={() => onDelete(student.id)}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-1.5 rounded-lg transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
