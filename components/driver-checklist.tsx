"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Check, 
  X, 
  Camera, 
  ChevronRight, 
  ChevronLeft,
  AlertTriangle,
  Eye,
  Trash2,
  Lightbulb,
  CircleCheck,
  Wrench,
  Shield,
  FileText,
  Car,
  Droplets,
  Disc,
  Navigation
} from "lucide-react";
import { 
  questions, 
  categories, 
  saveDraft, 
  getStoredDraft, 
  clearDraft,
  saveSubmission,
  type Answer,
  type ChecklistSubmission
} from "@/lib/checklist-data";
import { ProgressCircle } from "@/components/progress-circle";
import { ChecklistReview } from "@/components/checklist-review";

interface DriverChecklistProps {
  onBack: () => void;
}

interface VehicleInfo {
  patente: string;
  numeroMovil: string;
  conductor: string;
  kilometraje: string;
  proximaMantencion: string;
}

type ChecklistStep = "info" | "checklist" | "review";

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  "Luces": <Lightbulb className="w-8 h-8 text-amber-500" />,
  "Neumáticos": <Disc className="w-8 h-8 text-slate-600" />,
  "Seguridad": <Shield className="w-8 h-8 text-blue-500" />,
  "Herramientas": <Wrench className="w-8 h-8 text-slate-500" />,
  "Visibilidad": <Eye className="w-8 h-8 text-sky-500" />,
  "Fluidos": <Droplets className="w-8 h-8 text-cyan-500" />,
  "Frenos": <Disc className="w-8 h-8 text-red-500" />,
  "Dirección": <Navigation className="w-8 h-8 text-indigo-500" />,
  "Documentación": <FileText className="w-8 h-8 text-emerald-500" />,
  "Carrocería": <Car className="w-8 h-8 text-orange-500" />
};

// Large icons for individual questions
const categoryLargeIcons: Record<string, React.ReactNode> = {
  "Luces": <Lightbulb className="w-16 h-16 text-amber-500" />,
  "Neumáticos": <Disc className="w-16 h-16 text-slate-600" />,
  "Seguridad": <Shield className="w-16 h-16 text-blue-500" />,
  "Herramientas": <Wrench className="w-16 h-16 text-slate-500" />,
  "Visibilidad": <Eye className="w-16 h-16 text-sky-500" />,
  "Fluidos": <Droplets className="w-16 h-16 text-cyan-500" />,
  "Frenos": <Disc className="w-16 h-16 text-red-500" />,
  "Dirección": <Navigation className="w-16 h-16 text-indigo-500" />,
  "Documentación": <FileText className="w-16 h-16 text-emerald-500" />,
  "Carrocería": <Car className="w-16 h-16 text-orange-500" />
};

// Loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-primary-foreground/30 rounded-full animate-pulse" />
        <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-primary-foreground rounded-full animate-spin" />
      </div>
      <p className="mt-6 text-primary-foreground text-xl font-bold">Cargando checklist...</p>
    </div>
  );
}

