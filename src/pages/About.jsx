const About = () => (
  <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto leading-relaxed">
    <h2 className="text-4xl font-black mb-8 italic text-ias-green">ABOUT US</h2>
    <p className="text-xl text-gray-300 mb-6">
      The IEEE Industry Applications Society (IAS) Student Branch Chapter of Jyothi Engineering College 
      is a platform for students to connect with the global engineering industry.
    </p>
    <div className="grid md:grid-cols-2 gap-10 mt-12">
      <div className="p-6 bg-[#111] rounded-2xl border-l-4 border-ias-green">
        <h3 className="font-bold text-xl mb-2 text-white">Our Mission</h3>
        <p className="text-gray-400">To bridge the gap between academic theory and industrial practice through workshops and industrial visits.</p>
      </div>
      <div className="p-6 bg-[#111] rounded-2xl border-l-4 border-white">
        <h3 className="font-bold text-xl mb-2 text-white">Our Vision</h3>
        <p className="text-gray-400">Creating a community of technically proficient engineers ready to solve real-world electrical and electronic challenges.</p>
      </div>
    </div>
  </div>
);

export default About;