import React, { useState, useEffect, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    QrCodeIcon,
    ScanLineIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CameraIcon,
    CameraOffIcon,
} from "lucide-react";
import type { Subject, Semester } from "@/types";

// QR code max safe payload (~2900 bytes binary). We use a conservative limit.
const QR_CHUNK_SIZE = 1800;

interface QrTransferDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subjects: Subject[];
    semesters: Semester[];
    autosave: boolean;
    onImport: (data: {
        subjects: Subject[];
        semesters: Semester[];
        autosave: boolean;
    }) => void;
}

function chunkString(str: string, size: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < str.length; i += size) {
        chunks.push(str.slice(i, i + size));
    }
    return chunks;
}

// --- Send (QR display) mode ---
function SendMode({ subjects, semesters, autosave }: {
    subjects: Subject[];
    semesters: Semester[];
    autosave: boolean;
}) {
    const [chunkIndex, setChunkIndex] = useState(0);

    const { chunks, compressed } = React.useMemo(() => {
        const payload = JSON.stringify({ subjects, semesters, autosave });
        const compressed = compressToEncodedURIComponent(payload);
        const chunks = chunkString(compressed, QR_CHUNK_SIZE);
        return { chunks, compressed };
    }, [subjects, semesters, autosave]);

    const totalChunks = chunks.length;

    const qrData = totalChunks === 1
        ? `GC1:${chunks[0]}`
        : `GC:${chunkIndex + 1}/${totalChunks}:${chunks[chunkIndex]}`;

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG
                    value={qrData}
                    size={256}
                    level={totalChunks > 1 ? "L" : "M"}
                />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{subjects.length} subjects</Badge>
                <Badge variant="outline">{semesters.length} semesters</Badge>
            </div>
            <p className="text-xs text-muted-foreground text-center">
                Compressed: {compressed.length.toLocaleString()} chars
                {totalChunks > 1 && ` • ${totalChunks} QR codes`}
            </p>
            {totalChunks > 1 && (
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon-sm"
                        disabled={chunkIndex === 0}
                        onClick={() => setChunkIndex((i) => i - 1)}
                    >
                        <ChevronLeftIcon className="size-4" />
                    </Button>
                    <span className="text-sm tabular-nums font-medium">
                        {chunkIndex + 1} / {totalChunks}
                    </span>
                    <Button
                        variant="outline"
                        size="icon-sm"
                        disabled={chunkIndex === totalChunks - 1}
                        onClick={() => setChunkIndex((i) => i + 1)}
                    >
                        <ChevronRightIcon className="size-4" />
                    </Button>
                </div>
            )}
            {totalChunks > 1 && (
                <p className="text-xs text-muted-foreground text-center">
                    Show each QR code one at a time for the receiving device to scan.
                </p>
            )}
        </div>
    );
}

