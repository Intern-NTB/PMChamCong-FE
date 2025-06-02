import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './login.css'
import logo from '../../../assets/images/LogoIcon.png'
import { useTaiKhoan } from '../../../component/hooks/useTaiKhoan'
import MyAlert from '../../../component/ui/alert'

const Login = () => {
  const navigate = useNavigate()
  const { loadingDangNhap, login } = useTaiKhoan()

  const [alert, setAlert] = useState({ show: false, type: '', message: '' })
  const [tenDangNhap, setTenDangNhap] = useState('')
  const [matKhau, setPassword] = useState('')

  // Hàm để đóng alert
  const handleCloseAlert = () => {
    setAlert({ show: false, type: '', message: '' })
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    // Kiểm tra input trước khi gọi API
    if (!tenDangNhap || !matKhau) {
      setAlert({ show: true, type: 'error', message: 'Vui lòng nhập tên đăng nhập và mật khẩu' })
      return
    }

    try {
      // Ẩn alert cũ trước khi thực hiện login
      setAlert({ show: false, type: '', message: '' })

      const result = await login(tenDangNhap, matKhau)
      
      console.log('Login result:', result)
      
      // Nếu login thành công, chuyển hướng trực tiếp
      if (result && result.success) {
        console.log('Login successful, navigating...')
        navigate('/main-layout')
      }
      
    } catch (error) {
      console.log('Login error:', error)
      
      // Hiển thị thông báo lỗi
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Sai tên đăng nhập hoặc mật khẩu'
      })
    }
  }

  return (
    <div className='login-container'>
      {/* Hiển thị alert nếu có */}
      {alert.show && (
        <MyAlert 
          type={alert.type} 
          message={alert.message} 
          onClose={handleCloseAlert}
        />
      )}

      <form onSubmit={handleLogin} className='login-form'>
        <img src={logo} alt="Logo" />
        <div className='input-container'>
          <label>Tên đăng nhập</label>
          <input
            type="text"
            placeholder="Tên đăng nhập của bạn"
            value={tenDangNhap}
            onChange={e => setTenDangNhap(e.target.value)}
            required
          />
        </div>
        <div className='input-container'>
          <label>Mật khẩu</label>
          <input
            type="password"
            placeholder="Mật khẩu của bạn"
            value={matKhau}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loadingDangNhap}>
          {loadingDangNhap ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  )
}

export default Login