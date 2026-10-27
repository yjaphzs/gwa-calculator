import React from "react";
import { Badge } from "@/components/ui/badge";
import { Medal } from "lucide-react";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";

interface GwaSummaryProps {
    gwa: number | null;
    honor: string | null;
    semestersCount: number;
}

const GwaSummary: React.FC<GwaSummaryProps> = ({
    gwa,
    honor,
    semestersCount,
}) => (
    <div
        className={`flex flex-col gap-2 border border-dashed bg-muted/30 rounded-lg w-full py-12 px-8 ${
            semestersCount > 0 ? "mt-4" : "mt-8"
        }`}
    >
        <div className="flex justify-end">
            {honor && (
                <Badge variant="secondary">
                    <Medal className="text-primary" />
                    {honor}
                </Badge>
            )}
        </div>
        <div className="flex items-center justify-between">
            <CopyButton
                variant="default"
                size="lg"
                content={gwa !== null && gwa !== 0 ? gwa.toFixed(3) : "0"}
            />
            <div className="text-end text-6xl font-mono font-bold">
                {gwa !== null && gwa !== 0 ? gwa.toFixed(3) : "0"}
            </div>
        </div>
    </div>
);

export default GwaSummary;
