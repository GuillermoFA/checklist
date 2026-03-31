"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Check, 
  X, 
  AlertTriangle,
  Send,
  Truck,
  User,
  Gauge,
  Calendar
} from "lucide-react";
import { questions, type Answer } from "@/lib/checklist-data";

interface VehicleInfo {
  patente: string;
  numeroMovil: string;
  conductor: string;
  kilometraje: string;
  proximaMantencion: string;
}

interface ChecklistReviewProps {
  vehicleInfo: VehicleInfo;
  answers: Record<string, Answer>;
  observacionesGenerales: string;
  onBack: () => void;
  onSubmit: () => void;
}

export function ChecklistReview({ 
  vehicleInfo, 
  answers, 
  observacionesGenerales,
  onBack, 
  onSubmit 
}: ChecklistReviewProps) {
  const issuesCount = Object.values(answers).filter(a => a.response === false).length;
  const criticalIssues = questions.filter(q => 
    q.critical && answers[q.id]?.response === false
  );

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground p-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-primary-foreground/10">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Revisar antes de enviar</h1>
        </div>
      </header>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Vehicle Info Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Información del Vehículo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Patente:</span>
              <span className="font-medium">{vehicleInfo.patente}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Móvil:</span>
              <span className="font-medium">{vehicleInfo.numeroMovil}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <User className="w-4 h-4" /> Conductor:
              </span>
              <span className="font-medium">{vehicleInfo.conductor}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <Gauge className="w-4 h-4" /> Kilometraje:
              </span>
              <span className="font-medium">{vehicleInfo.kilometraje} km</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Próx. Mantención:
              </span>
              <span className="font-medium">{vehicleInfo.proximaMantencion} km</span>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-success/10 border-success/30">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-success">
                {Object.values(answers).filter(a => a.response === true).length}
              </div>
              <p className="text-sm text-success/80">Sin problemas</p>
            </CardContent>
          </Card>
          <Card className="bg-destructive/10 border-destructive/30">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-destructive">
                {issuesCount}
              </div>
              <p className="text-sm text-destructive/80">Con problemas</p>
            </CardContent>
          </Card>
        </div>

        {/* Critical Issues Alert */}
        {criticalIssues.length > 0 && (
          <Card className="bg-warning/10 border-warning">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-warning-foreground">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Problemas Críticos Detectados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {criticalIssues.map(issue => (
                  <li key={issue.id} className="text-sm flex items-start gap-2">
                    <X className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">{issue.question}</span>
                      {answers[issue.id]?.observation && (
                        <p className="text-muted-foreground text-xs mt-0.5">
                          {answers[issue.id].observation}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* All Issues List */}
        {issuesCount > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Todos los problemas reportados</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {questions.filter(q => answers[q.id]?.response === false).map(question => {
                  const answer = answers[question.id];
                  return (
                    <li key={question.id} className="text-sm border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex items-start gap-2">
                        <X className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{question.question}</span>
                            {answer?.priority && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                answer.priority === 'alta' 
                                  ? 'bg-destructive/20 text-destructive'
                                  : answer.priority === 'media'
                                  ? 'bg-warning/20 text-warning-foreground'
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {answer.priority}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{question.category}</p>
                          {answer?.observation && (
                            <p className="text-muted-foreground mt-1 bg-muted/50 p-2 rounded text-xs">
                              {answer.observation}
                            </p>
                          )}
                          {answer?.photos && answer.photos.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {answer.photos.map((photo, i) => (
                                <img 
                                  key={i} 
                                  src={photo} 
                                  alt={`Foto ${i + 1}`} 
                                  className="w-16 h-16 object-cover rounded border"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* OK Items */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-success">Items sin problemas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {questions.filter(q => answers[q.id]?.response === true).map(question => (
                <li key={question.id} className="text-sm flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  <span>{question.question}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* General Observations */}
        {observacionesGenerales && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Observaciones Generales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {observacionesGenerales}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4">
        <div className="flex gap-3 max-w-lg mx-auto">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 h-12"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a editar
          </Button>
          <Button
            onClick={onSubmit}
            className="flex-1 h-12 bg-success hover:bg-success/90 text-success-foreground"
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar Checklist
          </Button>
        </div>
      </div>
    </main>
  );
}
