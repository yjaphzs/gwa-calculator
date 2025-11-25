import React from "react";
import JPBLogo from "@/assets/images/jpb-logo.jpg";

interface AppHeaderProps {
    appName: string;
    appVersion: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ appName, appVersion }) => (
    <div className="flex flex-row gap-2 items-center">
        <div className="bg-primary-foreground p-2 rounded-md flex items-center self-start">
            <img
                src={JPBLogo}
                alt="JPB Logo"
                className="h-5 w-5"
            />
        </div>
        <div className="flex flex-col text-left">
            <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight text-balance m-0 p-0">
                {appName} <span className="text-xs font-mono font-light">v{appVersion}</span>
            </h1>
            
        </div>
    </div>
);

export default AppHeader;
