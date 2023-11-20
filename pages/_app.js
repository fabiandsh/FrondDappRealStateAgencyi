/* pages/_app.js */
import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-b p-6">
        <p className="text-4xl font-bold">Inmobiliaria Block Chain</p>
        <div className="flex mt-4">
          <Link legacyBehavior href="/">
            <a className="mr-6 text-pink-500">
              Home
            </a>
          </Link>
          <Link legacyBehavior  href="/create-item">
            <a className="mr-6 text-pink-500">
              Sell property
            </a>
          </Link>
          <Link  legacyBehavior href="/creator-dashboard">
            <a className="mr-6 text-pink-500">
              My products
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp










