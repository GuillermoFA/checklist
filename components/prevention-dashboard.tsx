"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  ClipboardCheck, 
  AlertTriangle,
  Truck,
  TrendingUp,
  TrendingDown,
  Filter,
  Calendar,
  ChevronDown,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3
} from "lucide-react";
import { 
  getSubmissions, 
  questions,
  categories,
  type ChecklistSubmission 
} from "@/lib/checklist-data";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";

interface PreventionDashboardProps {
  onBack: () => void;
}

// Demo data for visualization (since localStorage starts empty)
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
      if (Math.random() > 0.15) { // 85% compliance rate
        const answers = questions.map(q => {
          const hasIssue = Math.random() < 0.08; // 8% chance of issue per question
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
          patente: vehicle.patente,
          numeroMovil: vehicle.movil,
          conductor: vehicle.conductor,
          fecha: dateStr,
          kilometraje: String(150000 + Math.floor(Math.random() * 50000)),
          proximaMantencion: String(160000 + Math.floor(Math.random() * 50000)),
          answers,
          createdAt: date.toISOString(),
          status: "completed"
        });
      }
    });
  }

  return submissions;
};

export function PreventionDashboard({ onBack }: PreventionDashboardProps) {
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Get submissions (use demo data if localStorage is empty)
  const rawSubmissions = useMemo(() => {
    const stored = getSubmissions();
    return stored.length > 0 ? stored : generateDemoData();
  }, []);

  // Filter submissions by date
  const submissions = useMemo(() => {
    const now = new Date();
    return rawSubmissions.filter(s => {
      const submissionDate = new Date(s.createdAt);
      switch (dateFilter) {
        case 'today':
          return submissionDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return submissionDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return submissionDate >= monthAgo;
        default:
          return true;
      }
    });
  }, [rawSubmissions, dateFilter]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const totalChecklists = submissions.length;
    const uniqueVehicles = new Set(submissions.map(s => s.patente)).size;
    
    let totalIssues = 0;
    let criticalIssues = 0;
    const issuesByCategory: Record<string, number> = {};
    const issuesByVehicle: Record<string, number> = {};
    const issuesByPriority: Record<string, number> = { alta: 0, media: 0, baja: 0 };

    submissions.forEach(s => {
      s.answers.forEach(a => {
        if (a.response === false) {
          totalIssues++;
          const question = questions.find(q => q.id === a.questionId);
          if (question) {
            issuesByCategory[question.category] = (issuesByCategory[question.category] || 0) + 1;
            if (question.critical) criticalIssues++;
          }
          issuesByVehicle[s.patente] = (issuesByVehicle[s.patente] || 0) + 1;
          if (a.priority) {
            issuesByPriority[a.priority]++;
          }
        }
      });
    });

    const avgIssuesPerChecklist = totalChecklists > 0 ? (totalIssues / totalChecklists).toFixed(1) : '0';
    const complianceRate = totalChecklists > 0 
      ? (((totalChecklists * questions.length - totalIssues) / (totalChecklists * questions.length)) * 100).toFixed(1)
      : '0';

    return {
      totalChecklists,
      uniqueVehicles,
      totalIssues,
      criticalIssues,
      avgIssuesPerChecklist,
      complianceRate,
      issuesByCategory,
      issuesByVehicle,
      issuesByPriority
    };
  }, [submissions]);

  // Chart Data: Issues by Category
  const categoryChartData = useMemo(() => {
    return categories
      .map(cat => ({
        name: cat,
        issues: kpis.issuesByCategory[cat] || 0
      }))
      .filter(d => d.issues > 0 || !categoryFilter)
      .sort((a, b) => b.issues - a.issues);
  }, [kpis.issuesByCategory, categoryFilter]);

  // Chart Data: Trend over time
  const trendData = useMemo(() => {
    const dailyData: Record<string, { date: string; checklists: number; issues: number }> = {};
    
    submissions.forEach(s => {
      const date = s.fecha;
      if (!dailyData[date]) {
        dailyData[date] = { date, checklists: 0, issues: 0 };
      }
      dailyData[date].checklists++;
      dailyData[date].issues += s.answers.filter(a => a.response === false).length;
    });

    return Object.values(dailyData)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);
  }, [submissions]);

  // Priority Pie Chart Data
  const priorityChartData = useMemo(() => {
    return [
      { name: 'Alta', value: kpis.issuesByPriority.alta, color: 'var(--destructive)' },
      { name: 'Media', value: kpis.issuesByPriority.media, color: 'var(--warning)' },
      { name: 'Baja', value: kpis.issuesByPriority.baja, color: 'var(--success)' },
    ].filter(d => d.value > 0);
  }, [kpis.issuesByPriority]);

  // Vehicles with most issues
  const problemVehicles = useMemo(() => {
    return Object.entries(kpis.issuesByVehicle)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([patente, issues]) => {
        const lastSubmission = submissions.find(s => s.patente === patente);
        return {
          patente,
          issues,
          conductor: lastSubmission?.conductor || 'N/A'
        };
      });
  }, [kpis.issuesByVehicle, submissions]);

  return (
    <main className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-primary-foreground/10">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">Dashboard Prevencionista</h1>
              <p className="text-sm text-primary-foreground/80">KPIs y Reportes</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </header>

      {/* Filters */}
      {showFilters && (
        <div className="bg-card border-b p-4">
          <div className="max-w-6xl mx-auto space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Período:
              </span>
              {(['today', 'week', 'month', 'all'] as const).map(filter => (
                <Button
                  key={filter}
                  size="sm"
                  variant={dateFilter === filter ? 'default' : 'outline'}
                  onClick={() => setDateFilter(filter)}
                  className="text-xs"
                >
                  {filter === 'today' ? 'Hoy' : filter === 'week' ? 'Semana' : filter === 'month' ? 'Mes' : 'Todo'}
                </Button>
              ))}
            </div>
            {categoryFilter && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Categoría: {categoryFilter}</span>
                <Button size="sm" variant="ghost" onClick={() => setCategoryFilter(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-4 space-y-6 max-w-6xl mx-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <ClipboardCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpis.totalChecklists}</p>
                  <p className="text-xs text-muted-foreground">Checklists</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-success/10">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpis.complianceRate}%</p>
                  <p className="text-xs text-muted-foreground">Cumplimiento</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-warning/10">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpis.totalIssues}</p>
                  <p className="text-xs text-muted-foreground">Problemas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-destructive/10">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpis.criticalIssues}</p>
                  <p className="text-xs text-muted-foreground">Críticos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-muted">
                  <Truck className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xl font-bold">{kpis.uniqueVehicles}</p>
                  <p className="text-xs text-muted-foreground">Vehículos Inspeccionados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-muted">
                  <BarChart3 className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xl font-bold">{kpis.avgIssuesPerChecklist}</p>
                  <p className="text-xs text-muted-foreground">Promedio Issues/Checklist</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-muted">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xl font-bold">{trendData.length}</p>
                  <p className="text-xs text-muted-foreground">Días con Registros</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Issues by Category */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Problemas por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      width={75}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="issues" 
                      fill="var(--primary)" 
                      radius={[0, 4, 4, 0]}
                      onClick={(data) => setCategoryFilter(data.name)}
                      cursor="pointer"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Distribución por Prioridad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                {priorityChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {priorityChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-sm">No hay datos de prioridad</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trend Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tendencia de Checklists e Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('es-CL');
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="checklists" 
                    stroke="var(--primary)" 
                    strokeWidth={2}
                    dot={{ fill: 'var(--primary)' }}
                    name="Checklists"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="issues" 
                    stroke="var(--destructive)" 
                    strokeWidth={2}
                    dot={{ fill: 'var(--destructive)' }}
                    name="Issues"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Problem Vehicles Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-destructive" />
              Vehículos con más Problemas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {problemVehicles.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-medium">Patente</th>
                      <th className="text-left py-2 px-2 font-medium">Conductor</th>
                      <th className="text-right py-2 px-2 font-medium">Issues</th>
                      <th className="text-right py-2 px-2 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {problemVehicles.map((vehicle, index) => (
                      <tr key={vehicle.patente} className="border-b last:border-0">
                        <td className="py-2 px-2 font-medium">{vehicle.patente}</td>
                        <td className="py-2 px-2 text-muted-foreground">{vehicle.conductor}</td>
                        <td className="py-2 px-2 text-right font-medium text-destructive">{vehicle.issues}</td>
                        <td className="py-2 px-2 text-right">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                            index === 0 
                              ? 'bg-destructive/20 text-destructive' 
                              : index < 3 
                              ? 'bg-warning/20 text-warning-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {index === 0 ? 'Crítico' : index < 3 ? 'Atención' : 'Revisar'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No hay datos disponibles</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Últimos Checklists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {submissions.slice(0, 5).map(submission => {
                const issueCount = submission.answers.filter(a => a.response === false).length;
                return (
                  <div 
                    key={submission.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        issueCount === 0 ? 'bg-success/20' : 'bg-warning/20'
                      }`}>
                        {issueCount === 0 
                          ? <CheckCircle2 className="w-5 h-5 text-success" />
                          : <AlertTriangle className="w-5 h-5 text-warning" />
                        }
                      </div>
                      <div>
                        <p className="font-medium">{submission.patente}</p>
                        <p className="text-xs text-muted-foreground">{submission.conductor}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {issueCount === 0 ? 'Sin problemas' : `${issueCount} problemas`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(submission.createdAt).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
