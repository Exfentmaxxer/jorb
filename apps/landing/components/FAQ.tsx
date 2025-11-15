const faqs = [
  {
    question: 'What is Jorb Core?',
    answer:
      'Jorb Core is an enterprise-grade agentic operating system that enables you to build intelligent AI agents with advanced reasoning, persistent memory, and extensible tool execution capabilities.',
  },
  {
    question: 'How does the memory system work?',
    answer:
      'Jorb Core uses a multi-tiered memory system (short-, mid-, and long-term) powered by ChromaDB for semantic search. Memories are automatically consolidated, pruned, and retrieved based on relevance to current tasks.',
  },
  {
    question: 'Can I build custom tools?',
    answer:
      'Yes! Jorb Core has an extensible plugin architecture. You can create custom tools using our simple API, and they will be automatically loaded, validated, and executed in a sandboxed environment.',
  },
  {
    question: 'Is Jorb Core production-ready?',
    answer:
      'Absolutely. Jorb Core includes enterprise features like JWT authentication, rate limiting, audit logging, comprehensive monitoring, health checks, and automatic retries with circuit breakers.',
  },
  {
    question: 'What LLM providers are supported?',
    answer:
      'Currently, Jorb Core uses OpenAI for reasoning and embeddings. Support for additional providers (Anthropic Claude, local models via Ollama) is on our roadmap.',
  },
  {
    question: 'Can I deploy on-premise?',
    answer:
      'Yes! Enterprise customers can deploy Jorb Core on-premise using our Docker containers and Kubernetes Helm charts. Contact our sales team for details.',
  },
];

export default function FAQ() {
  return (
    <div className="bg-white py-24 sm:py-32" id="faq">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
          <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
            Frequently asked questions
          </h2>
          <dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
            {faqs.map((faq) => (
              <div key={faq.question} className="pt-6">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  {faq.question}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