export function DriverChecklist({ onBack }: DriverChecklistProps) {
  const [step, setStep] = useState<ChecklistStep>("info");
  const [isLoading, setIsLoading] = useState(true);
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    patente: "",
    numeroMovil: "",
    conductor: "",
    kilometraje: "",
    proximaMantencion: ""
  });
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [observacionesGenerales, setObservacionesGenerales] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load draft on mount
  useEffect(() => {
    const draft = getStoredDraft();
    if (draft) {
      if (draft.patente) setVehicleInfo({
        patente: draft.patente || "",
        numeroMovil: draft.numeroMovil || "",
        conductor: draft.conductor || "",
        kilometraje: draft.kilometraje || "",
        proximaMantencion: draft.proximaMantencion || ""
      });
      if (draft.answers) {
        const answersMap: Record<string, Answer> = {};
        draft.answers.forEach((a: Answer) => {
          answersMap[a.questionId] = a;
        });
        setAnswers(answersMap);
      }
      if (draft.observacionesGenerales) setObservacionesGenerales(draft.observacionesGenerales);
      if (draft.patente && draft.conductor) {
        setStep("checklist");
      }
    }
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  // Auto-save every 30 seconds
  const saveDraftData = useCallback(() => {
    const draftData: Partial<ChecklistSubmission> = {
      ...vehicleInfo,
      answers: Object.values(answers),
      observacionesGenerales,
      status: "draft"
    };
    saveDraft(draftData);
    setLastSaved(new Date());
  }, [vehicleInfo, answers, observacionesGenerales]);

  useEffect(() => {
    const interval = setInterval(saveDraftData, 30000);
    return () => clearInterval(interval);
  }, [saveDraftData]);

  const handleVehicleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    saveDraftData();
    setTimeout(() => {
      setStep("checklist");
      setIsLoading(false);
    }, 500);
  };

  const handleAnswer = (questionId: string, response: boolean) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        response,
        observation: prev[questionId]?.observation || "",
        priority: prev[questionId]?.priority,
        photos: prev[questionId]?.photos || [],
        timestamp: new Date().toISOString()
      }
    }));
  };

  const handleObservation = (questionId: string, observation: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        observation,
        timestamp: new Date().toISOString()
      }
    }));
  };

  const handlePriority = (questionId: string, priority: 'baja' | 'media' | 'alta') => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        priority,
        timestamp: new Date().toISOString()
      }
    }));
  };

  const handlePhotoUpload = (questionId: string, files: FileList | null) => {
    if (!files) return;
    
    const currentPhotos = answers[questionId]?.photos || [];
    if (currentPhotos.length >= 3) return;

    const remainingSlots = 3 - currentPhotos.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnswers(prev => ({
          ...prev,
          [questionId]: {
            ...prev[questionId],
            questionId,
            photos: [...(prev[questionId]?.photos || []), reader.result as string],
            timestamp: new Date().toISOString()
          }
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (questionId: string, photoIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        photos: prev[questionId]?.photos?.filter((_, i) => i !== photoIndex) || []
      }
    }));
  };

  const answeredCount = Object.values(answers).filter(a => a.response !== null && a.response !== undefined).length;
  const totalQuestions = questions.length;
  const currentCategory = categories[currentCategoryIndex];
  const currentQuestions = questions.filter(q => q.category === currentCategory);
  
  // Check if all questions in current section are answered
  const sectionAnsweredCount = currentQuestions.filter(q => {
    const ans = answers[q.id];
    return ans?.response !== null && ans?.response !== undefined;
  }).length;
  const isSectionComplete = sectionAnsweredCount === currentQuestions.length;
  const isLastSection = currentCategoryIndex === categories.length - 1;
  const isFirstSection = currentCategoryIndex === 0;

  const handleSubmit = () => {
    const submission: ChecklistSubmission = {
      id: `checklist_${Date.now()}`,
      ...vehicleInfo,
      fecha: new Date().toISOString().split('T')[0],
      answers: Object.values(answers),
      observacionesGenerales,
      createdAt: new Date().toISOString(),
      status: "completed"
    };
    saveSubmission(submission);
    clearDraft();
    alert("Checklist enviado correctamente");
    onBack();
  };

  const goToNextSection = () => {
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevSection = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (step === "info") {
    return (
      <main className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-primary text-primary-foreground p-4 flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-primary-foreground/10 active:bg-primary-foreground/20">
            <ArrowLeft className="w-7 h-7" />
          </button>
          <h1 className="text-xl font-bold">Datos del Vehículo</h1>
        </header>

        <form onSubmit={handleVehicleInfoSubmit} className="p-5 space-y-5 max-w-lg mx-auto">
          <div className="space-y-4 bg-card rounded-2xl p-5 shadow-sm border">
            <div className="space-y-2">
              <Label htmlFor="patente" className="text-lg font-bold text-foreground">Patente</Label>
              <Input
                id="patente"
                value={vehicleInfo.patente}
                onChange={(e) => setVehicleInfo(prev => ({ ...prev, patente: e.target.value.toUpperCase() }))}
                placeholder="Ej: ABCD-12"
                className="h-16 text-xl font-semibold uppercase text-center tracking-wider"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroMovil" className="text-lg font-bold text-foreground">Número de Móvil</Label>
              <Input
                id="numeroMovil"
                value={vehicleInfo.numeroMovil}
                onChange={(e) => setVehicleInfo(prev => ({ ...prev, numeroMovil: e.target.value }))}
                placeholder="Ej: 28"
                className="h-16 text-xl font-semibold text-center"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conductor" className="text-lg font-bold text-foreground">Nombre del Conductor</Label>
              <Input
                id="conductor"
                value={vehicleInfo.conductor}
                onChange={(e) => setVehicleInfo(prev => ({ ...prev, conductor: e.target.value }))}
                placeholder="Nombre completo"
                className="h-16 text-xl font-semibold"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kilometraje" className="text-lg font-bold text-foreground">Kilometraje Actual</Label>
              <Input
                id="kilometraje"
                value={vehicleInfo.kilometraje}
                onChange={(e) => setVehicleInfo(prev => ({ ...prev, kilometraje: e.target.value }))}
                placeholder="Ej: 150000"
                className="h-16 text-xl font-semibold text-center"
                type="number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proximaMantencion" className="text-lg font-bold text-foreground">Próxima Mantención (km)</Label>
              <Input
                id="proximaMantencion"
                value={vehicleInfo.proximaMantencion}
                onChange={(e) => setVehicleInfo(prev => ({ ...prev, proximaMantencion: e.target.value }))}
                placeholder="Ej: 160000"
                className="h-16 text-xl font-semibold text-center"
                type="number"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-16 text-xl font-bold bg-primary rounded-2xl">
            Iniciar Checklist
            <ChevronRight className="w-6 h-6 ml-2" />
          </Button>
        </form>
      </main>
    );
  }

  if (step === "review") {
    return (
      <ChecklistReview
        vehicleInfo={vehicleInfo}
        answers={answers}
        observacionesGenerales={observacionesGenerales}
        onBack={() => setStep("checklist")}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Sticky Top Bar */}
      <header className="sticky top-0 z-20 bg-primary text-primary-foreground p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="p-2 -ml-2 rounded-full hover:bg-primary-foreground/10 active:bg-primary-foreground/20"
          >
            <ArrowLeft className="w-7 h-7" />
          </button>
          <ProgressCircle current={answeredCount} total={totalQuestions} />
        </div>
      </header>

      {/* Scrollable Questions Container */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto pb-32"
      >
        {/* Section Indicator (Scrolls with content) */}
        <div className="bg-primary text-primary-foreground px-4 pb-4 rounded-b-3xl shadow-lg mb-6">
          <div className="flex items-center gap-3 bg-primary-foreground/10 rounded-2xl p-3">
            <div className="w-12 h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
              {categoryIcons[currentCategory] || <CircleCheck className="w-8 h-8" />}
            </div>
            <div className="flex-1">
              <p className="text-primary-foreground/70 text-sm font-medium">
                Sección {currentCategoryIndex + 1} de {categories.length}
              </p>
              <p className="text-primary-foreground font-bold text-lg">
                {currentCategory}
              </p>
            </div>
            <div className="text-right">
              <p className="text-primary-foreground font-bold text-lg">
                {sectionAnsweredCount}/{currentQuestions.length}
              </p>
              <p className="text-primary-foreground/70 text-xs font-medium">
                respondidas
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {currentQuestions.map((question, idx) => {
            const answer = answers[question.id];
            const isNo = answer?.response === false;
            const isAnswered = answer?.response !== null && answer?.response !== undefined;

            return (
              <div 
                key={question.id}
                className={`bg-card rounded-2xl shadow-sm border-2 overflow-hidden transition-all ${
                  isAnswered 
                    ? answer?.response 
                      ? "border-emerald-200" 
                      : "border-red-200"
                    : "border-transparent"
                }`}
              >
                {/* Question Card Content */}
                <div className="p-5">
                  {/* Question Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-muted-foreground">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      {question.critical && (
                        <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold mb-2">
                          <AlertTriangle className="w-3 h-3" />
                          Crítico
                        </div>
                      )}
                      <h3 className="text-lg font-bold text-foreground leading-tight">
                        {question.question}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {question.hint}
                      </p>
                    </div>
                  </div>

                  {/* Answer Buttons - Circular Style */}
                  <div className="flex items-center justify-center gap-6">
                    <button
                      type="button"
                      onClick={() => handleAnswer(question.id, true)}
                      className={`w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center transition-all transform active:scale-95 ${
                        answer?.response === true
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105"
                          : "bg-white border-4 border-emerald-500 text-emerald-500 hover:bg-emerald-50"
                      }`}
                    >
                      <Check className="w-7 h-7" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAnswer(question.id, false)}
                      className={`w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center transition-all transform active:scale-95 ${
                        answer?.response === false
                          ? "bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105"
                          : "bg-white border-4 border-gray-300 text-gray-400 hover:border-red-300 hover:text-red-400"
                      }`}
                    >
                      <X className="w-7 h-7" />
                    </button>
                  </div>

                  {/* Labels */}
                  <div className="flex items-center justify-center gap-12 mt-2">
                    <span className="text-base font-bold text-emerald-600">SÍ</span>
                    <span className="text-base font-bold text-gray-500">NO</span>
                  </div>
                </div>

                {/* Observation Section (when No is selected) */}
                {isNo && (
                  <div className="bg-red-50 border-t-2 border-red-200 p-4 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-base font-bold text-red-700">Observación (opcional)</Label>
                      <Textarea
                        value={answer?.observation || ""}
                        onChange={(e) => handleObservation(question.id, e.target.value)}
                        placeholder="Describe el problema encontrado..."
                        className="min-h-[80px] text-base bg-white"
                      />
                    </div>

                    {/* Priority selector */}
                    {answer?.observation && (
                      <div className="space-y-2">
                        <Label className="text-base font-bold text-red-700">Prioridad</Label>
                        <div className="flex gap-2">
                          {(['baja', 'media', 'alta'] as const).map((priority) => (
                            <Button
                              key={priority}
                              type="button"
                              onClick={() => handlePriority(question.id, priority)}
                              className={`flex-1 h-11 capitalize font-bold ${
                                answer?.priority === priority
                                  ? priority === 'alta'
                                    ? "bg-red-500 text-white"
                                    : priority === 'media'
                                    ? "bg-amber-500 text-white"
                                    : "bg-emerald-500 text-white"
                                  : "bg-white text-gray-600 border-2 border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              {priority}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Photo upload */}
                    <div className="space-y-2">
                      <Label className="text-base font-bold text-red-700">
                        Fotos (opcional, máx. 3)
                      </Label>
                      <div className="flex gap-3 flex-wrap">
                        {answer?.photos?.map((photo, index) => (
                          <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-red-200">
                            <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                              onClick={() => handleRemovePhoto(question.id, index)}
                              className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full shadow-lg"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {(!answer?.photos || answer.photos.length < 3) && (
                          <label className="w-20 h-20 border-2 border-dashed border-red-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-100/50 transition-colors">
                            <Camera className="w-6 h-6 text-red-400" />
                            <span className="text-xs text-red-400 font-semibold mt-1">Agregar</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              multiple
                              className="hidden"
                              onChange={(e) => handlePhotoUpload(question.id, e.target.files)}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t-2 p-4 shadow-lg z-30">
        {lastSaved && (
          <p className="text-xs text-muted-foreground text-center mb-2">
            Guardado: {lastSaved.toLocaleTimeString()}
          </p>
        )}
        
        <div className="flex gap-3 max-w-lg mx-auto">
          {!isFirstSection && (
            <Button
              variant="outline"
              onClick={goToPrevSection}
              className="h-14 px-5 rounded-xl font-bold text-base"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Anterior
            </Button>
          )}
          
          {!isLastSection ? (
            <Button
              onClick={goToNextSection}
              disabled={!isSectionComplete}
              className="flex-1 h-14 rounded-xl font-bold text-base bg-primary"
            >
              {isSectionComplete ? (
                <>
                  Siguiente Sección
                  <ChevronRight className="w-5 h-5 ml-1" />
                </>
              ) : (
                <>
                  Responde todas ({sectionAnsweredCount}/{currentQuestions.length})
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setStep("review")}
              className="flex-1 h-14 rounded-xl font-bold text-base bg-primary"
              disabled={answeredCount < totalQuestions}
            >
              <Eye className="w-5 h-5 mr-2" />
              Revisar ({answeredCount}/{totalQuestions})
            </Button>
          )}
        </div>

        {/* Section Progress Dots */}
        <div className="flex justify-center gap-2 mt-3">
          {categories.map((cat, idx) => {
            const catQuestions = questions.filter(q => q.category === cat);
            const catAnswered = catQuestions.filter(q => {
              const ans = answers[q.id];
              return ans?.response !== null && ans?.response !== undefined;
            }).length;
            const isComplete = catAnswered === catQuestions.length;
            const isCurrent = idx === currentCategoryIndex;
            
            return (
              <button
                key={cat}
                onClick={() => {
                  setCurrentCategoryIndex(idx);
                  scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  isCurrent 
                    ? "bg-primary scale-125 ring-2 ring-primary/30" 
                    : isComplete 
                    ? "bg-emerald-500" 
                    : catAnswered > 0
                    ? "bg-amber-400"
                    : "bg-gray-300"
                }`}
                title={cat}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}
