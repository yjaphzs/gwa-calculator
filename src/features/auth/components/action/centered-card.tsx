import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CenteredCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  children?: ReactNode;
}

/** Icon + title status card for the email-action outcomes. */
export function CenteredCard({ icon, title, description, children }: CenteredCardProps) {
  return (
    <Card className="p-2">
      <CardHeader className="items-center text-center">
        <div className="mx-auto mb-2 w-fit rounded-full bg-primary/10 p-3">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}
