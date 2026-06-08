"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed";
  createdAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch tasks");
        }

        const data = await res.json();
        setTasks(data.tasks);
      } catch (err) {
        setError("Could not load tasks.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [router]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create task");
        return;
      }

      setTasks((prev) => [...prev, data.task]);
      setTitle("");
      setDescription("");
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading dashboard...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between rounded-lg bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Your Dashboard</h1>
          <button
            onClick={handleLogout}
            className="rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
          >
            Log out
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm md:col-span-1 h-fit">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              New Task
            </h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full text-black rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  className="mt-1 block w-full text-black rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Create Task
              </button>
            </form>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Your Tasks
            </h2>
            {tasks.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No tasks found. Create one to get started!
              </p>
            ) : (
              <ul className="space-y-3">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="rounded-md border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="mt-1 text-sm text-gray-500">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
