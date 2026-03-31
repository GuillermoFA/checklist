"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, ShieldCheck, Lock, AlertCircle, Trash2 } from "lucide-react";
import type { UserRole } from "@/app/page";
import { clearDraft } from "@/lib/checklist-data";

interface RoleSelectionProps {
  onRoleSelect: (role: UserRole) => void;
}

const PREVENCION_PASSWORD = "yireh2024";

export function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handlePrevencionClick = () => {
    setShowPasswordInput(true);
    setError("");
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PREVENCION_PASSWORD) {
      onRoleSelect("prevencionista");
    } else {
      setError("Contraseña incorrecta");
      setPassword("");
    }
  };

  const handleCancelPassword = () => {
    setShowPasswordInput(false);
    setPassword("");
    setError("");
  };

  const handleConductorClick = () => {
    clearDraft();
    onRoleSelect("conductor");
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Truck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Checklist</h1>
          <p className="text-muted-foreground">Transportes Yireh</p>
        </div>

        {/* Role Cards */}
        {!showPasswordInput ? (
          <div className="space-y-4">
            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 active:scale-[0.98]"
              onClick={handleConductorClick}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-success/10">
                    <Truck className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Soy Conductor</CardTitle>
                    <CardDescription>Realizar checklist diario del vehículo</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full h-14 text-lg bg-success hover:bg-success/90 text-success-foreground">
                  Iniciar Checklist
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 active:scale-[0.98]"
              onClick={handlePrevencionClick}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Soy Prevencionista</CardTitle>
                    <CardDescription>Acceder a KPIs y reportes</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full h-14 text-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <Lock className="w-5 h-5 mr-2" />
                  Acceso Restringido
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Acceso Prevencionista</CardTitle>
                  <CardDescription>Ingrese la contraseña de acceso</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingrese contraseña"
                    className="h-12 text-lg"
                    autoFocus
                  />
                  {error && (
                    <div className="flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 h-12"
                    onClick={handleCancelPassword}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 bg-primary hover:bg-primary/90"
                    disabled={!password}
                  >
                    Ingresar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Sistema de Gestión de Checklist Vehicular v1.0
        </p>
      </div>
    </main>
  );
}
