"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, ClipboardCheck, AlertTriangle, Truck, TrendingUp,
  Filter, Calendar, ChevronDown, X, CheckCircle2, XCircle,
  Clock, BarChart3, LayoutDashboard, History, Award
} from "lucide-react";
import {
  getSubmissions, questions, categories, type ChecklistSubmission
} from "@/lib/checklist-data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { ChecklistHistory } from "@/components/checklist-history";

interface PreventionDashboardProps { onBack: () => void; }

const generateDemoData = (): ChecklistSubmission[] => {
  const vehicles = [
    { patente: "PYCF93", movil: "28", conductor: "Luis Cuero" },
    { patente: "LZYC11", movil: "08", conductor: "Juan Bahamondes" },
    { patente: "LLSR65", movil: "05", conductor: "Esteban Cortes" },
    { patente: "PTTR55", movil: "26", conductor: "Conan Apaza" },
    { patente: "FBTX96", movil: "96", conductor: "Mauro Chavez" },
    { patente: "PGRZ32", movil: "32", conductor: "Alfredo Becerra" },
    { patente: "LGYD93", movil: "14", conductor: "Eduardo Castillo" },
    { patente: "FGVC51", movil: "49", conductor: "Miguel Tapia" },
  ];
  const submissions: ChecklistSubmission[] = [];
  const today = new Date();
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split('T')[0];
    vehicles.forEach((vehicle, vIndex) => {
      if (Math.random() > 0.15) {
        const answers = questions.map(q => {
          const hasIssue = Math.random() < 0.08;
          return {
            questionId: q.id,
            response: !hasIssue,
            observation: hasIssue ? "Requiere atención" : undefined,
            priority: hasIssue ? (['baja', 'media', 'alta'][Math.floor(Math.random() * 3)] as 'baja' | 'media' | 'alta') : undefined,
            timestamp: date.toISOString()
          };
        });
        submissions.push({
          id: `demo_${dateStr}_${vIndex}`,
          patente: vehicle.patente, numeroMovil: vehicle.movil, conductor: vehicle.conductor,
          fecha: dateStr, kilometraje: String(150000 + Math.floor(Math.random() * 50000)),
          proximaMantencion: String(160000 + Math.floor(Math.random() * 50000)),
          answers, createdAt: date.toISOString(), status: "completed"
        });
      }
    });
  }
  return submissions;
};

type Tab = 'dashboard' | 'historial';
type DateFilter = 'today' | 'week' | 'month' | 'all';

