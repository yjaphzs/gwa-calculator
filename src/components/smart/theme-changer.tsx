import { useAppearance } from "@/hooks/use-appearance";
import { ThemeSwitcher as ThemeSwitcherIO } from "@/components/ui/shadcn-io/theme-switcher";

const ThemeSwitcher = () => {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <ThemeSwitcherIO value={appearance} onChange={updateAppearance} />
    );
};
export default ThemeSwitcher;
