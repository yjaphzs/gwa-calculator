"use client";

import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signOut } from "@/lib/firebase/auth";

export function SignOutCard() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign out</CardTitle>
        <CardDescription>
          Sign out on this device. Your saved data stays in your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          onClick={async () => {
            await signOut();
            router.replace("/");
          }}
        >
          <LogOutIcon />
          Sign out
        </Button>
      </CardContent>
    </Card>
  );
}
