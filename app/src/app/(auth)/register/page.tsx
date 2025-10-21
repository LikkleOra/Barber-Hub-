"use client";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    const raw = Object.fromEntries(formData.entries());
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      setError("Invalid input");
      return;
    }
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    if (!res.ok) {
      const msg = await res.text();
      setError(msg || "Registration failed");
      return;
    }
    setSuccess("Registered. You can now sign in.");
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Create your account</h1>
      <form action={onSubmit} className="space-y-3">
        <input name="name" placeholder="Name" className="input input-bordered w-full p-2 border rounded" />
        <input name="email" type="email" placeholder="Email" className="input input-bordered w-full p-2 border rounded" />
        <input name="password" type="password" placeholder="Password" className="input input-bordered w-full p-2 border rounded" />
        <button className="btn btn-primary bg-black text-white px-4 py-2 rounded" type="submit">Register</button>
      </form>
      {error && <p className="text-red-600 mt-2">{error}</p>}
      {success && <p className="text-green-600 mt-2">{success}</p>}
    </div>
  );
}

