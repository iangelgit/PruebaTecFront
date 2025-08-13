import { useState, useEffect } from "react";
import "./App.css";

interface Product {
  id: number;
  name: string;
  price: number;
}

const API_BASE = "https://pruebatecback.onrender.com";

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [budget, setBudget] = useState(150);
  const [bestCombo, setBestCombo] = useState<Product[]>([]);

  // Obtener productos
  useEffect(() => {
    fetch(`${API_BASE}/productos`)
      .then(res => res.json())
      .then(data => setProducts(data));

    fetchCart();
  }, []);

  // Traer carrito
  const fetchCart = () => {
    fetch(`${API_BASE}/carrito`)
      .then(res => res.json())
      .then(data => setCart(data.cart || [])); // <- aquí aseguramos que siempre sea array
  };

  // Agregar producto al carrito
  const addToCart = (id: number) => {
    fetch(`${API_BASE}/carrito`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).then(() => fetchCart());
  };

  // Función para la mejor combinación
  const findBestCombination = (items: Product[], maxBudget: number): Product[] => {
    let best: Product[] = [];
    const n = items.length;

    const helper = (index: number, current: Product[], total: number) => {
      if (total > maxBudget) return;
      if (total > best.reduce((sum, p) => sum + p.price, 0)) best = [...current];
      for (let i = index; i < n; i++) helper(i + 1, [...current, items[i]], total + items[i].price);
    };

    helper(0, [], 0);
    return best;
  };

  // Actualizar mejor combinación
  useEffect(() => {
    setBestCombo(findBestCombination(products, budget));
  }, [products, budget]);

  return (
    <div className="p-4">
      <h1>Productos</h1>
      <ul>
        {products.map(p => (
          <li key={p.id}>
            {p.name} - ${p.price}{" "}
            <button onClick={() => addToCart(p.id)}>Agregar al carrito</button>
          </li>
        ))}
      </ul>

      <h2>Carrito</h2>
      <ul>{cart.map((p, idx) => <li key={idx}>{p.name} - ${p.price}</li>)}</ul>

      <h2>Mejor combinación (presupuesto {budget})</h2>
      <ul>
        {bestCombo.map(p => <li key={p.id}>{p.name} - ${p.price}</li>)}
        <li><strong>Total: ${bestCombo.reduce((sum, p) => sum + p.price, 0)}</strong></li>
      </ul>
    </div>
  );
}

export default App;
