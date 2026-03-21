import { Card, CardContent } from "@/components/ui/card";

interface Props {
  title: string;
  description: string;
}

export default function FeatureCard({ title, description }: Props) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="px-4 flex flex-col gap-3">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}
