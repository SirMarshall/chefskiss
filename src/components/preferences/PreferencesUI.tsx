
import React, { useState, useRef, useEffect } from 'react';

// --- Types ---
interface TagInputProps {
    label: string;
    placeholder?: string;
    value: string[];
    onChange: (tags: string[]) => void;
    suggestions?: string[];
    color?: 'primary' | 'red' | 'gray';
}

interface PillSelectorProps {
    label: string;
    options: string[];
    value: string | string[]; // Can be single or multiple selection
    onChange: (value: string | string[]) => void;
    multiSelect?: boolean;
}

// --- Tag Input with Suggestions (e.g. Cuisines, Allergens) ---
export const SuggestionTagInput: React.FC<TagInputProps> = ({
    label,
    placeholder = "Type to add...",
    value,
    onChange,
    suggestions = [],
    color = 'primary'
}) => {
    const [inputValue, setInputValue] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleAdd = (tag: string) => {
        const trimmed = tag.trim();
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed]);
        }
        setInputValue("");
        setShowSuggestions(false);
    };

    const handleRemove = (tag: string) => {
        onChange(value.filter(t => t !== tag));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd(inputValue);
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            handleRemove(value[value.length - 1]);
        }
    };

    const filteredSuggestions = suggestions.filter(s =>
        !value.includes(s) && s.toLowerCase().includes(inputValue.toLowerCase())
    );

    // Color styles
    const tagStyles = {
        primary: "bg-primary text-white border-primary",
        red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/40",
        gray: "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    };

    return (
        <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest font-mono">
                {label}
            </label>

            {/* Selected Tags */}
            <div className="flex flex-wrap gap-2 mb-2">
                {value.map(tag => (
                    <span
                        key={tag}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all animate-in fade-in zoom-in duration-200 ${tagStyles[color]}`}
                    >
                        {tag}
                        <button
                            onClick={() => handleRemove(tag)}
                            className="hover:opacity-70 focus:outline-none"
                        >
                            <span className="material-symbols-outlined text-[10px] font-bold">close</span>
                        </button>
                    </span>
                ))}
            </div>

            {/* Input & Suggestions */}
            <div className="relative group">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full bg-white dark:bg-zinc-800/80 border border-gray-200 dark:border-gray-700 rounded-sm text-sm px-4 py-3 focus:outline-none focus:border-primary focus:ring-0 transition-colors placeholder-gray-300 dark:placeholder-gray-600 font-sans text-gray-900 dark:text-white"
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        <div className="p-2 flex flex-wrap gap-1">
                            {filteredSuggestions.map(suggestion => (
                                <button
                                    key={suggestion}
                                    onMouseDown={(e) => {
                                        // Use onMouseDown to prevent blur before click
                                        e.preventDefault();
                                        handleAdd(suggestion);
                                    }}
                                    className="px-3 py-1.5 text-left text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 rounded flex-grow sm:flex-grow-0 whitespace-nowrap"
                                >
                                    + {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Pill Selector (e.g. Diet, Spice Level) ---
export const PillSelector: React.FC<PillSelectorProps> = ({
    label,
    options,
    value,
    onChange,
    multiSelect = false
}) => {
    const isSelected = (option: string) => {
        if (multiSelect && Array.isArray(value)) {
            return value.includes(option);
        }
        return value === option;
    };

    const handleClick = (option: string) => {
        if (multiSelect && Array.isArray(value)) {
            if (value.includes(option)) {
                onChange(value.filter(v => v !== option));
            } else {
                onChange([...value, option]);
            }
        } else {
            onChange(option);
        }
    };

    return (
        <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest font-mono">
                {label}
            </label>
            <div className="flex flex-wrap gap-2">
                {options.map(option => (
                    <button
                        key={option}
                        onClick={() => handleClick(option)}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all font-mono ${isSelected(option)
                            ? 'bg-primary border-primary text-white shadow-sm'
                            : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary'
                            }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
};
