"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "./profile-tab";
import { LeaderboardCard } from "./leaderboard-card";
import { SecurityTab } from "./security-tab";

export function AccountView() {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, password, and account.
        </p>
      </div>

      <Tabs defaultValue="profile" className="mt-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4 flex flex-col gap-6">
          <ProfileTab />
          <LeaderboardCard />
        </TabsContent>
        <TabsContent value="security" className="mt-4">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
