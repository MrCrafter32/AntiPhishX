import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { ObjectId } from "mongodb";
import { getUserId} from "@/lib/getUser";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    console.log("Session:", session);
    const userId = await getUserId();


    const response = await fetch(
        `http://mrcrafter.tech:3000/api/imap/fetch-inbox?sessionId=${userId}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userId}`,
            },
        }
    );

    const mails = await response.json();

    return (
        <div className="flex flex-col h-screen bg-white text-black">
            {/* Header */}
            <div className="h-16 border-b border-gray-200 flex items-center px-6 bg-white shadow-sm">
                <h1 className="text-2xl font-semibold text-black">Inbox</h1>
            </div>

            {/* Main Content */}
            <div className="flex flex-grow">
                {/* Mail List */}
                <div className="w-4/5 h-full overflow-y-auto px-4 py-2">
                    <table className="w-full table-auto">
                        <tbody>
                            {mails.map((mail) => (
                                <Link
                                    key={mail.id}
                                    href={`/mail/${mail.id}`}
                                    className="table-row hover:bg-gray-100 border-b border-gray-100 cursor-pointer"
                                >
                                    <td className="px-4 py-3 font-semibold text-sm w-1/4">{mail.from}</td>
                                    <td className="px-4 py-3 font-bold text-sm w-1/3">{mail.subject}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500 w-2/5">{mail.date}</td>
                                </Link>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Right Sidebar */}
                <div className="w-1/5 border-l border-gray-200 p-4 flex flex-col items-center justify-start text-sm">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mb-4" />
                    <div className="text-md font-bold mb-1 text-center">{session.user.email}</div>
                </div>
            </div>
        </div>
    );
}
