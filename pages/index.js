import { useState, useEffect } from "react";

const TALLES = ["XS", "S", "M", "L", "XL", "XXL"];
const MODELOS = ["Camiseta Titular", "Camiseta Alternativa", "Camiseta Especial"];
const PARTIDOS = [
  { fecha: "16 Jun", rival: "Argelia", fase: "Grupos" },
  { fecha: "22 Jun", rival: "Austria", fase: "Grupos" },
  { fecha: "27 Jun", rival: "Jordania", fase: "Grupos" },
  { fecha: "1 Jul", rival: "Octavos", fase: "Octavos" },
  { fecha: "5 Jul", rival: "Cuartos", fase: "Cuartos" },
  { fecha: "14 Jul", rival: "Semifinal", fase: "Semi" },
  { fecha: "19 Jul", rival: "FINAL", fase: "Final" },
];
const initialStock = () => { const s = {}; MODELOS.forEach(m => { s[m] = {}; TALLES.forEach(t => { s[m][t] = 0; }); }); return s; };
const initialVentas = () => { const v = {}; MODELOS.forEach(m => { v[m] = {}; TALLES.forEach(t => { v[m][t] = 0; }); }); return v; };

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [stock, setStock] = useState(initialStock());
  const [ventas, setVentas] = useState(initialVentas());
  const [precios, setPrecios] = useState({ "Camiseta Titular": 18000, "Camiseta Alternativa": 16000, "Camiseta Especial": 22000 });
  const [costos, setCostos] = useState({ "Camiseta Titular": 10000, "Camiseta Alternativa": 9000, "Camiseta Especial": 13000 });
  const [ventaForm, setVentaForm] = useState({ modelo: MODELOS[0], talle: TALLES[2], cantidad: 1 });
  const [stockForm, setStockForm] = useState({ modelo: MODELOS[0], talle: TALLES[2], cantidad: 1 });
  const [toast, setToast] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("camisetas_data");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.stock) setStock(data.stock);
        if (data.ventas) setVentas(data.ventas);
        if (data.precios) setPrecios(data.precios);
        if (data.costos) setCostos(data.costos);
        if (data.historial) setHistorial(data.historial);
      }
    } catch (e) {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem("camisetas_data", JSON.stringify({ stock, ventas, precios, costos, historial })); } catch (e) {}
  }, [stock, ventas, precios, costos, historial, loaded]);

  const showToast = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500); };
  const totalStock = () => Object.values(stock).reduce((a, m) => a + Object.values(m).reduce((b, v) => b + v, 0), 0);
  const totalVendidas = () => Object.values(ventas).reduce((a, m) => a + Object.values(m).reduce((b, v) => b + v, 0), 0);
  const gananciaTotal = () => MODELOS.reduce((acc, m) => acc + Object.values(ventas[m]).reduce((a, b) => a + b, 0) * (precios[m] - costos[m]), 0);
  const ingresoTotal = () => MODELOS.reduce((acc, m) => acc + Object.values(ventas[m]).reduce((a, b) => a + b, 0) * precios[m], 0);

  const registrarVenta = () => {
    const { modelo, talle, cantidad } = ventaForm;
    const cant = parseInt(cantidad);
    if (cant <= 0) return showToast("Cantidad inválida", "err");
    if (stock[modelo][talle] < cant) return showToast("¡Sin stock suficiente!", "err");
    setStock(prev => { const n = JSON.parse(JSON.stringify(prev)); n[modelo][talle] -= cant; return n; });
    setVentas(prev => { const n = JSON.parse(JSON.stringify(prev)); n[modelo][talle] += cant; return n; });
    const now = new Date();
    setHistorial(prev => [{ modelo, talle, cant, hora: now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }), fecha: now.toLocaleDateString("es-AR"), ganancia: cant * (precios[modelo] - costos[modelo]) }, ...prev.slice(0, 49)]);
    showToast(`✓ Venta: ${cant}x ${modelo} talle ${talle}`);
  };

  const agregarStock = () => {
    const cant = parseInt(stockForm.cantidad);
    if (cant <= 0) return showToast("Cantidad inválida", "err");
    setStock(prev => { const n = JSON.parse(JSON.stringify(prev)); n[stockForm.modelo][stockForm.talle] += cant; return n; });
    showToast(`✓ Stock agregado: ${cant}x ${stockForm.modelo} ${stockForm.talle}`);
  };

  const resetearTodo = () => {
    if (!confirm("¿Seguro que querés borrar todos los datos?")) return;
    setStock(initialStock()); setVentas(initialVentas()); setHistorial([]);
    localStorage.removeItem("camisetas_data");
    showToast("Datos borrados");
  };

  const stockBajo = () => { const a = []; MODELOS.forEach(m => TALLES.forEach(t => { if (stock[m][t] > 0 && stock[m][t] <= 3) a.push(`${m} / ${t}: ${stock[m][t]} ud.`); })); return a; };
  const margen = (m) => precios[m] > 0 ? Math.round(((precios[m] - costos[m]) / precios[m]) * 100) : 0;
  const tabs = [{ id: "dashboard", label: "📊 Dashboard" }, { id: "ventas", label: "💰 Ventas" }, { id: "stock", label: "📦 Stock" }, { id: "precios", label: "🏷️ Precios" }, { id: "calendario", label: "🗓️ Partidos" }];

  return (
    <div style={{ fontFamily: "'Bebas Neue', sans-serif", background: "linear-gradient(135deg, #0a0a1a 0%, #0d1f3c 50%, #0a0a1a 100%)", minHeight: "100vh", color: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; }
        .btn { cursor: pointer; border: none; border-radius: 10px; padding: 12px 24px; font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 1px; transition: all 0.2s; }
        .btn-primary { background: linear-gradient(135deg, #43e97b, #38f9d7); color: #0a0a1a; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(67,233,123,0.4); }
        .btn-danger { background: rgba(255,80,80,0.15); color: #ff8080; border: 1px solid rgba(255,80,80,0.3); }
        .input { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; color: #fff; padding: 10px 14px; font-family: 'Barlow', sans-serif; font-size: 15px; width: 100%; outline: none; }
        .input:focus { border-color: #43e97b; }
        select.input option { background: #0d1f3c; color: #fff; }
        .label { font-family: 'Barlow', sans-serif; font-size: 12px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
        .tab-btn { cursor: pointer; background: none; border: none; color: rgba(255,255,255,0.5); font-family: 'Bebas Neue', sans-serif; font-size: 15px; letter-spacing: 1px; padding: 14px; border-bottom: 3px solid transparent; transition: all 0.2s; white-space: nowrap; }
        .tab-btn.active { color: #43e97b; border-bottom-color: #43e97b; }
        .table { width: 100%; border-collapse: collapse; font-family: 'Barlow', sans-serif; font-size: 14px; }
        .table th { color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: left; }
        .table td { padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-family: 'Barlow', sans-serif; font-weight: 600; }
        .badge-ok { background: rgba(67,233,123,0.2); color: #43e97b; }
        .badge-warn { background: rgba(255,200,60,0.2); color: #ffc83c; }
        .badge-err { background: rgba(255,80,80,0.2); color: #ff8080; }
        .toast { position: fixed; top: 20px; right: 20px; z-index: 9999; padding: 14px 22px; border-radius: 12px; font-family: 'Barlow', sans-serif; font-size: 15px; font-weight: 600; animation: slideIn 0.3s ease; }
        .toast-ok { background: linear-gradient(135deg,#43e97b,#38f9d7); color: #0a0a1a; }
        .toast-err { background: linear-gradient(135deg,#ff5050,#ff9080); color: #fff; }
        @keyframes slideIn { from { transform: translateX(60px); opacity:0; } to { transform: translateX(0); opacity:1; } }
        .saved { position: fixed; bottom: 16px; right: 16px; background: rgba(67,233,123,0.15); border: 1px solid rgba(67,233,123,0.3); border-radius: 20px; padding: 6px 14px; font-family: 'Barlow', sans-serif; font-size: 12px; color: #43e97b; }
      `}</style>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      {loaded && <div className="saved">💾 Guardado automático</div>}

      <div style={{ background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 20px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, paddingTop: 18, paddingBottom: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 36 }}>🇦🇷</span>
            <div>
              <div style={{ fontSize: 24, letterSpacing: 3 }}>GESTIÓN CAMISETAS</div>
              <div style={{ fontFamily: "Barlow", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>MUNDIAL 2026 · PANEL DE CONTROL</div>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div style={{ fontFamily: "Barlow", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Ganancia acumulada</div>
              <div style={{ fontSize: 26, color: "#43e97b" }}>$ {gananciaTotal().toLocaleString("es-AR")}</div>
            </div>
          </div>
          <div style={{ display: "flex", overflowX: "auto" }}>
            {tabs.map(t => <button key={t.id} className={`tab-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>)}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px 80px" }}>
        {tab === "dashboard" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 24 }}>
              {[{ label: "En stock", value: totalStock(), color: "#38f9d7", icon: "📦" }, { label: "Vendidas", value: totalVendidas(), color: "#43e97b", icon: "✅" }, { label: "Ingresos", value: `$${ingresoTotal().toLocaleString("es-AR")}`, color: "#ffd700", icon: "💵" }, { label: "Ganancia", value: `$${gananciaTotal().toLocaleString("es-AR")}`, color: "#43e97b", icon: "📈" }].map((s, i) => (
                <div key={i} className="card">
                  <div className="label">{s.icon} {s.label}</div>
                  <div style={{ fontSize: 36, fontFamily: "Bebas Neue", letterSpacing: 2, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
            {stockBajo().length > 0 && (
              <div className="card" style={{ marginBottom: 24, borderColor: "rgba(255,80,80,0.3)" }}>
                <div style={{ fontSize: 20, marginBottom: 12 }}>⚠️ STOCK BAJO</div>
                {stockBajo().map((a, i) => <div key={i} style={{ background: "rgba(255,80,80,0.15)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: 10, padding: "10px 14px", fontFamily: "Barlow", fontSize: 14, color: "#ff8080", marginBottom: 8 }}>🔴 {a}</div>)}
              </div>
            )}
            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 20, marginBottom: 16 }}>📊 STOCK POR MODELO Y TALLE</div>
              <div style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead><tr><th>Modelo</th>{TALLES.map(t => <th key={t}>{t}</th>)}<th>Total</th></tr></thead>
                  <tbody>{MODELOS.map(m => <tr key={m}><td style={{ fontFamily: "Barlow", fontWeight: 600 }}>{m}</td>{TALLES.map(t => <td key={t}><span className={`badge ${stock[m][t] === 0 ? "badge-err" : stock[m][t] <= 3 ? "badge-warn" : "badge-ok"}`}>{stock[m][t]}</span></td>)}<td style={{ fontFamily: "Barlow", fontWeight: 700, color: "#43e97b" }}>{Object.values(stock[m]).reduce((a, b) => a + b, 0)}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
            {historial.length > 0 && (
              <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 20, marginBottom: 16 }}>🕐 ÚLTIMAS VENTAS</div>
                <div style={{ overflowX: "auto" }}>
                  <table className="table">
                    <thead><tr><th>Fecha</th><th>Hora</th><th>Producto</th><th>Talle</th><th>Cant.</th><th>Ganancia</th></tr></thead>
                    <tbody>{historial.slice(0, 10).map((h, i) => <tr key={i}><td style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Barlow" }}>{h.fecha}</td><td style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Barlow" }}>{h.hora}</td><td style={{ fontFamily: "Barlow" }}>{h.modelo}</td><td><span className="badge badge-ok">{h.talle}</span></td><td style={{ fontFamily: "Barlow" }}>{h.cant}</td><td style={{ color: "#43e97b", fontFamily: "Barlow", fontWeight: 700 }}>+${h.ganancia.toLocaleString("es-AR")}</td></tr>)}</tbody>
                  </table>
                </div>
              </div>
            )}
            <div style={{ textAlign: "right" }}><button className="btn btn-danger" onClick={resetearTodo}>🗑️ Borrar todos los datos</button></div>
          </div>
        )}

        {tab === "ventas" && (
          <div style={{ maxWidth: 500 }}>
            <div className="card">
              <div style={{ fontSize: 24, marginBottom: 20 }}>💰 REGISTRAR VENTA</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div><div className="label">Modelo</div><select className="input" value={ventaForm.modelo} onChange={e => setVentaForm({ ...ventaForm, modelo: e.target.value })}>{MODELOS.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                <div><div className="label">Talle</div><select className="input" value={ventaForm.talle} onChange={e => setVentaForm({ ...ventaForm, talle: e.target.value })}>{TALLES.map(t => <option key={t} value={t}>{t} — Stock: {stock[ventaForm.modelo][t]}</option>)}</select></div>
                <div><div className="label">Cantidad</div><input type="number" className="input" min={1} value={ventaForm.cantidad} onChange={e => setVentaForm({ ...ventaForm, cantidad: e.target.value })} /></div>
                <div style={{ background: "rgba(67,233,123,0.08)", border: "1px solid rgba(67,233,123,0.2)", borderRadius: 12, padding: 16 }}>
                  <div className="label">Resumen</div>
                  <div style={{ fontFamily: "Barlow", marginTop: 8 }}>
                    <div>Precio: <b style={{ color: "#43e97b" }}>${(precios[ventaForm.modelo] || 0).toLocaleString("es-AR")}</b></div>
                    <div>Total: <b style={{ color: "#ffd700", fontSize: 22 }}>${((precios[ventaForm.modelo] || 0) * (parseInt(ventaForm.cantidad) || 0)).toLocaleString("es-AR")}</b></div>
                    <div>Ganancia: <b style={{ color: "#43e97b" }}>${((precios[ventaForm.modelo] - costos[ventaForm.modelo]) * (parseInt(ventaForm.cantidad) || 0)).toLocaleString("es-AR")}</b></div>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ width: "100%" }} onClick={registrarVenta}>✓ REGISTRAR VENTA</button>
              </div>
            </div>
          </div>
        )}

        {tab === "stock" && (
          <div>
            <div className="card" style={{ maxWidth: 500, marginBottom: 24 }}>
              <div style={{ fontSize: 24, marginBottom: 20 }}>📦 AGREGAR STOCK</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div><div className="label">Modelo</div><select className="input" value={stockForm.modelo} onChange={e => setStockForm({ ...stockForm, modelo: e.target.value })}>{MODELOS.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                <div><div className="label">Talle</div><select className="input" value={stockForm.talle} onChange={e => setStockForm({ ...stockForm, talle: e.target.value })}>{TALLES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><div className="label">Cantidad</div><input type="number" className="input" min={1} value={stockForm.cantidad} onChange={e => setStockForm({ ...stockForm, cantidad: e.target.value })} /></div>
                <button className="btn btn-primary" style={{ width: "100%" }} onClick={agregarStock}>✓ AGREGAR AL INVENTARIO</button>
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize: 20, marginBottom: 20 }}>📋 INVENTARIO COMPLETO</div>
              {MODELOS.map(m => (
                <div key={m} style={{ marginBottom: 24 }}>
                  <div style={{ fontFamily: "Barlow", fontWeight: 700, fontSize: 14, marginBottom: 12, color: "#38f9d7", textTransform: "uppercase" }}>{m}</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {TALLES.map(t => <div key={t} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 16px", textAlign: "center", minWidth: 72, border: `1px solid ${stock[m][t] === 0 ? "rgba(255,80,80,0.3)" : stock[m][t] <= 3 ? "rgba(255,200,60,0.3)" : "rgba(67,233,123,0.2)"}` }}><div style={{ fontFamily: "Barlow", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{t}</div><div style={{ fontSize: 28, color: stock[m][t] === 0 ? "#ff8080" : stock[m][t] <= 3 ? "#ffc83c" : "#43e97b" }}>{stock[m][t]}</div></div>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "precios" && (
          <div className="card">
            <div style={{ fontSize: 24, marginBottom: 20 }}>🏷️ PRECIOS Y COSTOS</div>
            {MODELOS.map((m, idx) => (
              <div key={m} style={{ marginBottom: 28, paddingBottom: 28, borderBottom: idx < MODELOS.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                <div style={{ fontFamily: "Barlow", fontWeight: 700, fontSize: 16, marginBottom: 16, color: "#38f9d7" }}>{m}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
                  <div><div className="label">Precio de venta ($)</div><input type="number" className="input" value={precios[m]} onChange={e => setPrecios({ ...precios, [m]: parseInt(e.target.value) || 0 })} /></div>
                  <div><div className="label">Costo de compra ($)</div><input type="number" className="input" value={costos[m]} onChange={e => setCostos({ ...costos, [m]: parseInt(e.target.value) || 0 })} /></div>
                </div>
                <div style={{ fontFamily: "Barlow", fontSize: 14, display: "flex", gap: 24, marginBottom: 8 }}>
                  <span>Ganancia/unidad: <b style={{ color: "#43e97b" }}>${(precios[m] - costos[m]).toLocaleString("es-AR")}</b></span>
                  <span>Margen: <b style={{ color: margen(m) > 30 ? "#43e97b" : margen(m) > 15 ? "#ffc83c" : "#ff8080" }}>{margen(m)}%</b></span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 8, overflow: "hidden" }}>
                  <div style={{ background: "linear-gradient(135deg,#43e97b,#38f9d7)", height: "100%", width: `${Math.min(margen(m), 100)}%`, borderRadius: 4 }}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "calendario" && (
          <div>
            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 22, marginBottom: 20 }}>🗓️ CALENDARIO ARGENTINA — MUNDIAL 2026</div>
              {PARTIDOS.map((p, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 20px", marginBottom: 12, display: "flex", alignItems: "center", gap: 20, fontFamily: "Barlow" }}>
                  <div style={{ background: "linear-gradient(135deg,#43e97b,#38f9d7)", borderRadius: 10, padding: "8px 14px", textAlign: "center", minWidth: 72 }}>
                    <div style={{ color: "#0a0a1a", fontSize: 13, fontWeight: 700 }}>{p.fecha}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Bebas Neue", fontSize: 18, letterSpacing: 1 }}>🇦🇷 ARG vs {p.rival.toUpperCase()}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{p.fase}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textAlign: "right" }}>
                    {p.fase === "Grupos" ? "📦 Reponé 2 días antes" : p.fase === "Octavos" ? "🔥 Alta demanda" : p.fase === "Cuartos" ? "🚀 Pico de ventas" : p.fase === "Semi" ? "💥 Máxima demanda" : "🏆 TODO el stock"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