// --- Receive (QR scan) mode ---
function ReceiveMode({ onImport, onClose }: {
    onImport: (data: {
        subjects: Subject[];
        semesters: Semester[];
        autosave: boolean;
    }) => void;
    onClose: () => void;
}) {
    const [scanning, setScanning] = useState(false);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [receivedChunks, setReceivedChunks] = useState<Map<number, string>>(new Map());
    const [totalChunks, setTotalChunks] = useState<number | null>(null);
    const scannerRef = useRef<InstanceType<typeof import("html5-qrcode")["Html5Qrcode"]> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const stateRef = useRef({ receivedChunks: new Map<number, string>(), totalChunks: null as number | null });

    const processComplete = useCallback((compressed: string) => {
        try {
            const json = decompressFromEncodedURIComponent(compressed);
            if (!json) throw new Error("Decompression failed");
            const data = JSON.parse(json);

            if (!Array.isArray(data.subjects) || !Array.isArray(data.semesters)) {
                throw new Error("Invalid data structure");
            }

            onImport(data);
            onClose();
        } catch {
            setError("Failed to decode QR data. Make sure you scanned all codes from the sending device.");
        }
    }, [onImport, onClose]);

    const handleScanResult = useCallback((text: string) => {
        setError(null);

        // Single-chunk format: GC1:<data>
        if (text.startsWith("GC1:")) {
            const compressed = text.slice(4);
            processComplete(compressed);
            return;
        }

        // Multi-chunk format: GC:<index>/<total>:<data>
        const match = text.match(/^GC:(\d+)\/(\d+):(.+)$/);
        if (!match) {
            setError("Unrecognized QR code format.");
            return;
        }

        const idx = parseInt(match[1], 10);
        const total = parseInt(match[2], 10);
        const chunk = match[3];

        stateRef.current.totalChunks = total;
        stateRef.current.receivedChunks.set(idx, chunk);

        setTotalChunks(total);
        setReceivedChunks(new Map(stateRef.current.receivedChunks));

        if (stateRef.current.receivedChunks.size === total) {
            // All chunks received — reassemble
            let compressed = "";
            for (let i = 1; i <= total; i++) {
                compressed += stateRef.current.receivedChunks.get(i) ?? "";
            }
            processComplete(compressed);
        }
    }, [processComplete]);

    const startScanner = useCallback(() => {
        setError(null);
        setReceivedChunks(new Map());
        setTotalChunks(null);
        stateRef.current = { receivedChunks: new Map(), totalChunks: null };
        setStarting(true);
    }, []);

    // Actually start the scanner after the container is visible
    useEffect(() => {
        if (!starting || scanning) return;
        let cancelled = false;

        (async () => {
            try {
                const { Html5Qrcode } = await import("html5-qrcode");
                if (cancelled) return;
                const scanner = new Html5Qrcode("qr-reader");
                scannerRef.current = scanner;

                await scanner.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    (decodedText) => handleScanResult(decodedText),
                    () => {}
                );
                if (cancelled) {
                    await scanner.stop().catch(() => {});
                    return;
                }
                setScanning(true);
            } catch {
                if (!cancelled) {
                    setError("Could not access camera. Please grant camera permission and try again.");
                    setStarting(false);
                }
            }
        })();

        return () => { cancelled = true; };
    }, [starting, scanning, handleScanResult]);

    const stopScanner = useCallback(async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch { /* ignore */ }
            scannerRef.current = null;
        }
        setScanning(false);
        setStarting(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {});
                scannerRef.current = null;
            }
        };
    }, []);

    return (
        <div className="flex flex-col items-center gap-4">
            <div
                id="qr-reader"
                ref={containerRef}
                className="w-full aspect-square rounded-lg overflow-hidden bg-muted [&_video]:w-full! [&_video]:h-full! [&_video]:object-cover!"
                style={{ display: (starting || scanning) ? "block" : "none" }}
            />

            {!starting && !scanning && (
                <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                        <ScanLineIcon className="size-12 mx-auto mb-2" />
                        <p className="text-sm">Press Start to open camera</p>
                    </div>
                </div>
            )}

            {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
            )}

            {totalChunks !== null && totalChunks > 1 && (
                <div className="text-sm text-muted-foreground text-center">
                    Scanned {receivedChunks.size} / {totalChunks} QR codes
                </div>
            )}

            <Button
                variant={scanning ? "destructive" : "default"}
                size="sm"
                disabled={starting && !scanning}
                onClick={scanning ? stopScanner : startScanner}
            >
                {scanning ? (
                    <><CameraOffIcon className="size-4" /> Stop Camera</>
                ) : (
                    <><CameraIcon className="size-4" /> Start Camera</>
                )}
            </Button>
        </div>
    );
}

// --- Main Dialog ---
const QrTransferDialog: React.FC<QrTransferDialogProps> = ({
    open,
    onOpenChange,
    subjects,
    semesters,
    autosave,
    onImport,
}) => {
    const [mode, setMode] = useState<"send" | "receive">("send");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>QR Transfer</DialogTitle>
                    <DialogDescription>
                        {mode === "send"
                            ? "Show this QR code on the sending device. Scan it with the receiving device."
                            : "Scan the QR code from the sending device to import data."}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-center gap-2 mb-2">
                    <Button
                        variant={mode === "send" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMode("send")}
                    >
                        <QrCodeIcon className="size-4" /> Send
                    </Button>
                    <Button
                        variant={mode === "receive" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMode("receive")}
                    >
                        <ScanLineIcon className="size-4" /> Receive
                    </Button>
                </div>

                {mode === "send" ? (
                    <SendMode
                        subjects={subjects}
                        semesters={semesters}
                        autosave={autosave}
                    />
                ) : (
                    <ReceiveMode
                        onImport={onImport}
                        onClose={() => onOpenChange(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default QrTransferDialog;
