/* pages/_app.js */
import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-b p-6 bg-blue-800" >
        <p className="text-4xl font-verdana font-bold text-blue-100">CryptoHomes</p>
        <div className="flex mt-4 ">
          <Link legacyBehavior href="/">
            <a className="mr-6 text-blue-400 hover:text-blue-100">
              Home
            </a>
          </Link>
          <Link legacyBehavior  href="/create-item">
            <a className="mr-6 text-blue-400 hover:text-blue-100">
              Sell property
            </a>
          </Link>
          <Link  legacyBehavior href="/creator-dashboard">
            <a className="mr-6 text-blue-400 hover:text-blue-100">
              My properties
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp











