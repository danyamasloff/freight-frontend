import {cn} from "@/lib/utils.ts";
import React, {useRef, useState} from "react";
import {motion} from "framer-motion";
import {Upload} from "lucide-react";

const mainVariant = {
    initial: {
        x: 0,
        y: 0,
    },
    animate: {
        x: 20,
        y: -20,
        opacity: 0.9,
    },
};

const secondaryVariant = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
    },
};

export function FileUpload({
                               onChange,
                               className,
                           }: {
    onChange?: (files: File[]) => void;
    className?: string;
}) {
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragActive, setIsDragActive] = useState(false);

    const handleFileChange = (newFiles: File[]) => {
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        onChange && onChange(newFiles);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(true);
    };

    const handleDragLeave = () => {
        setIsDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(Array.from(e.dataTransfer.files));
        }
    };

    return (
        <div
            className={cn("w-full", className)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <motion.div
                onClick={handleClick}
                whileHover="animate"
                className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden border border-border"
            >
                <input
                    ref={fileInputRef}
                    id="file-upload-handle"
                    type="file"
                    onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
                    className="hidden"
                />
                <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
                    <GridPattern/>
                </div>
                <div className="flex flex-col items-center justify-center">
                    <p className="relative z-20 font-sans font-bold text-foreground text-base">
                        Загрузить файл
                    </p>
                    <p className="relative z-20 font-sans font-normal text-muted-foreground text-base mt-2">
                        Перетащите файл или нажмите для выбора
                    </p>
                    <div className="relative w-full mt-10 max-w-xl mx-auto">
                        {files.length > 0 &&
                            files.map((file, idx) => (
                                <motion.div
                                    key={"file" + idx}
                                    layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
                                    className={cn(
                                        "relative overflow-hidden z-40 bg-card border border-border flex flex-col items-start justify-start md:h-24 p-4 mt-4 w-full mx-auto rounded-md",
                                        "shadow-sm"
                                    )}
                                >
                                    <div className="flex justify-between w-full items-center gap-4">
                                        <motion.p
                                            initial={{opacity: 0}}
                                            animate={{opacity: 1}}
                                            layout
                                            className="text-base text-card-foreground truncate max-w-xs"
                                        >
                                            {file.name}
                                        </motion.p>
                                        <motion.p
                                            initial={{opacity: 0}}
                                            animate={{opacity: 1}}
                                            layout
                                            className="rounded-lg px-2 py-1 w-fit shrink-0 text-sm text-muted-foreground bg-muted shadow-sm"
                                        >
                                            {(file.size / (1024 * 1024)).toFixed(2)} МБ
                                        </motion.p>
                                    </div>

                                    <div
                                        className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-muted-foreground">
                                        <motion.p
                                            initial={{opacity: 0}}
                                            animate={{opacity: 1}}
                                            layout
                                            className="px-1 py-0.5 rounded-md bg-muted"
                                        >
                                            {file.type}
                                        </motion.p>

                                        <motion.p
                                            initial={{opacity: 0}}
                                            animate={{opacity: 1}}
                                            layout
                                        >
                                            изменено {new Date(file.lastModified).toLocaleDateString()}
                                        </motion.p>
                                    </div>
                                </motion.div>
                            ))}
                        {!files.length && (
                            <motion.div
                                layoutId="file-upload"
                                variants={mainVariant}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20,
                                }}
                                className={cn(
                                    "relative group-hover/file:shadow-2xl z-40 bg-card flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                                    "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                                )}
                            >
                                {isDragActive ? (
                                    <motion.p
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        className="text-muted-foreground flex flex-col items-center"
                                    >
                                        Оставить здесь
                                        <Upload className="h-4 w-4 text-muted-foreground mt-1"/>
                                    </motion.p>
                                ) : (
                                    <Upload className="h-4 w-4 text-muted-foreground"/>
                                )}
                            </motion.div>
                        )}

                        {!files.length && (
                            <motion.div
                                variants={secondaryVariant}
                                className="absolute opacity-0 border border-dashed border-primary inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
                            ></motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function GridPattern() {
    const columns = 41;
    const rows = 11;
    return (
        <div className="flex bg-muted/50 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
            {Array.from({length: rows}).map((_, row) =>
                Array.from({length: columns}).map((_, col) => {
                    const index = row * columns + col;
                    return (
                        <div
                            key={`${col}-${row}`}
                            className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
                                index % 2 === 0
                                    ? "bg-background"
                                    : "bg-background shadow-[0px_0px_1px_3px_rgba(255,255,255,0.1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,0.1)_inset]"
                            }`}
                        />
                    );
                })
            )}
        </div>
    );
}