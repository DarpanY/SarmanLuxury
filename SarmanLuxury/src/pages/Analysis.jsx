import "./styles/Analysis.css"
import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"

const GOLD    = "#C8A45D"
const GREEN   = "#3dc460"
const RED     = "#e05050"
const BLUE    = "#4a8ee0"
const ORANGE  = "#e07830"

const STATUS_COLORS = { Processing: GOLD, Shipped: BLUE, Delivered: GREEN, Cancelled: RED }
const PIE_COLORS    = [GOLD, BLUE, GREEN, ORANGE, "#a855f7", "#ec4899"]

/* ─── DATE BUCKETING (drives the WEEK / MONTH / YEAR toggle) ─── */

function getDateBuckets(period) {
  const now = new Date()
  const buckets = []

  if (period === "week") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      buckets.push({
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        start: d,
        end: new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1),
      })
    }
  } else if (period === "month") {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      buckets.push({
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        start: d,
        end: new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1),
      })
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      buckets.push({
        label: d.toLocaleDateString("en-US", { month: "short" }),
        start: d,
        end: new Date(d.getFullYear(), d.getMonth() + 1, 1),
      })
    }
  }

  return buckets
}

function calcRevenueTrend(orders, period) {
  return getDateBuckets(period).map(({ label, start, end }) => {
    const inBucket = orders.filter(o => {
      const d = new Date(o.createdAt)
      return d >= start && d < end
    })
    return {
      month: label,
      revenue: inBucket.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
      orders: inBucket.length,
    }
  })
}

function calcUserGrowth(users, period) {
  return getDateBuckets(period).map(({ label, end }) => ({
    month: label,
    users: users.filter(u => new Date(u.createdAt) < end).length,
  }))
}

function filterOrdersByPeriod(orders, period) {
  const cutoff = new Date()
  if (period === "week") cutoff.setDate(cutoff.getDate() - 7)
  else if (period === "month") cutoff.setDate(cutoff.getDate() - 30)
  else cutoff.setFullYear(cutoff.getFullYear() - 1)

  return orders.filter(o => new Date(o.createdAt) >= cutoff)
}

const PERIOD_LABELS = {
  week: "Last 7 Days",
  month: "Last 30 Days",
  year: "Last 12 Months",
}

function calcOrderStatusData(orders) {
  const s = { Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0 }
  orders.forEach(o => { s[o.orderStatus] = (s[o.orderStatus] || 0) + 1 })
  return Object.entries(s).map(([name, value]) => ({ name, value }))
}

function calcTopProducts(orders) {
  const map = {}
  orders.forEach(order => {
    order.orderItems?.forEach(item => {
      const name = item.product?.name || "Unknown"
      map[name] = (map[name] || 0) + item.quantity
    })
  })
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, qty]) => ({ name: name.slice(0, 24), qty }))
}

