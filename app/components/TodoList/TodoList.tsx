"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GRAPHQL_API = "/api/graphql";

interface Todo {
  id: string;
  task: string;
  completed: boolean;
  priority: number;
  description?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  assignedTo?: string;
  category?: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState(1);
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [category, setCategory] = useState("");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [error, setError] = useState<{ message?: string }>({});

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const query = `
      {
        todos {
          id task completed priority description dueDate tags assignedTo category createdAt updatedAt
        }
      }
    `;
    try {
      const res = await axios.post(GRAPHQL_API, { query });
      setTodos(res.data.data.todos);
    } catch (error) {
      console.error("Error fetching todos:", error);
      setError({ message: "Failed to fetch todos" });
    }
  };

  const saveTodo = async () => {
    if (!task.trim()) {
      setError({ message: "Task name is required" });
      return;
    }

    const mutation = editingTodo
      ? `mutation { updateTodo(id: "${editingTodo.id}", task: "${task}", priority: ${priority}, description: "${description}", dueDate: "${dueDate}", tags: ${JSON.stringify(tags.split(","))}, assignedTo: "${assignedTo}", category: "${category}") { id task priority description dueDate tags assignedTo category } }`
      : `mutation { addTodo(task: "${task}", priority: ${priority}, description: "${description}", dueDate: "${dueDate}", tags: ${JSON.stringify(tags.split(","))}, assignedTo: "${assignedTo}", category: "${category}") { id task priority description dueDate tags assignedTo category } }`;

    try {
      await axios.post(GRAPHQL_API, { query: mutation });
      setEditingTodo(null);
      setTask("");
      setPriority(1);
      setDescription("");
      setDueDate("");
      setTags("");
      setAssignedTo("");
      setCategory("");
      setError({});
      fetchTodos();
      toast.success(editingTodo ? "Updated Successfully" : "Added Successfully");
    } catch (error) {
      console.error("Error saving todo:", error);
      setError({ message: "Failed to save todo" });
      toast.error("Failed to save todo");
    }
  };

  const editTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setTask(todo.task);
    setPriority(todo.priority);
    setDescription(todo.description || "");
    setDueDate(todo.dueDate || "");
    setTags(todo.tags.join(","));
    setAssignedTo(todo.assignedTo || "");
    setCategory(todo.category || "");
  };

  const deleteTodo = async (id: string) => {
    const mutation = `mutation { deleteTodo(id: "${id}") }`;
    try {
      await axios.post(GRAPHQL_API, { query: mutation });
      fetchTodos();
      toast.success("Deleted Successfully");
    } catch (error) {
      console.error("Error deleting todo:", error);
      setError({ message: "Failed to delete todo" });
      toast.error("Failed to delete todo");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Todo List</h2>
      <div className="space-y-3">
        <input className="w-full p-2 border rounded" type="text" value={task} onChange={(e) => setTask(e.target.value)} placeholder="Task Name" />
        <input className="w-full p-2 border rounded" type="number" value={priority} onChange={(e) => setPriority(Number(e.target.value))} placeholder="Priority (1-5)" />
        <input className="w-full p-2 border rounded" type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
        <input className="w-full p-2 border rounded" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <input className="w-full p-2 border rounded" type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma-separated)" />
        <input className="w-full p-2 border rounded" type="text" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="Assigned To" />
        <input className="w-full p-2 border rounded" type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
        {error?.message && <p className="text-red-500">{error.message}</p>}
        <button className="w-full bg-blue-500 text-white p-2 rounded" onClick={saveTodo}>{editingTodo ? "Update Todo" : "Add Todo"}</button>
      </div>

      <ul className="mt-6 space-y-3">
        {todos.map((todo) => (
          <li key={todo.id} className="p-4 bg-white shadow-md rounded flex justify-between items-center">
            <div>
              <p className="font-semibold">{todo.task}</p>
              <p className="text-sm text-gray-600">Priority: {todo.priority}</p>
            </div>
            <div className="space-x-2">
              <button className="px-3 py-1 bg-yellow-400 text-white rounded" onClick={() => editTodo(todo)}>Edit</button>
              <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={() => deleteTodo(todo.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
