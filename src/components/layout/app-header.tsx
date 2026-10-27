import Image from "next/image";
import GWACalculator from "@/assets/images/gwa-calculator.jpg";

interface AppHeaderProps {
    appName: string;
    appVersion: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ appName, appVersion }) => (
    <div className="flex flex-row gap-2 items-center">
        <a href="https://www.yjaphzs.xyz/" target="_blank" rel="noopener noreferrer">
            <div className="bg-primary-foreground rounded-md overflow-hidden flex items-center self-start h-8 w-8">
                <Image
                    src={GWACalculator}
                    alt="GWA Calculator Logo"
                    width={32}
                    height={32}
                    className="size-full object-cover"
                    priority
                />
            </div>
        </a>
        <div className="flex flex-col text-left min-w-0">
            <h1 className="scroll-m-20 text-lg sm:text-xl font-extrabold tracking-tight m-0 p-0 truncate">
                {appName} <span className="text-xs font-mono font-light text-muted-foreground">v{appVersion}</span>
            </h1>
        </div>
    </div>
);

export default AppHeader;