/* ─── SVG AREA CHART ─── */
function AreaChart({ data, dataKey, color, labelKey, yFormat }) {
  const W = 600, H = 200, PL = 56, PR = 16, PT = 12, PB = 28
  const vals  = data.map(d => d[dataKey])
  const min   = 0
  const max   = Math.max(...vals) * 1.1 || 1
  const iW    = W - PL - PR
  const iH    = H - PT - PB
  const xPos  = (i) => PL + (i / (data.length - 1)) * iW
  const yPos  = (v) => PT + iH - ((v - min) / (max - min)) * iH
  const pts   = data.map((d, i) => `${xPos(i)},${yPos(d[dataKey])}`).join(" ")
  const area  = `M${xPos(0)},${yPos(data[0][dataKey])} ` +
                data.slice(1).map((d, i) => `L${xPos(i+1)},${yPos(d[dataKey])}`).join(" ") +
                ` L${xPos(data.length-1)},${PT+iH} L${xPos(0)},${PT+iH} Z`
  const line  = `M${xPos(0)},${yPos(data[0][dataKey])} ` +
                data.slice(1).map((d, i) => `L${xPos(i+1)},${yPos(d[dataKey])}`).join(" ")

  const yTicks = 4
  const yStep  = (max - min) / yTicks

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id={`ag-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y grid lines + labels */}
      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const v = min + i * yStep
        const y = yPos(v)
        return (
          <g key={i}>
            <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="rgba(200,164,93,0.08)" strokeWidth="1" />
            <text x={PL - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#666">
              {yFormat ? yFormat(v) : Math.round(v)}
            </text>
          </g>
        )
      })}

      {/* X labels — show every 2nd */}
      {data.map((d, i) => i % 2 === 0 && (
        <text key={i} x={xPos(i)} y={H - 4} textAnchor="middle" fontSize="10" fill="#9a9a9a">
          {d[labelKey]}
        </text>
      ))}

      {/* Area fill */}
      <path d={area} fill={`url(#ag-${dataKey})`} />

      {/* Line */}
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {data.map((d, i) => (
        <circle key={i} cx={xPos(i)} cy={yPos(d[dataKey])} r="3" fill={color} />
      ))}
    </svg>
  )
}

/* ─── SVG BAR CHART (vertical) ─── */
function BarChart({ data, dataKey, color, labelKey, yFormat }) {
  const W = 600, H = 200, PL = 56, PR = 16, PT = 12, PB = 28
  const vals   = data.map(d => d[dataKey])
  const max    = Math.max(...vals) * 1.1 || 1
  const iW     = W - PL - PR
  const iH     = H - PT - PB
  const bW     = Math.max(8, (iW / data.length) * 0.55)
  const xPos   = (i) => PL + ((i + 0.5) / data.length) * iW
  const yPos   = (v) => PT + iH - (v / max) * iH
  const bH     = (v) => (v / max) * iH

  const yTicks = 4
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const v = (max / yTicks) * i
        const y = yPos(v)
        return (
          <g key={i}>
            <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="rgba(200,164,93,0.08)" strokeWidth="1" />
            <text x={PL - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#666">
              {yFormat ? yFormat(v) : Math.round(v)}
            </text>
          </g>
        )
      })}

      {data.map((d, i) => {
        const h = bH(d[dataKey])
        const x = xPos(i)
        const y = yPos(d[dataKey])
        return (
          <g key={i}>
            <rect
              x={x - bW / 2} y={y} width={bW} height={h}
              fill={color} opacity="0.85" rx="2"
            />
            <text x={x} y={H - 4} textAnchor="middle" fontSize="10" fill="#9a9a9a">
              {d[labelKey]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ─── SVG HORIZONTAL BAR CHART ─── */
function HBarChart({ data, dataKey, nameKey, color }) {
  const ROW_H = 36
  const H     = data.length * ROW_H + 8
  const W     = 600, PL = 130, PR = 50, PT = 4
  const max   = Math.max(...data.map(d => d[dataKey])) || 1
  const iW    = W - PL - PR

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {data.map((d, i) => {
        const barW = (d[dataKey] / max) * iW
        const y    = PT + i * ROW_H
        return (
          <g key={i}>
            <text x={PL - 8} y={y + ROW_H / 2 + 4} textAnchor="end" fontSize="11" fill="#cfcfcf">
              {d[nameKey]}
            </text>
            <rect x={PL} y={y + 6} width={iW} height={ROW_H - 14} fill="rgba(200,164,93,0.06)" rx="2" />
            <rect x={PL} y={y + 6} width={Math.max(barW, 4)} height={ROW_H - 14} fill={color} opacity="0.85" rx="2" />
            <text x={PL + barW + 8} y={y + ROW_H / 2 + 4} fontSize="11" fill="#9a9a9a">
              {d[dataKey]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ─── SVG DONUT CHART ─── */
function DonutChart({ data, colors }) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1
  const CX = 100, CY = 100, R = 72, IR = 44
  let angle = -Math.PI / 2

  const slices = data.map((d, i) => {
    const sweep = (d.value / total) * 2 * Math.PI
    const x1 = CX + R * Math.cos(angle)
    const y1 = CY + R * Math.sin(angle)
    angle += sweep
    const x2 = CX + R * Math.cos(angle)
    const y2 = CY + R * Math.sin(angle)
    const xi1 = CX + IR * Math.cos(angle)
    const yi1 = CY + IR * Math.sin(angle)
    angle -= sweep
    const xi2 = CX + IR * Math.cos(angle)
    const yi2 = CY + IR * Math.sin(angle)
    angle += sweep
    const large = sweep > Math.PI ? 1 : 0
    const path = `M${x1},${y1} A${R},${R} 0 ${large} 1 ${x2},${y2} L${xi1},${yi1} A${IR},${IR} 0 ${large} 0 ${xi2},${yi2} Z`
    return { path, color: colors[i % colors.length], name: d.name, value: d.value, pct: Math.round((d.value / total) * 100) }
  })

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 200 200" width="180" height="180" style={{ flexShrink: 0 }}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="#071A14" strokeWidth="2" />
        ))}
        <text x={CX} y={CY - 6} textAnchor="middle" fontSize="22" fontWeight="600" fill="white">
          {total}
        </text>
        <text x={CX} y={CY + 14} textAnchor="middle" fontSize="10" fill="#9a9a9a" letterSpacing="1">
          TOTAL
        </text>
      </svg>
      <div className="donut-legend">
        {slices.map((s, i) => (
          <div key={i} className="donut-row">
            <span className="donut-dot" style={{ background: s.color }} />
            <span className="donut-name">{s.name}</span>
            <span className="donut-val">{s.value}</span>
            <span className="donut-pct">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── STAT CARD ─── */
const StatCard = ({ label, value, sub, accent }) => (
  <div className={`an-card ${accent ? "an-card-accent" : ""}`}>
    <p className="an-card-label">{label}</p>
    <h2 className="an-card-value">{value}</h2>
    {sub && <p className="an-card-sub">{sub}</p>}
  </div>
)

/* ─── MAIN COMPONENT ─── */
function Analysis() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const role = user?.role

  const [stats,   setStats]   = useState(null)
  const [orders,  setOrders]  = useState([])
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [period,  setPeriod]  = useState("year")

  const H = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, ordersRes, usersRes] = await Promise.all([
          API.get("/admin/dashboard", H),
          API.get("/admin/orders",    H),
          API.get("/admin/users",     H),
        ])
        setStats(dashRes.data)
        setOrders(ordersRes.data)
        setUsers(usersRes.data)
      } catch {
        toast.error("Failed to load analytics")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  /* ── DERIVED (period-aware) ── */
  const periodOrders     = filterOrdersByPeriod(orders, period)
  const monthlyData      = calcRevenueTrend(orders, period)
  const orderStatusData  = calcOrderStatusData(periodOrders)
  const topProducts      = calcTopProducts(periodOrders)
  const userGrowthData   = calcUserGrowth(users, period)
  const periodLabel      = PERIOD_LABELS[period]

  const avgOrderValue = periodOrders.length
    ? Math.round(periodOrders.reduce((a, o) => a + o.totalPrice, 0) / periodOrders.length) : 0

  const deliveredCount = periodOrders.filter(o => o.orderStatus === "Delivered").length
  const deliveryRate   = periodOrders.length ? Math.round((deliveredCount / periodOrders.length) * 100) : 0
  const cancelledCount = periodOrders.filter(o => o.orderStatus === "Cancelled").length
  const cancelRate     = periodOrders.length ? Math.round((cancelledCount / periodOrders.length) * 100) : 0
  const staffCount     = users.filter(u => ["admin","staff","superadmin"].includes(u.role)).length
  const newUsersThisMonth = users.filter(u => {
    const d = new Date(u.createdAt), now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  return (
    <section className="an-page">

      {/* ── SIDEBAR ── */}
      <div className="an-sidebar">
        <h2>SARMAN ADMIN</h2>
        <ul>
          {[
            { id:"dashboard", label:"DASHBOARD",      path:"/admin" },
            { id:"products",  label:"PRODUCTS",        path:"/admin-products" },
            { id:"orders",    label:"ORDERS",          path:"/admin" },
            { id:"abandoned", label:"ABANDONED CARTS", path:"/admin" },
            { id:"messages",  label:"MESSAGES",        path:"/admin" },
            { id:"users",     label:"USERS",           path:"/admin" },
            { id:"analysis",  label:"ANALYSIS",        path:"/analysis" },
          ].map(t => (
            <li
              key={t.id}
              className={t.id === "analysis" ? "active-tab" : ""}
              onClick={() => navigate(t.path)}
            >
              {t.label}
            </li>
          ))}
        </ul>
        <div className="an-user-info">
          <p className="an-role-badge">{role?.toUpperCase()}</p>
          <p className="an-username">{user?.name}</p>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="an-content">

        <div className="an-header">
          <div>
            <span className="an-eyebrow">SARMAN LUXURY</span>
            <h1 className="an-title">ANALYTICS</h1>
          </div>
          <div className="an-period-toggle">
            {["week","month","year"].map(p => (
              <button
                key={p}
                className={`period-btn ${period === p ? "active" : ""}`}
                onClick={() => setPeriod(p)}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="an-spinner">LOADING ANALYTICS...</div>
        ) : (
          <>
            {/* ═══ KPI CARDS ═══ */}
            <div className="an-kpi-grid">
              <StatCard accent label="TOTAL REVENUE"    value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} sub="All-time gross" />
              <StatCard        label="TOTAL ORDERS"     value={(stats?.totalOrders || 0).toLocaleString()} sub={`${deliveryRate}% delivery rate (${periodLabel.toLowerCase()})`} />
              <StatCard        label="TOTAL USERS"      value={(stats?.totalUsers  || 0).toLocaleString()} sub={`+${newUsersThisMonth} this month`} />
              <StatCard        label="AVG ORDER VALUE"  value={`₹${avgOrderValue.toLocaleString()}`}       sub={periodLabel} />
              <StatCard        label="CANCELLATION"     value={`${cancelRate}%`}                           sub={`${cancelledCount} cancelled (${periodLabel.toLowerCase()})`} />
              <StatCard        label="STAFF MEMBERS"    value={staffCount}                                  sub="Admins + staff" />
            </div>

            {/* ═══ REVENUE TREND ═══ */}
            <div className="an-section">
              <div className="an-section-header">
                <h2 className="an-section-title">REVENUE TREND</h2>
                <span className="an-section-sub">{periodLabel}</span>
              </div>
              <AreaChart
                data={monthlyData}
                dataKey="revenue"
                labelKey="month"
                color={GOLD}
                yFormat={v => `₹${Math.round(v/1000)}k`}
              />
            </div>

            {/* ═══ 2-COL: ORDER STATUS + USER GROWTH ═══ */}
            <div className="an-two-col">

              <div className="an-section">
                <div className="an-section-header">
                  <h2 className="an-section-title">ORDER STATUS</h2>
                  <span className="an-section-sub">{periodLabel}</span>
                </div>
                {orders.length === 0
                  ? <p className="an-no-data">No order data yet.</p>
                  : <DonutChart
                      data={orderStatusData}
                      colors={orderStatusData.map(d => STATUS_COLORS[d.name] || GOLD)}
                    />
                }
              </div>

              <div className="an-section">
                <div className="an-section-header">
                  <h2 className="an-section-title">USER GROWTH</h2>
                  <span className="an-section-sub">Cumulative users · {periodLabel}</span>
                </div>
                <AreaChart
                  data={userGrowthData}
                  dataKey="users"
                  labelKey="month"
                  color={BLUE}
                />
              </div>

            </div>

            {/* ═══ 2-COL: TOP PRODUCTS + MONTHLY ORDERS ═══ */}
            <div className="an-two-col">

              <div className="an-section">
                <div className="an-section-header">
                  <h2 className="an-section-title">TOP PRODUCTS</h2>
                  <span className="an-section-sub">By units sold · {periodLabel}</span>
                </div>
                {topProducts.length === 0
                  ? <p className="an-no-data">No product data yet.</p>
                  : <HBarChart data={topProducts} dataKey="qty" nameKey="name" color={GOLD} />
                }
              </div>

              <div className="an-section">
                <div className="an-section-header">
                  <h2 className="an-section-title">MONTHLY ORDERS</h2>
                  <span className="an-section-sub">{periodLabel}</span>
                </div>
                <BarChart
                  data={monthlyData}
                  dataKey="orders"
                  labelKey="month"
                  color={ORANGE}
                />
              </div>

            </div>

            {/* ═══ USER ROLES ═══ */}
            <div className="an-section">
              <div className="an-section-header">
                <h2 className="an-section-title">USER BREAKDOWN BY ROLE</h2>
              </div>
              <div className="an-roles-grid">
                {["superadmin","admin","staff","user"].map(r => {
                  const count = users.filter(u => u.role === r).length
                  const pct   = users.length ? Math.round((count / users.length) * 100) : 0
                  return (
                    <div key={r} className="an-role-card">
                      <span className={`an-role-badge an-role-${r}`}>{r.toUpperCase()}</span>
                      <h3 className="an-role-count">{count}</h3>
                      <div className="an-role-bar-wrap">
                        <div className="an-role-bar" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="an-role-pct">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ═══ HIGH-VALUE ORDERS ═══ */}
            <div className="an-section">
              <div className="an-section-header">
                <h2 className="an-section-title">HIGH-VALUE ORDERS</h2>
                <span className="an-section-sub">Top 5 by value</span>
              </div>
              <div className="an-hv-table">
                <div className="an-hv-header">
                  <span>CUSTOMER</span>
                  <span>ITEMS</span>
                  <span>PAYMENT</span>
                  <span>STATUS</span>
                  <span>TOTAL</span>
                </div>
                {[...orders]
                  .sort((a, b) => b.totalPrice - a.totalPrice)
                  .slice(0, 5)
                  .map(order => (
                    <div className="an-hv-row" key={order._id}>
                      <div>
                        <p className="hv-name">{order.user?.name || "—"}</p>
                        <p className="hv-email">{order.user?.email || "—"}</p>
                      </div>
                      <div className="hv-items">{order.orderItems?.length || 0} item{order.orderItems?.length !== 1 ? "s" : ""}</div>
                      <div className="hv-payment">{order.paymentMethod}</div>
                      <div>
                        <span className={`status-badge status-${order.orderStatus?.toLowerCase()}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <div className="hv-total">₹{order.totalPrice?.toLocaleString()}</div>
                    </div>
                  ))
                }
                {orders.length === 0 && <p className="an-no-data">No orders yet.</p>}
              </div>
            </div>

          </>
        )}
      </div>
    </section>
  )
}

export default Analysis