export function PreventionDashboard({ onBack }: PreventionDashboardProps) {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [dateFilter, setDateFilter] = useState<DateFilter>('week');
  const [showFilters, setShowFilters] = useState(false);

  const rawSubmissions = useMemo(() => {
    const stored = getSubmissions();
    return stored.length > 0 ? stored : generateDemoData();
  }, []);

  const submissions = useMemo(() => {
    const now = new Date();
    return rawSubmissions.filter(s => {
      const d = new Date(s.createdAt);
      if (dateFilter === 'today') return d.toDateString() === now.toDateString();
      if (dateFilter === 'week') { const w = new Date(now); w.setDate(w.getDate() - 7); return d >= w; }
      if (dateFilter === 'month') { const m = new Date(now); m.setMonth(m.getMonth() - 1); return d >= m; }
      return true;
    });
  }, [rawSubmissions, dateFilter]);

  const kpis = useMemo(() => {
    const totalChecklists = submissions.length;
    const uniqueVehicles = new Set(submissions.map(s => s.patente)).size;
    let totalIssues = 0, criticalIssues = 0;
    const issuesByCategory: Record<string, number> = {};
    const issuesByVehicle: Record<string, number> = {};
    const issuesByPriority: Record<string, number> = { alta: 0, media: 0, baja: 0 };
    const issuesByQuestion: Record<string, number> = {};

    submissions.forEach(s => {
      s.answers.forEach(a => {
        if (a.response === false) {
          totalIssues++;
          const q = questions.find(q => q.id === a.questionId);
          if (q) {
            issuesByCategory[q.category] = (issuesByCategory[q.category] || 0) + 1;
            issuesByQuestion[q.id] = (issuesByQuestion[q.id] || 0) + 1;
            if (q.critical) criticalIssues++;
          }
          issuesByVehicle[s.patente] = (issuesByVehicle[s.patente] || 0) + 1;
          if (a.priority) issuesByPriority[a.priority]++;
        }
      });
    });

    const complianceRate = totalChecklists > 0
      ? (((totalChecklists * questions.length - totalIssues) / (totalChecklists * questions.length)) * 100).toFixed(1)
      : '0';

    return { totalChecklists, uniqueVehicles, totalIssues, criticalIssues, complianceRate, issuesByCategory, issuesByVehicle, issuesByPriority, issuesByQuestion };
  }, [submissions]);

  const trendData = useMemo(() => {
    const daily: Record<string, { date: string; checklists: number; issues: number; ok: number }> = {};
    submissions.forEach(s => {
      if (!daily[s.fecha]) daily[s.fecha] = { date: s.fecha, checklists: 0, issues: 0, ok: 0 };
      daily[s.fecha].checklists++;
      const issueCount = s.answers.filter(a => a.response === false).length;
      daily[s.fecha].issues += issueCount;
      daily[s.fecha].ok += s.answers.length - issueCount;
    });
    return Object.values(daily).sort((a, b) => a.date.localeCompare(b.date)).slice(-14);
  }, [submissions]);

  const categoryChartData = useMemo(() =>
    categories.map(cat => {
      const total = submissions.reduce((sum, s) => sum + s.answers.filter(a => {
        const q = questions.find(q => q.id === a.questionId);
        return q?.category === cat;
      }).length, 0);
      const issues = kpis.issuesByCategory[cat] || 0;
      return { name: cat, issues, ok: total - issues, pct: total > 0 ? Math.round(((total - issues) / total) * 100) : 100 };
    }).sort((a, b) => a.pct - b.pct)
  , [kpis.issuesByCategory, submissions]);

  const radarData = useMemo(() =>
    categories.map(cat => ({
      category: cat.length > 8 ? cat.slice(0, 8) + '.' : cat,
      cumplimiento: categoryChartData.find(d => d.name === cat)?.pct ?? 100
    }))
  , [categoryChartData]);

  const priorityData = useMemo(() => [
    { name: 'Alta', value: kpis.issuesByPriority.alta, color: '#ef4444' },
    { name: 'Media', value: kpis.issuesByPriority.media, color: '#f59e0b' },
    { name: 'Baja', value: kpis.issuesByPriority.baja, color: '#10b981' },
  ].filter(d => d.value > 0), [kpis.issuesByPriority]);

  const problemVehicles = useMemo(() =>
    Object.entries(kpis.issuesByVehicle)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([patente, issues]) => ({
        patente, issues, conductor: submissions.find(s => s.patente === patente)?.conductor || 'N/A'
      }))
  , [kpis.issuesByVehicle, submissions]);

  const topIssueQuestions = useMemo(() =>
    Object.entries(kpis.issuesByQuestion)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([id, count]) => ({ question: questions.find(q => q.id === id)?.question || id, count }))
  , [kpis.issuesByQuestion]);

  const dateLabels: Record<DateFilter, string> = { today: 'Hoy', week: 'Semana', month: 'Mes', all: 'Todo' };

  return (
    <main className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground shadow-md">
        <div className="flex items-center justify-between p-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-primary-foreground/10">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-lg font-bold">Dashboard Prevencionista</h1>
              <p className="text-xs text-primary-foreground/70">Sistema de control de checklists</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-1">
            <Filter className="w-4 h-4" />
            {dateLabels[dateFilter]}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-primary-foreground/20 max-w-6xl mx-auto">
          {([
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'historial', label: 'Historial', icon: History },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === id
                  ? 'border-primary-foreground text-primary-foreground'
                  : 'border-transparent text-primary-foreground/60 hover:text-primary-foreground/80'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </header>

      {/* Date Filter Panel */}
      {showFilters && (
        <div className="bg-card border-b p-4">
          <div className="max-w-6xl mx-auto flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-4 h-4" /> Período:
            </span>
            {(['today', 'week', 'month', 'all'] as const).map(f => (
              <Button key={f} size="sm" variant={dateFilter === f ? 'default' : 'outline'}
                onClick={() => { setDateFilter(f); setShowFilters(false); }} className="text-xs">
                {dateLabels[f]}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 max-w-6xl mx-auto space-y-6">
        {tab === 'dashboard' && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Checklists', value: kpis.totalChecklists, icon: ClipboardCheck, color: 'primary' },
                { label: 'Cumplimiento', value: `${kpis.complianceRate}%`, icon: Award, color: 'success' },
                { label: 'Problemas', value: kpis.totalIssues, icon: AlertTriangle, color: 'warning' },
                { label: 'Críticos', value: kpis.criticalIssues, icon: XCircle, color: 'destructive' },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className={`inline-flex p-2 rounded-xl mb-2 bg-${color}/10`}>
                      <Icon className={`w-5 h-5 text-${color}`} />
                    </div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Vehículos', value: kpis.uniqueVehicles, icon: Truck },
                { label: 'Días c/ Registros', value: trendData.length, icon: Clock },
                { label: 'Prom. Issues/Check', value: kpis.totalChecklists > 0 ? (kpis.totalIssues / kpis.totalChecklists).toFixed(1) : '0', icon: BarChart3 },
              ].map(({ label, value, icon: Icon }) => (
                <Card key={label}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-muted">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{value}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Compliance progress bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Tasa de Cumplimiento Global</span>
                  <span className={`text-lg font-bold ${Number(kpis.complianceRate) >= 90 ? 'text-emerald-600' : Number(kpis.complianceRate) >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                    {kpis.complianceRate}%
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${Number(kpis.complianceRate) >= 90 ? 'bg-emerald-500' : Number(kpis.complianceRate) >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${kpis.complianceRate}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0%</span><span>Meta: 95%</span><span>100%</span>
                </div>
              </CardContent>
            </Card>

            {/* Charts row 1 */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Compliance by Category bar */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Cumplimiento por Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryChartData} layout="vertical" margin={{ left: 75, right: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 10 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
                        <Tooltip
                          formatter={(v: number) => [`${v}%`, 'Cumplimiento']}
                          contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                        />
                        <Bar dataKey="pct" radius={[0, 4, 4, 0]} name="Cumplimiento">
                          {categoryChartData.map((entry, i) => (
                            <Cell key={i} fill={entry.pct >= 90 ? '#10b981' : entry.pct >= 75 ? '#f59e0b' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Radar chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Radar de Categorías</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                        <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                        <Radar name="Cumplimiento" dataKey="cumplimiento" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.25} strokeWidth={2} />
                        <Tooltip formatter={(v: number) => [`${v}%`]} contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trend chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" /> Tendencia diaria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ left: 0, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => { const d = new Date(v); return `${d.getDate()}/${d.getMonth()+1}`; }} />
                      <YAxis />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                        labelFormatter={v => new Date(v).toLocaleDateString('es-CL')}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="checklists" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} name="Checklists" />
                      <Line type="monotone" dataKey="issues" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} name="Problemas" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Charts row 2 */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Priority pie */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Problemas por Prioridad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56 flex items-center justify-center">
                    {priorityData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={priorityData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                            {priorityData.map((e, i) => <Cell key={i} fill={e.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <p className="text-muted-foreground text-sm">Sin datos de prioridad</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Top issue questions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Preguntas con más Fallos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topIssueQuestions.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-500' : 'bg-amber-500'}`}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{item.question}</p>
                          <div className="h-1.5 bg-muted rounded-full mt-1">
                            <div className="h-1.5 bg-red-400 rounded-full" style={{ width: `${Math.min(100, (item.count / (topIssueQuestions[0]?.count || 1)) * 100)}%` }} />
                          </div>
                        </div>
                        <span className="text-sm font-bold text-destructive flex-shrink-0">{item.count}</span>
                      </div>
                    ))}
                    {topIssueQuestions.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">Sin datos</p>}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Problem vehicles */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="w-5 h-5 text-destructive" /> Vehículos con más Problemas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {problemVehicles.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 font-semibold">#</th>
                          <th className="text-left py-2 px-2 font-semibold">Patente</th>
                          <th className="text-left py-2 px-2 font-semibold">Conductor</th>
                          <th className="text-right py-2 px-2 font-semibold">Issues</th>
                          <th className="text-right py-2 px-2 font-semibold">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {problemVehicles.map((v, i) => (
                          <tr key={v.patente} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="py-2 px-2 text-muted-foreground">{i + 1}</td>
                            <td className="py-2 px-2 font-bold">{v.patente}</td>
                            <td className="py-2 px-2 text-muted-foreground">{v.conductor}</td>
                            <td className="py-2 px-2 text-right font-bold text-destructive">{v.issues}</td>
                            <td className="py-2 px-2 text-right">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${i === 0 ? 'bg-red-100 text-red-700' : i < 3 ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'}`}>
                                {i === 0 ? 'Crítico' : i < 3 ? 'Atención' : 'Revisar'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="text-center text-muted-foreground py-4">Sin datos</p>}
              </CardContent>
            </Card>

            {/* Recent submissions preview */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Últimas Checklists</CardTitle>
                  <Button size="sm" variant="ghost" onClick={() => setTab('historial')} className="text-xs text-primary">
                    Ver historial completo →
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {submissions.slice(0, 5).map(s => {
                    const issues = s.answers.filter(a => a.response === false).length;
                    return (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${issues === 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                            {issues === 0 ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{s.patente} <span className="text-muted-foreground font-normal">— {s.conductor}</span></p>
                            <p className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${issues === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {issues === 0 ? '✓ OK' : `${issues} prob.`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {tab === 'historial' && (
          <ChecklistHistory submissions={rawSubmissions} />
        )}
      </div>
    </main>
  );
}
