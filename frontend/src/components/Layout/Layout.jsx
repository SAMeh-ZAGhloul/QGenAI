import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMenu, FiX, FiHome, FiUpload, FiSearch, FiLogOut } from 'react-icons/fi'
import { logout } from '../../services/auth'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for mobile */}
      <div className={`fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden ${
        sidebarOpen ? 'block' : 'hidden'
      }`} onClick={() => setSidebarOpen(false)}></div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform bg-white lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'
      }`}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="text-xl font-semibold text-gray-800">Knowledge Navigator</div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6">
          <Link
            to="/dashboard"
            className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <FiHome className="w-5 h-5" />
            <span className="mx-3">Dashboard</span>
          </Link>

          <Link
            to="/upload"
            className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <FiUpload className="w-5 h-5" />
            <span className="mx-3">Upload Documents</span>
          </Link>

          <Link
            to="/query"
            className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <FiSearch className="w-5 h-5" />
            <span className="mx-3">Query Documents</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="mx-3">Logout</span>
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <FiMenu className="w-6 h-6" />
          </button>
          <div className="text-lg font-semibold text-gray-800">Knowledge Navigator</div>
          <div></div> {/* Empty div for flex spacing */}
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
