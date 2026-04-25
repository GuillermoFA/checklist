"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp,
  Search, ArrowLeft, Truck, User, Calendar, Gauge, ClipboardList
} from "lucide-react";
import { questions, type ChecklistSubmission } from "@/lib/checklist-data";

interface ChecklistHistoryProps {
  submissions: ChecklistSubmission[];
}

function DetailModal({ submission, onClose }: { submission: ChecklistSubmission; onClose: () => void }) {
  const issueAnswers = submission.answers.filter(a => a.response === false);
  const okAnswers = submission.answers.filter(a => a.response === true);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div
        className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-2xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-primary text-primary-foreground p-4 rounded-t-2xl md:rounded-t-2xl flex items-center justify-between">
          <div>
            <p className="font-bold text-lg">{submission.patente} — Móvil {submission.numeroMovil}</p>
            <p className="text-sm text-primary-foreground/80">{submission.conductor} · {new Date(submission.createdAt).toLocaleString('es-CL')}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-primary-foreground/10">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{submission.answers.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{okAnswers.length}</p>
              <p className="text-xs text-emerald-600">OK</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{issueAnswers.length}</p>
              <p className="text-xs text-red-600">Problemas</p>
            </div>
          </div>

          {/* Vehicle info */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-muted-foreground text-xs">Kilometraje</p>
              <p className="font-semibold">{Number(submission.kilometraje).toLocaleString('es-CL')} km</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-muted-foreground text-xs">Próx. Mantención</p>
              <p className="font-semibold">{Number(submission.proximaMantencion).toLocaleString('es-CL')} km</p>
            </div>
          </div>

          {/* Issues */}
          {issueAnswers.length > 0 && (
            <div>
              <h3 className="font-bold text-destructive flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" /> Problemas Detectados
              </h3>
              <div className="space-y-2">
                {issueAnswers.map(a => {
                  const q = questions.find(q => q.id === a.questionId);
                  return (
                    <div key={a.questionId} className="bg-red-50 border border-red-200 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm text-red-800">{q?.question}</p>
                        {a.priority && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${
                            a.priority === 'alta' ? 'bg-red-500 text-white' :
                            a.priority === 'media' ? 'bg-amber-500 text-white' :
                            'bg-emerald-500 text-white'
                          }`}>
                            {a.priority.charAt(0).toUpperCase() + a.priority.slice(1)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{q?.category}</p>
                      {a.observation && <p className="text-sm text-red-700 mt-1 italic">"{a.observation}"</p>}
                      {a.photos && a.photos.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {a.photos.map((ph, i) => (
                            <img key={i} src={ph} alt={`foto ${i+1}`} className="w-16 h-16 object-cover rounded-lg border" />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* OK items collapsible */}
          <details className="group">
            <summary className="font-bold text-emerald-700 flex items-center gap-2 cursor-pointer list-none">
              <CheckCircle2 className="w-4 h-4" />
              Ítems Correctos ({okAnswers.length})
              <ChevronDown className="w-4 h-4 ml-auto group-open:rotate-180 transition-transform" />
            </summary>
            <div className="mt-2 space-y-1">
              {okAnswers.map(a => {
                const q = questions.find(q => q.id === a.questionId);
                return (
                  <div key={a.questionId} className="flex items-center gap-2 text-sm py-1 px-2 rounded-lg hover:bg-muted/50">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{q?.question}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{q?.category}</span>
                  </div>
                );
              })}
            </div>
          </details>

          {submission.observacionesGenerales && (
            <div className="bg-muted/50 rounded-xl p-3">
              <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Observaciones Generales</p>
              <p className="text-sm">{submission.observacionesGenerales}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChecklistHistory({ submissions }: ChecklistHistoryProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ChecklistSubmission | null>(null);
  const [sortField, setSortField] = useState<'fecha' | 'issues' | 'patente'>('fecha');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = useMemo(() => {
    let filtered = submissions.filter(s =>
      s.patente.toLowerCase().includes(search.toLowerCase()) ||
      s.conductor.toLowerCase().includes(search.toLowerCase()) ||
      s.numeroMovil.includes(search)
    );
    filtered = [...filtered].sort((a, b) => {
      let va: string | number, vb: string | number;
      if (sortField === 'fecha') { va = a.createdAt; vb = b.createdAt; }
      else if (sortField === 'issues') {
        va = a.answers.filter(x => x.response === false).length;
        vb = b.answers.filter(x => x.response === false).length;
      } else { va = a.patente; vb = b.patente; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [submissions, search, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => (
    sortField === field
      ? sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
      : null
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por patente, conductor o móvil..."
          className="w-full h-10 pl-9 pr-4 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Summary pills */}
      <div className="flex gap-2 flex-wrap text-sm">
        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
          {sorted.length} registros
        </span>
        <span className="bg-destructive/10 text-destructive px-3 py-1 rounded-full font-semibold">
          {sorted.reduce((sum, s) => sum + s.answers.filter(a => a.response === false).length, 0)} problemas totales
        </span>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-semibold">
                  <button onClick={() => toggleSort('patente')} className="flex items-center gap-1 hover:text-primary">
                    <Truck className="w-3 h-3" /> Vehículo <SortIcon field="patente" />
                  </button>
                </th>
                <th className="text-left p-3 font-semibold hidden sm:table-cell">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> Conductor</span>
                </th>
                <th className="text-left p-3 font-semibold">
                  <button onClick={() => toggleSort('fecha')} className="flex items-center gap-1 hover:text-primary">
                    <Calendar className="w-3 h-3" /> Fecha <SortIcon field="fecha" />
                  </button>
                </th>
                <th className="text-left p-3 font-semibold hidden md:table-cell">
                  <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> Km</span>
                </th>
                <th className="text-center p-3 font-semibold">
                  <button onClick={() => toggleSort('issues')} className="flex items-center gap-1 hover:text-primary mx-auto">
                    Estado <SortIcon field="issues" />
                  </button>
                </th>
                <th className="text-right p-3 font-semibold">
                  <span className="flex items-center gap-1 justify-end"><ClipboardList className="w-3 h-3" /> Detalle</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, i) => {
                const issues = s.answers.filter(a => a.response === false).length;
                const total = s.answers.length;
                const pct = total > 0 ? Math.round(((total - issues) / total) * 100) : 100;
                return (
                  <tr key={s.id} className={`border-t hover:bg-muted/30 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                    <td className="p-3">
                      <p className="font-bold">{s.patente}</p>
                      <p className="text-xs text-muted-foreground">Móvil {s.numeroMovil}</p>
                    </td>
                    <td className="p-3 hidden sm:table-cell text-muted-foreground">{s.conductor}</td>
                    <td className="p-3 whitespace-nowrap">
                      <p>{new Date(s.createdAt).toLocaleDateString('es-CL')}</p>
                      <p className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{Number(s.kilometraje).toLocaleString('es-CL')}</td>
                    <td className="p-3">
                      <div className="flex flex-col items-center gap-1">
                        <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          issues === 0 ? 'bg-emerald-100 text-emerald-700' :
                          issues <= 2 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {pct}%
                        </div>
                        {issues > 0 && <span className="text-xs text-red-600">{issues} prob.</span>}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => setSelected(s)} className="text-xs h-8">
                        Ver
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No se encontraron registros</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {selected && <DetailModal submission={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
