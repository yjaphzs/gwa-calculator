import React from "react";
import JPBLogo from "@/assets/images/jpb-logo.jpg";

interface AppHeaderProps {
    appName: string;
    appVersion: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ appName, appVersion }) => (
    <div className="flex flex-row gap-2 items-center">
        <a href="https://www.yjaphzs.xyz/" target="_blank" rel="noopener noreferrer">
            <div className="bg-primary-foreground rounded-md overflow-hidden flex items-center self-start h-8 w-8">
                <img
                    src={JPBLogo}
                    alt="JPB Logo"
                    className="object-cover"
                />
            </div>
        </a>
        <div className="flex flex-col text-left">
            <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight text-balance m-0 p-0">
                {appName} <span className="text-xs font-mono font-light">v{appVersion}</span>
            </h1>
            
        </div>
    </div>
);

export default AppHeader;
