import { useState, useEffect } from "react";
import "./App.css";

interface Product {
  id: number;
  name: string;
  price: number;
  quantity?: number;
}

const API_BASE = "https://pruebatecback.onrender.com";

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [budget] = useState(150);
  const [bestCombo, setBestCombo] = useState<Product[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/productos`)
      .then(res => res.json())
      .then(data => setProducts(data));

    fetchCart();
  }, []);

  const fetchCart = () => {
    fetch(`${API_BASE}/carrito`)
      .then(res => res.json())
      .then(data => setCart(data.cart || []));
  };

  const addToCart = (id: number) => {
    fetch(`${API_BASE}/carrito`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: id }),
    })
      .then(res => res.json())
      .then(data => setCart(data.cart || []));
  };

  const removeOneFromCart = (id: number) => {
    fetch(`${API_BASE}/carrito/${id}`, { method: "DELETE" })
      .then(res => res.json())
      .then(data => setCart(data.cart || []));
  };

  const removeAllFromCart = (id: number) => {
    fetch(`${API_BASE}/carrito/${id}?all=true`, { method: "DELETE" })
      .then(res => res.json())
      .then(data => setCart(data.cart || []));
  };

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

  useEffect(() => {
    setBestCombo(findBestCombination(products, budget));
  }, [products, budget]);

return (
  <div className="container">
    <section>
      <h1>Productos</h1>
      <ul>
        {products.map(p => (
          <li key={p.id}>
            {p.name} - ${p.price}
            <button onClick={() => addToCart(p.id)}>Agregar</button>
          </li>
        ))}
      </ul>
    </section>

    <section>
      <h2>Carrito</h2>
      <ul>
        {cart.map(p => (
          <li key={p.id}>
            {p.name} - ${p.price} x{p.quantity}
            <span>
              <button onClick={() => removeOneFromCart(p.id)}>Quitar 1</button>
              <button onClick={() => removeAllFromCart(p.id)}>Quitar todo</button>
            </span>
          </li>
        ))}
      </ul>
    </section>

    <section>
      <h2>Mejor combinación</h2>
      <ul>
        {bestCombo.map(p => (
          <li key={p.id}>
            {p.name} - ${p.price}
          </li>
        ))}
        <li><strong>Total: ${bestCombo.reduce((sum, p) => sum + p.price, 0)}</strong></li>
      </ul>
    </section>
  </div>
);

}

export default App;
