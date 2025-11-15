import { CheckIcon } from '@heroicons/react/24/outline';

const tiers = [
  {
    name: 'Starter',
    id: 'tier-starter',
    href: '/signup?plan=starter',
    priceMonthly: '$49',
    description: 'Perfect for individual developers and small projects.',
    features: [
      '10,000 API calls/month',
      '1GB memory storage',
      '5 concurrent tasks',
      'Community support',
      'Basic monitoring',
      'REST API access',
    ],
    featured: false,
  },
  {
    name: 'Professional',
    id: 'tier-professional',
    href: '/signup?plan=professional',
    priceMonthly: '$199',
    description: 'For teams building production applications.',
    features: [
      '100,000 API calls/month',
      '10GB memory storage',
      '50 concurrent tasks',
      'Priority support',
      'Advanced monitoring',
      'REST + WebSocket API',
      'Custom tools',
      'SSO integration',
    ],
    featured: true,
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    href: '/contact',
    priceMonthly: 'Custom',
    description: 'For organizations with advanced needs.',
    features: [
      'Unlimited API calls',
      'Unlimited memory storage',
      'Unlimited concurrent tasks',
      '24/7 dedicated support',
      'Custom SLAs',
      'On-premise deployment',
      'Custom integrations',
      'Training & onboarding',
      'Dedicated infrastructure',
      'Compliance assistance',
    ],
    featured: false,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Pricing() {
  return (
    <div className="bg-gray-50 py-24 sm:py-32" id="pricing">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Plans for every stage of growth
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Start free, scale as you grow. All plans include core features with 14-day money-back guarantee.
        </p>

        {/* Pricing Cards */}
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 xl:gap-x-12">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={classNames(
                tier.featured
                  ? 'ring-2 ring-blue-600 scale-105'
                  : 'ring-1 ring-gray-200',
                'rounded-3xl p-8 bg-white shadow-lg'
              )}
            >
              {tier.featured && (
                <p className="flex items-center justify-center gap-x-2 text-sm font-semibold leading-6 text-blue-600 mb-4">
                  <span className="rounded-full bg-blue-600/10 px-3 py-1">Most Popular</span>
                </p>
              )}

              <div className="flex items-center justify-between gap-x-4">
                <h3
                  id={tier.id}
                  className={classNames(
                    tier.featured ? 'text-blue-600' : 'text-gray-900',
                    'text-2xl font-bold leading-8'
                  )}
                >
                  {tier.name}
                </h3>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-600">{tier.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-5xl font-bold tracking-tight text-gray-900">
                  {tier.priceMonthly}
                </span>
                {tier.priceMonthly !== 'Custom' && (
                  <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
                )}
              </p>
              <a
                href={tier.href}
                aria-describedby={tier.id}
                className={classNames(
                  tier.featured
                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                    : 'text-blue-600 ring-1 ring-inset ring-blue-200 hover:ring-blue-300',
                  'mt-8 block rounded-lg px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                )}
              >
                {tier.priceMonthly === 'Custom' ? 'Contact sales' : 'Get started'}
              </a>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <div className="mt-16 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center shadow-xl lg:p-12">
          <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Need a custom solution?
          </h3>
          <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
            Our enterprise team can create a tailored plan that fits your specific requirements,
            including on-premise deployment and dedicated support.
          </p>
          <a
            href="/contact"
            className="mt-8 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Contact sales
          </a>
        </div>
      </div>
    </div>
  );
}
