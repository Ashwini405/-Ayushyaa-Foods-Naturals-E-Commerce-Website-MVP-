import { MapPin, Phone, Mail, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="mb-4 bg-white rounded-lg p-3 inline-block">
              <img src="/assets/logo.png" alt="Ayushyaa Foods & Naturals" className="h-20 w-auto object-contain" />
            </div>
            <p className="text-sm italic text-gray-400 mb-4">Back to Roots – 100% Natural</p>
            <p className="text-sm text-gray-400">
              Discover our range of organic food products and herbal personal care items.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-sm hover:text-[#9FC98D] transition">
                  Home
                </a>
              </li>
              <li>
                <a href="#products" className="text-sm hover:text-[#9FC98D] transition">
                  Products
                </a>
              </li>
              <li>
                <a href="#about" className="text-sm hover:text-[#9FC98D] transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" className="text-sm hover:text-[#9FC98D] transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div id="contact">
            <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 text-[#9FC98D] flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  8-3-231/C/147, Sri Krishna Nagar, Yusufguda Basthi, Yusufguda, Hyderabad – 500045
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-[#9FC98D]" />
                <a href="tel:+919949349934" className="text-sm hover:text-[#9FC98D] transition">
                  +91 99493 49934
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-[#9FC98D]" />
                <a
                  href="mailto:ayushyaafoods@gmail.com"
                  className="text-sm hover:text-[#9FC98D] transition"
                >
                  ayushyaafoods@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Instagram className="w-5 h-5 text-[#9FC98D]" />
                <a
                  href="https://instagram.com/ayushyaa_foods"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-[#9FC98D] transition"
                >
                  @ayushyaa_foods
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Ayushyaa Foods & Naturals. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
