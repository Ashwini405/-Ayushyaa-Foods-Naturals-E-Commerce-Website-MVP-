export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-[#9FC98D] to-[#7FB66D] text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Ayushyaa
          </h2>
          <p className="text-xl md:text-2xl mb-2">Foods & Naturals</p>
          <p className="text-lg md:text-xl mb-8 italic">Back to Roots – 100% Natural</p>
          <p className="text-base md:text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Discover our range of organic food products and herbal personal care items.
            Pure, natural, and crafted with care for your wellness journey.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#products"
              className="bg-white text-[#9FC98D] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              Shop Now
            </a>
            <a
              href="#about"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#9FC98D] transition"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
