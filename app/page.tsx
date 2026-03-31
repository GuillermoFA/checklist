"use client";

import { useState } from "react";
import { RoleSelection } from "@/components/role-selection";
import { DriverChecklist } from "@/components/driver-checklist";
import { PreventionDashboard } from "@/components/prevention-dashboard";

export type UserRole = "none" | "conductor" | "prevencionista";

export default function Home() {
  const [role, setRole] = useState<UserRole>("none");

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
  };

  const handleBack = () => {
    setRole("none");
  };

  if (role === "conductor") {
    return <DriverChecklist onBack={handleBack} />;
  }

  if (role === "prevencionista") {
    return <PreventionDashboard onBack={handleBack} />;
  }

  return <RoleSelection onRoleSelect={handleRoleSelect} />;
}
