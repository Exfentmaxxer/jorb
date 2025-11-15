export default function HowItWorks() {
  const steps = [
    { name: 'Initialize', description: 'Set up your agent with a goal and context.' },
    { name: 'Plan', description: 'Agent decomposes the task into executable steps.' },
    { name: 'Execute', description: 'Tools are selected and executed with automatic retries.' },
    { name: 'Reflect', description: 'Agent reviews results and adapts the plan if needed.' },
    { name: 'Complete', description: 'Final results are delivered with full execution history.' },
  ];

  return (
    <div className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Jorb Core's reasoning engine follows a structured approach to task execution
          </p>
        </div>
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-5">
            {steps.map((step, idx) => (
              <div key={step.name} className="text-center">
                <div className="flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                    {idx + 1}
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{step.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
