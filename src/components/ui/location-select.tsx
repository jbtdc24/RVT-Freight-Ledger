"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { State, City } from "country-state-city";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface LocationSelectProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function LocationSelect({
    value = "",
    onChange,
    placeholder = "Select Location",
    className,
}: LocationSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    // Parse initial value to extract State and City or initialize
    const parsedValue = value.split(", ");
    const initialStateCode = parsedValue.length === 2 ? parsedValue[1] : "";
    const initialCityName = parsedValue.length === 2 ? parsedValue[0] : "";

    const [selectedStateCode, setSelectedStateCode] = useState(initialStateCode);
    const [selectedCityName, setSelectedCityName] = useState(initialCityName);

    // States
    const usStates = useMemo(() => State.getStatesOfCountry("US"), []);

    // Cities for selected state
    const cities = useMemo(() => {
        if (!selectedStateCode) return [];
        return City.getCitiesOfState("US", selectedStateCode);
    }, [selectedStateCode]);

    useEffect(() => {
        if (selectedCityName && selectedStateCode) {
            if (`${selectedCityName}, ${selectedStateCode}` !== value) {
                onChange(`${selectedCityName}, ${selectedStateCode}`);
            }
        } else if (!selectedCityName && !selectedStateCode) {
            if (value !== "") onChange("");
        }
    }, [selectedCityName, selectedStateCode, onChange, value]);

    // Handle external value changes (e.g., from form resets)
    useEffect(() => {
        if (value) {
            const parts = value.split(", ");
            if (parts.length === 2) {
                const c = parts[0];
                const s = parts[1];
                if (c !== selectedCityName) setSelectedCityName(c);
                if (s !== selectedStateCode) setSelectedStateCode(s);
            }
        } else {
            setSelectedCityName("");
            setSelectedStateCode("");
        }
    }, [value]);

    const displayedValue = selectedCityName && selectedStateCode
        ? `${selectedCityName}, ${selectedStateCode}`
        : "";

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between font-medium",
                        !displayedValue && "text-muted-foreground",
                        className
                    )}
                >
                    {displayedValue ? (
                        <div className="flex items-center truncate">
                            <MapPin className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <span className="truncate">{displayedValue}</span>
                        </div>
                    ) : (
                        placeholder
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                {!selectedStateCode ? (
                    // Select State Phase
                    <Command>
                        <CommandInput placeholder="Search State..." />
                        <CommandList>
                            <CommandEmpty>No state found.</CommandEmpty>
                            <CommandGroup heading="Select a State">
                                {usStates.map((state) => (
                                    <CommandItem
                                        key={state.isoCode}
                                        value={`${state.name} (${state.isoCode})`}
                                        onSelect={() => {
                                            setSelectedStateCode(state.isoCode);
                                            setSelectedCityName(""); // reset city
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedStateCode === state.isoCode ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {state.name} ({state.isoCode})
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                ) : (
                    // Select City Phase
                    <Command>
                        <CommandInput
                            placeholder="Search City..."
                            value={query}
                            onValueChange={setQuery}
                        />
                        <CommandList>
                            <CommandEmpty>
                                {query ? (
                                    <Button
                                        variant="ghost"
                                        className="w-full text-xs"
                                        onClick={() => {
                                            setSelectedCityName(query.trim());
                                            setOpen(false);
                                        }}
                                    >
                                        Use "{query}"
                                    </Button>
                                ) : "No city found."}
                            </CommandEmpty>
                            <CommandGroup heading={`Cities in ${selectedStateCode}`}>
                                <CommandItem
                                    onSelect={() => {
                                        setSelectedStateCode("");
                                        setQuery("");
                                    }}
                                    className="text-xs text-muted-foreground italic"
                                >
                                    ← Back to States
                                </CommandItem>
                                {/* Due to potentially large city lists (e.g. TX has 1000+), limit to 100 items for performance, but filtered by query */}
                                {cities
                                    .filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
                                    .slice(0, 50)
                                    .map((city) => (
                                        <CommandItem
                                            key={city.name}
                                            value={city.name}
                                            onSelect={() => {
                                                setSelectedCityName(city.name);
                                                setOpen(false);
                                                setQuery("");
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedCityName === city.name ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {city.name}
                                        </CommandItem>
                                    ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                )}
            </PopoverContent>
        </Popover>
    );
}
