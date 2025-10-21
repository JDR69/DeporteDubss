import React, { useState} from 'react'
import { useAuth } from '../context/AuthContext';

const bgImage = './futbol.jpg';

const LoginPage = () => {
  const { signin } = useAuth();

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async(e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signin(data.email, data.password);
      // El estado loading ya se controla en el AuthContext
    } catch (error) {
      console.error("Error during sign-in:", error);
      setLoading(false)
    }
  }

  return (
    <div className='h-screen flex items-center justify-center bg-linear-to-b from-green-700 to-green-900 relative'>
      <div 
        className='absolute inset-0 z-0 bg-cover bg-center opacity-50' 
        style={{ 
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      <div className='relative z-10 w-full max-w-md px-4'>
        <form 
          onSubmit={handleSubmit}
          className='bg-white/80 backdrop-blur-sm p-8 rounded-[20px] shadow-xl border border-green-500'
        >
          <h2 className='text-2xl font-bold mb-6 text-center text-green-800'>Iniciar sesión</h2>
          
          <div className='mb-5'>
            <label className='block text-sm font-medium mb-2 text-green-800' htmlFor='email'>
              Correo electrónico
            </label>
            <input
              className='border-2 border-green-400 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all'
              type='email'
              id='email'
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              required
            />
          </div>
          
          <div className='mb-6'>
            <label className='block text-sm font-medium mb-2 text-green-800' htmlFor='password'>
              Contraseña
            </label>
            <input
              className='border-2 border-green-400 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all'
              type='password'
              id='password'
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              required
            />
          </div>
          
          <div className='flex justify-center'>
            <button
              className='bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-medium transition-all w-full max-w-[200px] flex items-center justify-center'
              type='submit'
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cargando...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
