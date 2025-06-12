import { Link } from "react-router-dom";

const sheets = [
    {
        title: "DSA Sheet",
        description:
            "A curated list of must-solve Data Structures & Algorithms problems.",
        icon: "📚",
        link: "#", // Replace with actual link or route
    },
    {
        title: "CP Fundamentals",
        description:
            "Essential concepts and problems for competitive programming beginners.",
        icon: "🧠",
        link: "#",
    },
    {
        title: "Advanced Algorithms",
        description:
            "Challenging problems covering advanced algorithms and techniques.",
        icon: "🚀",
        link: "#",
    },
    {
        title: "Interview Prep",
        description: "Handpicked problems to ace your coding interviews.",
        icon: "💼",
        link: "#",
    },
];

const SheetsPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans">
        <main className="max-w-5xl mx-auto px-4 py-12">
            {/* Hero Section */}
            <section className="text-center mb-16 animate-fade-in">
                <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
                    Explore <span className="text-amber-400 drop-shadow">Sheets</span>
                </h1>
                <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                    Structured problem sheets to guide your journey from beginner to pro.
                    Practice, learn, and master every topic!
                </p>
            </section>

            {/* Sheets Section */}
            <section>
                <h2 className="text-3xl font-bold mb-10 text-center">
                    Choose Your <span className="text-amber-400">Sheet</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {sheets.map((sheet) => (
                        <div
                            key={sheet.title}
                            className="bg-gray-800 rounded-xl p-8 flex items-start gap-6 shadow-lg border border-gray-700 hover:scale-105 hover:border-amber-400 transition-all duration-200"
                        >
                            <div className="text-4xl">{sheet.icon}</div>
                            <div>
                                <h3 className="font-bold text-xl mb-2">{sheet.title}</h3>
                                <p className="text-gray-300 text-base mb-4">
                                    {sheet.description}
                                </p>
                                <Link
                                    to={sheet.link}
                                    className="inline-block bg-amber-400 text-gray-900 font-semibold px-6 py-2 rounded-full shadow hover:bg-amber-300 transition text-base"
                                >
                                    View Sheet
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Community Section */}
            <section className="mt-20 text-center">
                <h2 className="text-2xl font-semibold mb-2">
                    Practice with the Community
                </h2>
                <p className="text-gray-400 mb-4">
                    Share progress, discuss problems, and grow together with fellow
                    coders.
                </p>
            </section>
        </main>
    </div>
);

export default SheetsPage;
