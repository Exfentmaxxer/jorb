const testimonials = [
  {
    body: 'Jorb Core transformed how we build AI agents. The reasoning engine is incredibly powerful, and the memory system just works. Production-ready from day one.',
    author: {
      name: 'Sarah Chen',
      handle: 'CEO',
      company: 'TechCorp',
    },
  },
  {
    body: 'The plugin architecture is brilliant. We built custom tools for our specific needs in hours, not days. The sandboxed execution gives us confidence in production.',
    author: {
      name: 'Michael Rodriguez',
      handle: 'CTO',
      company: 'DataFlow Inc',
    },
  },
  {
    body: 'Best developer experience I have had with an AI framework. Documentation is stellar, API is intuitive, and the real-time updates are game-changing.',
    author: {
      name: 'Emily Watson',
      handle: 'Lead Engineer',
      company: 'CloudNative Co',
    },
  },
];

export default function Testimonials() {
  return (
    <div className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Loved by developers worldwide
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join thousands of teams building with Jorb Core
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="flex flex-col justify-between bg-white p-8 shadow-lg ring-1 ring-gray-200 rounded-2xl">
              <blockquote className="text-gray-900">
                <p className="text-lg leading-8">&ldquo;{testimonial.body}&rdquo;</p>
              </blockquote>
              <div className="mt-6">
                <div className="font-semibold text-gray-900">{testimonial.author.name}</div>
                <div className="text-sm text-gray-600">
                  {testimonial.author.handle} at {testimonial.author.company}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
