import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getGoogleInbox } from "@/api";

// Define the email structure
interface Email {
    id: string;
    subject: string;
    from: string;
    snippet: string;
    body: string;
}

const GmailInbox: React.FC = () => {
    const [emails, setEmails] = useState<Email[]>([]); // Ensure it's always an array
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchEmails = async () => {
            try {
                const userData: Email[] = await getGoogleInbox();
                setEmails(userData || []); // Fallback to empty array
            } catch (err) {
                setError("Failed to load emails. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchEmails();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100">
            <h1 className="text-3xl font-bold mb-6">📩 Your Inbox</h1>

            {loading && <p className="text-gray-600">Fetching emails...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <div className="w-full max-w-3xl space-y-6">
                {emails?.length > 0 ? (
                    emails.map((email) => (
                        <Card key={email.id} className="p-5 shadow-lg bg-white rounded-lg">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold text-gray-900">
                                    {email.subject || "(No Subject)"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-500 text-sm mb-1">
                                    From: <span className="font-medium text-gray-700">{email.from}</span>
                                </p>
                                <p className="text-gray-700 mt-2 text-sm">{email.snippet}</p>
                                <details className="mt-3 cursor-pointer">
                                    <summary className="text-blue-500 font-medium hover:underline">
                                        View Full Email
                                    </summary>
                                    <p className="text-gray-600 mt-2 text-sm whitespace-pre-line border-l-4 border-gray-300 pl-3">
                                        {email.body}
                                    </p>
                                </details>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    !loading && <p className="text-gray-500">No emails found.</p>
                )}
            </div>

            <Button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 text-lg">
                Refresh Inbox
            </Button>
        </div>
    );
};

export default GmailInbox;
