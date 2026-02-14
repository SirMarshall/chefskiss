"use client";
import { useState } from "react";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dietaryRestrictions: "",
    allergens: "",
    favorites: "",
    spiceLevel: "medium",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      preferences: {
        dietaryRestrictions: formData.dietaryRestrictions.split(",").map(s => s.trim()).filter(s => s !== ""),
        allergens: formData.allergens.split(",").map(s => s.trim()).filter(s => s !== ""),
        favorites: formData.favorites.split(",").map(s => s.trim()).filter(s => s !== ""),
        spiceLevel: formData.spiceLevel,
      }
    };

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) alert("Account created in the digital kitchen.");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[#f8f8f8]">
      <div className="absolute inset-0 z-0 opacity-[0.03]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 38.59V0h39.59L40 0.41v39.18L39.59 40H0.41L0 39.59zM1 1h38v38H1V1z'/%3E%3C/g%3E%3C/svg%3E")` }}>
      </div>

      <div className="relative z-10 w-full max-w-lg p-10 mx-4 bg-white/70 backdrop-blur-md border border-white shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] rounded-none">

        <div className="mb-10 text-left border-b border-black/5 pb-6">
          <span className="material-symbols-outlined text-4xl text-black font-light">skillet</span>
          <h1 className="text-2xl font-bold uppercase tracking-widest mt-2 text-black">New Account</h1>
          <p className="text-gray-500 text-xs tracking-tight uppercase">Meal Plan AI // System v1.0</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Full Name</label>
              <input
                required
                className="bg-transparent border-b border-black/10 py-2 focus:outline-none focus:border-black transition-colors text-sm"
                placeholder="Chef's Name"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Email Address</label>
              <input
                required
                type="email"
                className="bg-transparent border-b border-black/10 py-2 focus:outline-none focus:border-black transition-colors text-sm"
                placeholder="kitchen@ai.com"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 italic">Dietary Restrictions</label>
              <input
                className="bg-transparent border-b border-black/10 py-2 focus:outline-none focus:border-black transition-colors text-sm italic"
                placeholder="Vegan, Keto..."
                onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Allergens</label>
              <input
                className="bg-transparent border-b border-black/10 py-2 focus:outline-none focus:border-black transition-colors text-sm"
                placeholder="Nuts, Dairy..."
                onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Favorite Ingredients / Meals</label>
            <input
              className="bg-transparent border-b border-black/10 py-2 focus:outline-none focus:border-black transition-colors text-sm"
              placeholder="Pasta, Avocado, Spicy Tuna..."
              onChange={(e) => setFormData({ ...formData, favorites: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Spice Tolerance</label>
            <div className="flex gap-4">
              {['mild', 'medium', 'hot'].map((level) => (
                <label key={level} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="spiceLevel"
                    value={level}
                    checked={formData.spiceLevel === level}
                    onChange={(e) => setFormData({ ...formData, spiceLevel: e.target.value })}
                    className="hidden"
                  />
                  <span className={`w-3 h-3 rounded-full border border-black flex items-center justify-center ${formData.spiceLevel === level ? 'bg-black' : 'bg-transparent'}`}></span>
                  <span className={`text-xs uppercase tracking-tighter ${formData.spiceLevel === level ? 'text-black font-bold' : 'text-gray-400'}`}>
                    {level}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-[11px] uppercase tracking-[0.3em] font-bold py-4 mt-6 hover:bg-gray-800 transition-all active:scale-[0.99] disabled:bg-gray-400"
          >
            {loading ? "INITIALIZING..." : "START MEAL ENGINE"}
          </button>
        </form>
      </div>

      <div className="absolute bottom-10 right-10 opacity-10 pointer-events-none">
        <span className="material-symbols-outlined text-[120px]">restaurant_menu</span>
      </div>
    </div>
  );
}