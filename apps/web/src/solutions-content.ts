export const solutionsPageModel = {
  heading: "Technology that fits the work in front of you.",
  description:
    "Choose a ready-to-run business system, a custom-built product, or an automation layer that makes everyday work easier.",
  productAction: "Book a product demo",
  serviceAction: "Discuss a custom project",
  solutions: [
    {
      number: "01",
      type: "Ready business software",
      title: "Operational systems for growing businesses.",
      description:
        "Practical software for retail, operations, inventory, reporting, and the workflows that keep a business moving.",
      action: "Book a product demo",
      href: "/#contact",
    },
    {
      number: "02",
      type: "Custom engineering",
      title: "Products built around your business, not a template.",
      description:
        "Web applications, mobile experiences, and internal tools designed with the technical depth to grow with you.",
      action: "Discuss a custom project",
      href: "/#contact",
    },
    {
      number: "03",
      type: "AI and automation",
      title: "Less repetitive work. Better operational signals.",
      description:
        "Applied automation and AI systems that help teams respond faster and spend time where it matters.",
      action: "Explore automation",
      href: "/#contact",
    },
  ],
} as const;
