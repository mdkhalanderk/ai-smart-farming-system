import React from 'react';
import {
    Activity,
    CloudSun,
    Database,
    ExternalLink,
    FlaskConical,
    Globe2,
    Leaf,
    MapPinned,
    Sprout,
    TrendingUp,
} from 'lucide-react';

const coverageGroups = [
    {
        title: 'Leaf disease vision',
        description: 'Image-label and field-background coverage',
        color: 'bg-emerald-600',
        metrics: [
            { label: 'Disease classes', value: 58, display: '58' },
            { label: 'Crop types', value: 7, display: '7' },
            { label: 'Field backgrounds', value: 80, display: '80' },
        ],
    },
    {
        title: 'Mandi price history',
        description: 'Karnataka market coverage in the supplied inventory',
        color: 'bg-teal-600',
        metrics: [
            { label: 'APMC markets', value: 42, display: '42' },
            { label: 'Historical span', value: 4, display: '2021–2024', unit: 'years' },
        ],
    },
    {
        title: 'Crop-yield records',
        description: 'Agro-climatic dimensions described for the dataset',
        color: 'bg-amber-600',
        metrics: [
            { label: 'Empirical records', value: 3000, display: '3,000' },
            { label: 'Crops', value: 12, display: '12' },
            { label: 'States', value: 15, display: '15' },
            { label: 'Seasons', value: 4, display: '4' },
        ],
    },
    {
        title: 'Weather & geospatial',
        description: 'Forecast horizon and Karnataka location coverage',
        color: 'bg-sky-600',
        metrics: [
            { label: 'Forecast horizon', value: 7, display: '7', unit: 'days' },
            { label: 'Districts', value: 31, display: '31' },
            { label: 'Taluks', value: 240, display: '240+', unit: 'approx.' },
        ],
    },
];

const sources = [
    {
        title: 'Leaf disease vision',
        icon: Leaf,
        summary: 'PlantVillage laboratory images, ICAR-IIHR field pathology imagery, crop-specific field repositories, and field-photo backgrounds.',
        detail: '58 classes across 7 crops; the supplied inventory also describes 80 authentic field backgrounds.',
        attribution: 'PlantVillage (Hughes & Salathé); ICAR-IIHR; project-listed agriculture datasets',
    },
    {
        title: 'APMC mandi prices',
        icon: TrendingUp,
        summary: 'Daily commodity arrivals and min/max/modal prices for Karnataka APMC markets, with rolling lag history.',
        detail: '42 markets; historical coverage stated as 2021–2024.',
        attribution: 'AGMARKNET — Directorate of Marketing & Inspection, MoA&FW, Government of India',
        links: [{ label: 'AGMARKNET', href: 'https://agmarknet.gov.in' }],
    },
    {
        title: 'Live weather',
        icon: CloudSun,
        summary: 'Seven-day district-coordinate forecast inputs for temperature, relative humidity, precipitation, and wind speed.',
        detail: 'Runtime API feed; values update when requested and are not represented as a static dataset here.',
        attribution: 'Open-Meteo; forecast models include ECMWF, NOAA, and DWD feeds',
        links: [{ label: 'Open-Meteo', href: 'https://open-meteo.com' }],
    },
    {
        title: 'Crop yield',
        icon: Sprout,
        summary: 'Historical area, production, and yield statistics enriched with regional agro-climatic features.',
        detail: '3,000 records, 12 crops, 15 states, and 4 seasons, as described in the supplied inventory.',
        attribution: 'DES, Department of Agriculture & Farmers Welfare; ICRISAT VDSA district database',
    },
    {
        title: 'Treatment guidance',
        icon: FlaskConical,
        summary: 'Disease-specific chemical and cultural guidance, formulation/dilution details, and pre-harvest intervals where provided.',
        detail: 'Guidance references include ICAR, NHB package-of-practice material, and KVK extension bulletins.',
        attribution: 'ICAR; National Horticulture Board; Krishi Vigyan Kendra extension bulletins',
        links: [{ label: 'National Horticulture Board', href: 'https://nhb.gov.in' }],
    },
    {
        title: 'District & taluk geography',
        icon: MapPinned,
        summary: 'Karnataka district headquarters coordinates and taluk lists used by location-aware advisory and proximity calculations.',
        detail: '31 districts and 240+ taluks, as described in the supplied inventory.',
        attribution: 'KSRSAC and Revenue Department, Government of Karnataka',
    },
];

