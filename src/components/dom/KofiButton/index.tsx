import React from "react";
import "@/components/dom/KofiButton/style.scss";

const known_presets = [
    "",
    "default",
    "thin",
    "skinny",
    "circle",
    "no_background",
];

const colors = {
    kofiWhite: "#FFF",
    kofiBlack: "#000",
    kofiRed: "#FF5E5B",
    kofiBlue: "#13C3FF",
    kofiYellow: "#FBAA19",
    kofiGrey: "#434B57",
};

function kofiColors(color: string = "kofiBlue") {
    return colors[color as keyof typeof colors] || color;
}

interface KofiButtonProps {
    username?: string;
    label?: string;
    title?: string;
    preset?: "" | "default" | "thin" | "skinny" | "circle" | "no_background";
    backgroundColor?: string;
    animation?: boolean | "true" | "false" | "on_hover";
}

const KofiButton: React.FC<KofiButtonProps> = ({
    username = "costasak",
    label = "Support Me on Ko-fi",
    title = "",
    preset = "",
    backgroundColor = "kofiBlue",
    animation = true,
}) => {
    const profile_url = "https://ko-fi.com/" + username;

    let presetClass = preset;
    if (preset && !known_presets.includes(preset)) {
        console.warn(`Unknown preset "${preset}", reverting to default`);
        presetClass = "";
    }
    if (presetClass === "default") {
        presetClass = "";
    }

    return (
        <div
            className="KofiContainer"
            style={{ ["--background-color" as any]: kofiColors(backgroundColor) }}
        >
            <a
                className={"KofiButton " + presetClass}
                href={profile_url}
                target="_blank"
                rel="noreferrer noopener external"
                title={title}
            >
                <figure className="KofiImageContainer">
                    <img
                        className={"KofiImage animation_" + animation}
                        alt="Support me on Ko-fi"
                        src="https://cdn.ko-fi.com/cdn/kofi5.png"
                    />
                </figure>
                {label && <span className="KofiText">{label}</span>}
            </a>
        </div>
    );
};

export default KofiButton;