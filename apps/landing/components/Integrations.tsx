export default function Integrations() {
  return (
    <div className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Integrations</h2>
          <p className="mt-4 text-lg text-gray-600">
            Connect with your favorite tools and services
          </p>
        </div>
        <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
          {['OpenAI', 'ChromaDB', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'].map((integration) => (
            <div
              key={integration}
              className="flex items-center justify-center rounded-lg bg-white p-8 shadow"
            >
              <span className="text-gray-900 font-semibold">{integration}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
