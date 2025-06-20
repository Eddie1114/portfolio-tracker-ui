import { useEffect, useState } from "react";

interface PortfolioItem {
  id: string;
  asset: string;
  quantity: number;
  purchasePrice: number;
  currentValue?: number;
  gainLoss?: number;
}

export default function Home() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ asset: "", quantity: "", price: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch portfolio data
  useEffect(() => {
    async function fetchPortfolio() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/portfolio");
        const result = await res.json();
        setPortfolio(Array.isArray(result) ? result : []);
      } catch {
        setError("Failed to load portfolio");
      } finally {
        setLoading(false);
      }
    }
    fetchPortfolio();
  }, []);

  // Handle form input changes
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset: form.asset,
          quantity: Number(form.quantity),
          purchasePrice: Number(form.price),
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to add asset");
      }
      setForm({ asset: "", quantity: "", price: "" });
      // Re-fetch portfolio
      const updatedRes = await fetch("/api/portfolio");
      const updatedData = await updatedRes.json();
      setPortfolio(Array.isArray(updatedData) ? updatedData : []);
    } catch {
      setError("Failed to add asset");
    } finally {
      setSubmitting(false);
    }
  }

  // Calculate summary
  const totalValue = portfolio.reduce((sum, item) => sum + (item.currentValue ?? 0), 0);
  const totalGainLoss = portfolio.reduce((sum, item) => sum + (item.gainLoss ?? 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Portfolio Tracker
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Portfolio Summary */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">${totalValue.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Total Gain/Loss</p>
              <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                {totalGainLoss >= 0 ? "+" : ""}${totalGainLoss.toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Number of Assets</p>
              <p className="text-2xl font-bold text-gray-900">{portfolio.length}</p>
            </div>
          </div>
        </div>

        {/* Add New Asset Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Asset</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="asset" className="block text-sm font-medium text-gray-700">
                Asset Name
              </label>
              <input
                type="text"
                name="asset"
                id="asset"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter asset name"
                value={form.asset}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                id="quantity"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter quantity"
                value={form.quantity}
                onChange={handleChange}
                required
                min={0}
                step="any"
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Purchase Price
              </label>
              <input
                type="number"
                name="price"
                id="price"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter purchase price"
                value={form.price}
                onChange={handleChange}
                required
                min={0}
              />
            </div>
            <div className="md:flex md:items-end">
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                disabled={submitting}
              >
                {submitting ? "Adding..." : "Add Asset"}
              </button>
            </div>
          </form>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>

        {/* Portfolio List */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Portfolio</h2>
          {loading ? (
            <p>Loading...</p>
          ) : portfolio.length === 0 ? (
            <p>No assets yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purchase Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gain/Loss
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {portfolio.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.asset}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.purchasePrice.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.currentValue !== undefined ? `$${item.currentValue.toFixed(2)}` : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.gainLoss !== undefined ? `${item.gainLoss >= 0 ? '+' : ''}${item.gainLoss.toFixed(2)}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
