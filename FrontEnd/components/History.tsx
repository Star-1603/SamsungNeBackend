import { useSession } from "next-auth/react";
import { useState } from "react";

interface QueryHistory {
  query: string;
  createdAt: string;
}

export default function History() {
  const { data: session } = useSession();
  const [history, setHistory] = useState<QueryHistory[]>([]);

  const fetchHistory = async () => {
    const res = await fetch("/api/history");
    const data = await res.json();
    setHistory(data);
  };

  return (
    <div className="p-4">
      {session ? (
        <>
          <p>Welcome, {session.user?.name}</p>
          <button onClick={fetchHistory} className="mt-4 p-2 bg-blue-500 text-white">
            Fetch Query History
          </button>
          <ul className="mt-4">
            {history.map((item, index) => (
              <li key={index} className="mt-2">
                <strong>Query:</strong> {item.query} <br />
                <small>Created At: {new Date(item.createdAt).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Please sign in to view your query history</p>
      )}
    </div>
  );
}
