import Navbar from './components/Navbar';
import MemberCard from './components/MemberCard';
import { EXECOM, UPCOMING_EVENTS } from './data/index';

function App() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />

      {/* Hero Section */}
      <header className="pt-40 pb-20 px-6 text-center">
        <h1 className="text-6xl font-black mb-4 uppercase tracking-tighter">
          IEEE <span className="text-ias-green">IAS</span> SBC
        </h1>
        <p className="text-gray-400 text-xl max-w-2xl mx-auto">
          Jyothi Engineering College, Cheruthuruthy.
        </p>
      </header>

      {/* Execom Section */}
      <section className="max-w-7xl mx-auto py-20 px-6">
        <h2 className="text-3xl font-bold mb-12 border-l-4 border-ias-green pl-4">Our Execom</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {EXECOM.map((member) => (
            <MemberCard key={member.id} {...member} />
          ))}
        </div>
      </section>

      {/* Events Section */}
      <section className="bg-[#111] py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Upcoming Events</h2>
          {UPCOMING_EVENTS.map((event) => (
            <div key={event.id} className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <span className="text-ias-green font-bold uppercase tracking-widest text-sm">{event.date}</span>
                <h3 className="text-3xl font-bold mt-2 mb-4">{event.title}</h3>
                <p className="text-gray-400 mb-6">{event.description}</p>
                <a 
                  href={event.regLink} 
                  className="inline-block bg-ias-green text-black font-black px-8 py-4 rounded-xl hover:scale-105 transition-transform"
                >
                  REGISTER NOW
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;