import React from "react";

interface AppHeaderProps {
    appName: string;
    appVersion: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ appName, appVersion }) => (
    <div className="text-left">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
            {appName}
        </h1>
        <p className="text-sm">Version {appVersion}</p>
    </div>
);

export default AppHeader;
