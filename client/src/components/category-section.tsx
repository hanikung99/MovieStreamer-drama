import { Film, Heart, Laugh, Ghost, Rocket, Drama } from "lucide-react";

const categories = [
  { name: "Hành động", icon: Film, count: 245 },
  { name: "Lãng mạn", icon: Heart, count: 156 },
  { name: "Hài hước", icon: Laugh, count: 198 },
  { name: "Kinh dị", icon: Ghost, count: 89 },
  { name: "Khoa học viễn tưởng", icon: Rocket, count: 134 },
  { name: "Chính kịch", icon: Drama, count: 267 },
];

export default function CategorySection() {
  return (
    <section className="py-12 px-4 bg-muted/20">
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center" data-testid="categories-title">
          Danh mục phim
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <div
                key={category.name}
                className="bg-card rounded-lg p-6 text-center hover:bg-accent transition-colors cursor-pointer"
                data-testid={`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <IconComponent className="w-8 h-8 text-primary mb-3 mx-auto" />
                <h3 className="font-semibold" data-testid={`category-name-${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1" data-testid={`category-count-${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  {category.count} phim
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
