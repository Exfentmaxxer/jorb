import {
  CpuChipIcon,
  CircleStackIcon,
  WrenchScrewdriverIcon,
  BoltIcon,
  ShieldCheckIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Advanced Reasoning Engine',
    description:
      'Multi-step task decomposition with reflection and self-correction. Plans, executes, and adapts autonomously.',
    icon: CpuChipIcon,
    color: 'bg-blue-500',
  },
  {
    name: 'Persistent Memory System',
    description:
      'Short-, mid-, and long-term memory with semantic search powered by ChromaDB. Never forget important context.',
    icon: CircleStackIcon,
    color: 'bg-purple-500',
  },
  {
    name: 'Extensible Tool System',
    description:
      'Plugin architecture with sandboxed execution, automatic retries, and circuit breakers. Build custom tools easily.',
    icon: WrenchScrewdriverIcon,
    color: 'bg-indigo-500',
  },
  {
    name: 'Real-time Streaming',
    description:
      'WebSocket support for live task updates and progress tracking. Monitor agent execution in real-time.',
    icon: BoltIcon,
    color: 'bg-yellow-500',
  },
  {
    name: 'Enterprise Security',
    description:
      'JWT authentication, rate limiting, audit logging, and input validation. Production-ready security out of the box.',
    icon: ShieldCheckIcon,
    color: 'bg-green-500',
  },
  {
    name: 'Comprehensive Monitoring',
    description:
      'Metrics, health checks, and performance tracking. OpenTelemetry integration for observability.',
    icon: ChartBarIcon,
    color: 'bg-red-500',
  },
];

export default function Features() {
  return (
    <div className="bg-white py-24 sm:py-32" id="features">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Enterprise-Grade Agentic Capabilities
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Built from the ground up for production use. Jorb Core provides all the components
            you need to build intelligent, autonomous agents.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${feature.color}`}>
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                  <p className="mt-6">
                    <a href="/docs" className="text-sm font-semibold leading-6 text-blue-600 hover:text-blue-500">
                      Learn more <span aria-hidden="true">→</span>
                    </a>
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Code Example */}
        <div className="mt-24">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Simple yet Powerful API
            </h3>
            <p className="mt-4 text-lg text-gray-600">
              Get started in minutes with our intuitive API
            </p>
          </div>

          <div className="rounded-2xl bg-gray-900 p-8 shadow-2xl ring-1 ring-gray-900/10 max-w-3xl mx-auto">
            <pre className="text-sm text-gray-300 overflow-x-auto">
              <code>{`// Create an intelligent agent task
const task = await client.tasks.create({
  title: "Analyze Q1 sales data and create report",
  description: "Generate insights and visualizations",
  priority: 5
});

// Subscribe to real-time updates
client.tasks.subscribe(task.id, (update) => {
  console.log(\`Progress: \${update.progress}%\`);
  console.log(\`Status: \${update.status}\`);
});

// Agent autonomously:
// - Plans multi-step approach
// - Retrieves relevant memories
// - Executes tools (data analysis, visualization)
// - Reflects and self-corrects
// - Delivers completed report`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
