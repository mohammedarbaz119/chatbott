import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";

interface ColorPickerProps {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  onColorChange: (colorKey: string, color: string) => void;
}

export function ColorPicker({ colors, onColorChange }: ColorPickerProps) {
  return (
    <Card className="mt-4">
      <CardContent className="grid grid-cols-2 gap-4 p-4">
        {Object.entries(colors).map(([key, value]) => (
          <div key={key} className="flex flex-col items-start space-y-1.5">
            <label
              htmlFor={key}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
            <input
              id={key}
              type="color"
              value={value}
              onChange={(e) => onColorChange(key, e.target.value)}
              className="h-8 w-full cursor-pointer appearance-none rounded-md border bg-transparent"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
