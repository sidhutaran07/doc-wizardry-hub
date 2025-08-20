import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

const ToolCard = ({ icon: Icon, title, description, features, highlighted = false }: ToolCardProps) => {
  return (
    <Card className={`
      group relative overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-2
      ${highlighted ? 'ring-2 ring-primary shadow-glow' : 'shadow-card'}
      bg-gradient-card border-border/50
    `}>
      {highlighted && (
        <div className="absolute top-0 right-0 bg-gradient-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
          Popular
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <div className={`
          w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300
          ${highlighted 
            ? 'bg-gradient-primary text-primary-foreground shadow-glow' 
            : 'bg-gradient-subtle text-primary group-hover:bg-gradient-primary group-hover:text-primary-foreground'
          }
        `}>
          <Icon className="w-8 h-8" />
        </div>
        
        <CardTitle className="text-xl font-bold text-foreground mb-2">
          {title}
        </CardTitle>
        
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        
        <Button 
          variant="tool" 
          className="w-full group-hover:bg-gradient-primary group-hover:text-primary-foreground group-hover:border-primary"
        >
          Use Tool
        </Button>
      </CardContent>
    </Card>
  );
};

export default ToolCard;