"use client";

import { useRouter } from "next/navigation";

export default function InboxTable({ mails }) {
  const router = useRouter();

  return (
    <div className="h-full overflow-y-auto">
      <table className="w-full table-auto text-white">
        <tbody>
          {mails.map((mail) => (
            <tr
              key={mail.id}
              onClick={() => router.push(`/mail/${mail.id}`)}
              className="hover:bg-[#2a2a2a] cursor-pointer border-b border-gray-700 transition-colors duration-200"
            >
              <td className="px-4 py-3 w-1/4">
                <div className="font-semibold text-sm">
                  {mail.from || "Unknown Sender"}
                </div>
              </td>
              <td className="px-4 py-3 w-2/4">
                <div className="font-bold text-sm">
                  {mail.subject || "No Subject"}
                </div>
                <div className="text-xs text-gray-400 truncate max-w-xs">
                  {mail.preview || "No preview available."}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-400 w-1/4 text-right">
                {formatDate(mail.date)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
