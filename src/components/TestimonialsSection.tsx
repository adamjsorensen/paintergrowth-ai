
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Michael Johnson",
      company: "Johnson Painting Co.",
      testimonial:
        "Paintergrowth.ai has completely transformed how I market my painting business. In just 3 months, I've doubled my leads without spending more time on marketing.",
      rating: 5,
      image: "/placeholder.svg",
    },
    {
      name: "Sarah Williams",
      company: "Williams & Sons Painters",
      testimonial:
        "The content generator has saved me countless hours. What used to take me days now takes minutes, and the quality is actually better than what I was creating manually.",
      rating: 5,
      image: "/placeholder.svg",
    },
    {
      name: "Robert Chen",
      company: "Premier Painting Solutions",
      testimonial:
        "As someone who struggled with marketing, Paintergrowth.ai has been a game-changer. Now I can focus on what I do best while the AI handles my content needs.",
      rating: 5,
      image: "/placeholder.svg",
    },
  ];

  return (
    <section className="py-20" id="testimonials">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-paintergrowth-900 mb-4">
            What Painting Contractors Are Saying
          </h2>
          <p className="text-muted-foreground text-lg">
            Don't just take our word for it. Here's what other painting professionals have experienced
            with Paintergrowth.ai.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-paintergrowth-100 overflow-hidden mr-4">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-paintergrowth-800">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {testimonial.company}
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-paintergrowth-400 text-paintergrowth-400"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.testimonial}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
