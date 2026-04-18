import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  AreaChart,
  Area,
} from 'recharts';
import {
  Upload,
  FileText,
  BarChart3,
  PieChart as PieIcon,
  LayoutDashboard,
  TrendingUp,
  Users,
} from 'lucide-react';

/**
 * Função utilitária para processar o conteúdo do CSV.
 * Lida com separadores ';' e o formato de moeda brasileiro (ex: 1.234,56).
 */
const parseCSV = (text) => {
  const lines = text.split('\n');
  if (lines.length === 0) return [];

  const headers = lines[0].split(';').map((h) => h.trim().replace(/"/g, ''));

  return lines
    .slice(1)
    .filter((line) => line.trim() !== '')
    .map((line) => {
      const values = line.split(';').map((v) => v.trim().replace(/"/g, ''));
      return headers.reduce((obj, header, i) => {
        let val = values[i] || '';
        if (header === 'Financial Value (BRL)') {
          // Converte formato brasileiro para float padrão (1234.56)
          const normalized = val.replace(/\./g, '').replace(',', '.');
          const parsed = parseFloat(normalized);
          val = isNaN(parsed) ? 0 : parsed;
        }
        obj[header] = val;
        return obj;
      }, {});
    });
};

const COLORS = [
  '#4208af',
  '#1e8a76',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
];
const MONTHS_ORDER = [
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Componente principal do Dashboard.
 * Deve ser exportado como default para que o main.jsx o localize.
 */
const App = () => {
  const [data, setData] = useState([]);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = parseCSV(event.target.result);
        setData(result);
      };
      reader.readAsText(file);
    }
  };

  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    // 1. Casos por faixa de valor mês a mês
    const ranges = [
      { label: '0,1-30', min: 0.1, max: 30 },
      { label: '30,01-50', min: 30.01, max: 50 },
      { label: '50,01-80', min: 50.01, max: 80 },
      { label: '80,01-100', min: 80.01, max: 100 },
      { label: '100,01-200', min: 100.01, max: 200 },
      { label: '>200', min: 200.01, max: Infinity },
    ];

    const rangeMonthly = MONTHS_ORDER.map((m) => {
      const monthData = data.filter((d) => d.Month === m);
      const row = { month: m };
      ranges.forEach((r) => {
        row[r.label] = monthData.filter((d) => {
          const val = d['Financial Value (BRL)'];
          return val >= r.min && val <= r.max;
        }).length;
      });
      return row;
    });

    // 2. Composição de Usuários (Únicos vs Reincidentes)
    const userCounts = {};
    data.forEach((d) => {
      const id = d['User ID'];
      if (id) userCounts[id] = (userCounts[id] || 0) + 1;
    });
    const uniqueUsers = Object.keys(userCounts).length;
    const recurringUsers = Object.values(userCounts).filter(
      (c) => c > 1
    ).length;
    const repeatData = [
      { name: 'Únicos', value: uniqueUsers - recurringUsers },
      { name: 'Reincidentes', value: recurringUsers },
    ];

    // 3. Motivos Macro Mês a Mês
    const macros = [
      ...new Set(data.map((d) => d['Macro Reason']).filter(Boolean)),
    ];
    const macroMonthly = MONTHS_ORDER.map((m) => {
      const row = { month: m };
      macros.forEach((mac) => {
        row[mac] = data.filter(
          (d) => d.Month === m && d['Macro Reason'] === mac
        ).length;
      });
      return row;
    });

    // 4. Detalhamento de Payments (Micro Reason) Mês a Mês
    const paymentsOnly = data.filter((d) => d['Macro Reason'] === 'payments');
    const micros = [
      ...new Set(paymentsOnly.map((d) => d['Micro Reason']).filter(Boolean)),
    ];
    const microMonthly = MONTHS_ORDER.map((m) => {
      const row = { month: m };
      micros.forEach((mic) => {
        row[mic] = paymentsOnly.filter(
          (d) => d.Month === m && d['Micro Reason'] === mic
        ).length;
      });
      return row;
    });

    // 5 & 6. Evolução Financeira
    const valueMonthly = MONTHS_ORDER.map((m) => ({
      month: m,
      Total: data
        .filter((d) => d.Month === m)
        .reduce((acc, curr) => acc + (curr['Financial Value (BRL)'] || 0), 0),
      Payments: data
        .filter((d) => d.Month === m && d['Macro Reason'] === 'payments')
        .reduce((acc, curr) => acc + (curr['Financial Value (BRL)'] || 0), 0),
    }));

    // 7. Pareto: Impacto Financeiro por Motivo
    const reasonValueMap = {};
    data.forEach((d) => {
      const r = d['Micro Reason'] || 'Outros';
      reasonValueMap[r] =
        (reasonValueMap[r] || 0) + (d['Financial Value (BRL)'] || 0);
    });
    const totalValAll = Object.values(reasonValueMap).reduce(
      (a, b) => a + b,
      0
    );
    const sortedValue = Object.entries(reasonValueMap).sort(
      (a, b) => b[1] - a[1]
    );
    let currentValSum = 0;
    const paretoValue = sortedValue.map(([reason, val]) => {
      currentValSum += val;
      return {
        reason,
        value: Math.round(val),
        percent:
          totalValAll > 0 ? Math.round((currentValSum / totalValAll) * 100) : 0,
      };
    });

    // 8. Pareto: Volume de Casos por Motivo
    const reasonCountMap = {};
    data.forEach((d) => {
      const r = d['Micro Reason'] || 'Outros';
      reasonCountMap[r] = (reasonCountMap[r] || 0) + 1;
    });
    const totalCountAll = data.length;
    const sortedCount = Object.entries(reasonCountMap).sort(
      (a, b) => b[1] - a[1]
    );
    let currentCountSum = 0;
    const paretoCount = sortedCount.map(([reason, count]) => {
      currentCountSum += count;
      return {
        reason,
        count,
        percent:
          totalCountAll > 0
            ? Math.round((currentCountSum / totalCountAll) * 100)
            : 0,
      };
    });

    return {
      rangeMonthly,
      repeatData,
      macroMonthly,
      microMonthly,
      valueMonthly,
      paretoValue,
      paretoCount,
      totalValueAll: totalValAll,
      totalCountAll: totalCountAll,
    };
  }, [data]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img src="/Logo Positiva.svg" alt="sonata.cx" className="h-10 w-auto" />
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <LayoutDashboard className="text-[#4208af] w-7 h-7" />{' '}
              Atendimento Intelligence
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Análise estratégica de tickets e performance financeira{' '}
              {fileName && `| ${fileName}`}
            </p>
          </div>
        </div>

        <label className="flex items-center gap-3 px-6 py-3 bg-[#4208af] text-white rounded-xl cursor-pointer hover:bg-[#350a8a] transition-all shadow-lg hover:shadow-[#c4a0f8]">
          <Upload size={20} />
          <span className="font-bold">Subir Planilha CSV</span>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </header>

      {!stats ? (
        <div className="max-w-7xl mx-auto h-[400px] border-4 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center bg-white shadow-inner">
          <div className="bg-slate-50 p-6 rounded-full mb-4">
            <FileText size={64} className="text-slate-300" />
          </div>
          <p className="text-xl font-bold text-slate-400">
            Arraste seu arquivo CSV ou use o botão superior para começar
          </p>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Impacto Financeiro
              </p>
              <h3 className="text-3xl font-black text-[#4208af]">
                R${' '}
                {stats.totalValueAll.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Total de Chamados
              </p>
              <h3 className="text-3xl font-black text-emerald-600">
                {stats.totalCountAll.toLocaleString('pt-BR')}
              </h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Ticket Médio
              </p>
              <h3 className="text-3xl font-black text-amber-500">
                R${' '}
                {(
                  stats.totalValueAll / stats.totalCountAll || 0
                ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <BarChart3 size={20} className="text-[#534794]" /> Chamados por
                Faixa de Valor
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.rangeMonthly}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="0,1-30" stackId="a" fill="#534794" />
                    <Bar dataKey="30,01-50" stackId="a" fill="#534794" />
                    <Bar dataKey="50,01-80" stackId="a" fill="#9b7fe8" />
                    <Bar dataKey="80,01-100" stackId="a" fill="#d9d7df" />
                    <Bar dataKey="100,01-200" stackId="a" fill="#fbbf24" />
                    <Bar dataKey=">200" stackId="a" fill="#f43f5e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Users size={20} className="text-emerald-500" /> Usuários Únicos
                vs Reincidentes
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.repeatData}
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {stats.repeatData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-full">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                Análise de Pareto: Impacto Financeiro por Motivo
              </h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={stats.paretoValue}
                    margin={{ bottom: 40 }}
                  >
                    <XAxis
                      dataKey="reason"
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      fontSize={11}
                      tick={{ fill: '#64748b' }}
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      stroke="#534794"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#f43f5e"
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Bar
                      yAxisId="left"
                      dataKey="value"
                      fill="#534794"
                      radius={[4, 4, 0, 0]}
                      name="Valor (R$)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="percent"
                      stroke="#f43f5e"
                      strokeWidth={3}
                      name="% Acumulado"
                      dot={{ fill: '#f43f5e', r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-full">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                Tendência Mensal: Total Geral vs Pagamentos
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.valueMonthly}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(v) =>
                        `R$ ${Number(v).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}`
                      }
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Total"
                      stroke="#534794"
                      strokeWidth={4}
                      dot={{ r: 6, fill: '#534794' }}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Payments"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      )}

      <footer className="max-w-7xl mx-auto mt-20 pb-10 text-center border-t border-slate-200 pt-10">
        <p className="text-slate-400 text-sm font-medium italic">
          Dashboard de Performance Estratégica
        </p>
      </footer>
    </div>
  );
};

export default App;
