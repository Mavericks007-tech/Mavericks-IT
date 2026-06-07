'use client';

import { useEffect, useState } from 'react';

interface Service {
  id: string;
  title: string;
  subtitle: string;
  simple_explanation: string;
  icon_name: string;
  order: number;
}

interface TrustStat {
  id: string;
  label: string;
  value: string;
  numeric_value: number;
  suffix: string;
}

interface HomepageData {
  hero: {
    headline: string;
    subheadline: string;
    primary_cta_text: string;
    primary_cta_link: string;
    secondary_cta_text: string;
    secondary_cta_link: string;
  } | null;
  services: Service[];
  trust_stats: TrustStat[];
}

export default function Home() {
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/homepage/')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-electric-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-soft-gray">Loading...</p>
        </div>
      </div>
    );
  }

  const hero = data?.hero;
  const services = data?.services || [];
  const trustStats = data?.trust_stats || [];

  // Icon mapping (simple emoji fallback)
  const getIcon = (iconName: string) => {
    const icons: Record<string, string> = {
      Code2: '💻', Globe: '🌐', ShoppingCart: '🛒', Smartphone: '📱',
      Cloud: '☁️', TrendingUp: '📈', PenTool: '✏️', Shield: '🛡️',
      Server: '🖥️', ShoppingBag: '🛍️', Globe2: '🌍', Heart: '❤️'
    };
    return icons[iconName] || '🚀';
  };

  return (
    <main className="min-h-screen bg-deep-space">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-electric-cyan/20 via-transparent to-transparent" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
            {hero?.headline}
          </h1>
          <p className="text-xl text-soft-gray max-w-3xl mx-auto mb-10">
            {hero?.subheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={hero?.primary_cta_link} className="px-8 py-4 bg-electric-cyan text-deep-space rounded-lg font-semibold hover:scale-105 transition inline-block">
              {hero?.primary_cta_text} →
            </a>
            <a href={hero?.secondary_cta_link} className="px-8 py-4 border border-soft-gray text-white rounded-lg font-semibold hover:border-electric-cyan hover:text-electric-cyan transition inline-block">
              {hero?.secondary_cta_text}
            </a>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      {trustStats.length > 0 && (
        <section className="py-16 bg-midnight-navy">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {trustStats.map((stat) => (
                <div key={stat.id}>
                  <div className="text-4xl md:text-5xl font-bold text-electric-cyan">
                    {stat.value}
                  </div>
                  <div className="text-soft-gray mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      {services.length > 0 && (
        <section className="py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl text-center font-bold text-white mb-16">
              Full-Stack Technology Solutions Under One Roof
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-midnight-navy/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-electric-cyan/50 transition-all">
                  <div className="text-4xl mb-4">{getIcon(service.icon_name)}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-soft-gray text-sm">{service.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
