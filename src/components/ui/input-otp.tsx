import * as React from "react";
import { cn } from "../../lib/utils";

interface InputOTPProps {
    value: string;
    onChange: (value: string) => void;
    length?: number;
    disabled?: boolean;
    className?: string;
    error?: boolean;
}

export const InputOTP: React.FC<InputOTPProps> = ({
    value,
    onChange,
    length = 6,
    disabled,
    className,
    error,
}) => {
    const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);

    const safeValue = (value || "").padEnd(length, "").slice(0, length);

    const handleChange = (index: number, next: string) => {
        const char = next.slice(-1).replace(/[^0-9]/g, "");
        if (next && !char) return;

        const chars = safeValue.split("");
        chars[index] = char;
        const newValue = chars.join("");
        onChange(newValue.trimEnd());

        if (char && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
        const currentChar = safeValue[index];

        if (event.key === "Backspace" && !currentChar && index > 0) {
            event.preventDefault();
            inputsRef.current[index - 1]?.focus();
        }

        if (event.key === "ArrowLeft" && index > 0) {
            event.preventDefault();
            inputsRef.current[index - 1]?.focus();
        }

        if (event.key === "ArrowRight" && index < length - 1) {
            event.preventDefault();
            inputsRef.current[index + 1]?.focus();
        }
    };

    return (
        <div className={cn("flex gap-2", className)}>
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        inputsRef.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={safeValue[index] ?? ""}
                    onChange={(event) => handleChange(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onFocus={(event) => event.currentTarget.select()}
                    disabled={disabled}
                    className={cn(
                        "h-10 w-10 rounded-md text-center text-lg font-medium transition-colors",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        error
                            ? "border-2 border-red-500 bg-red-50 text-red-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500"
                            : "border border-blue-400 bg-white/80 text-blue-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500",
                    )}
                />
            ))}
        </div>
    );
};