function CoverageChart({ title, description, metrics, color }) {
    const maxValue = Math.max(...metrics.map((metric) => metric.value));

    return (
        <section className="rounded-2xl border border-[#e4dfd5] bg-white p-5 sm:p-6 shadow-sm" aria-label={title}>
            <div className="mb-5">
                <h3 className="font-serif text-lg font-bold text-[#142618]">{title}</h3>
                <p className="mt-1 text-xs text-[#6b7c70]">{description}</p>
            </div>
            <div className="space-y-4" role="img" aria-label={`${title} coverage chart`}>
                {metrics.map((metric) => (
                    <div key={metric.label}>
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                            <span className="font-medium text-[#526055]">{metric.label}</span>
                            <span className="shrink-0 font-bold text-[#142618]">
                                {metric.display}{metric.unit ? ` ${metric.unit}` : ''}
                            </span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-[#f0ece2]">
                            <div
                                className={`h-full rounded-full ${color} transition-all`}
                                style={{ width: `${Math.max(4, (metric.value / maxValue) * 100)}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export const DataSourcesPage = () => (
    <main className="min-h-[calc(100vh-4rem)] bg-[#faf8f5] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
            <header className="overflow-hidden rounded-3xl bg-[#142618] p-6 text-white shadow-xl sm:p-10">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div className="max-w-3xl">
                        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#2b4c32] bg-[#1b3420] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#72d494]">
                            <Database className="h-3.5 w-3.5" /> Data source register
                        </span>
                        <h1 className="font-serif text-3xl font-bold tracking-tight text-[#f5f2ea] sm:text-4xl">
                            Agricultural data, at a glance
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#c2cec4]">
                            Coverage charts and source attributions for the vision, market, weather, yield, treatment, and geospatial pipelines.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-[#2e5237] bg-[#1b3420]/90 px-4 py-3 text-xs text-[#d6dfd8]">
                        <Activity className="h-5 w-5 shrink-0 text-[#72d494]" />
                        <span><strong className="text-white">6 pipelines</strong><br />Source inventory overview</span>
                    </div>
                </div>
            </header>

            <section aria-labelledby="coverage-heading" className="space-y-4">
                <div>
                    <h2 id="coverage-heading" className="font-serif text-xl font-bold text-[#142618]">Dataset coverage charts</h2>
                    <p className="mt-1 text-xs text-[#6b7c70]">Each chart uses its own scale; counts are not directly comparable between pipeline types.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    {coverageGroups.map((group) => (
                        <CoverageChart key={group.title} {...group} />
                    ))}
                </div>
            </section>

            <section aria-labelledby="modules-heading" className="space-y-4">
                <div>
                    <h2 id="modules-heading" className="font-serif text-xl font-bold text-[#142618]">Sources by advisory module</h2>
                    <p className="mt-1 text-xs text-[#6b7c70]">Organization names and coverage figures follow the project-provided source inventory.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {sources.map((source) => {
                        const Icon = source.icon;
                        return (
                            <article key={source.title} className="flex flex-col rounded-2xl border border-[#e4dfd5] bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef5ee] text-[#1b432a]">
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    <h3 className="font-serif text-base font-bold text-[#142618]">{source.title}</h3>
                                </div>
                                <p className="mt-4 text-sm leading-relaxed text-[#526055]">{source.summary}</p>
                                <p className="mt-3 rounded-xl bg-[#faf8f5] px-3 py-2 text-xs leading-relaxed text-[#526055]">{source.detail}</p>
                                <div className="mt-4 flex-1 border-t border-[#ece6dc] pt-3">
                                    <p className="text-[11px] font-semibold leading-relaxed text-[#6b7c70]">{source.attribution}</p>
                                    {source.links?.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {source.links.map((link) => (
                                                <a
                                                    key={link.href}
                                                    href={link.href}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 rounded-lg border border-[#d6cfc3] px-2.5 py-1.5 text-xs font-semibold text-[#1b432a] transition-colors hover:bg-[#eef5ee]"
                                                >
                                                    {link.label}<ExternalLink className="h-3 w-3" />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>

            <aside className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-xs leading-relaxed text-sky-950">
                <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
                <p>
                    Coverage totals shown here are project inventory figures supplied for this overview. They are descriptive and are not dynamically re-counted from raw image folders, external APIs, or source-agency databases. Check original sources and local product labels before acting on agricultural treatment guidance.
                </p>
            </aside>
        </div>
    </main>
);
