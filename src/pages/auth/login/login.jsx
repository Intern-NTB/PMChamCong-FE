import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './login.css'
import logo from '../../../assets/images/LogoIcon.png'
import { useTaiKhoan } from '../../../component/hooks/useTaiKhoan'
import { notification } from 'antd'

const Login = () => {
  const navigate = useNavigate()
  const { loadingDangNhap, login } = useTaiKhoan()

  const [tenDangNhap, setTenDangNhap] = useState('')
  const [matKhau, setPassword] = useState('')

  const [api, contextHolder] = notification.useNotification()

  const openNotification = (type, message, description) => {
    api[type]({
      message,
      description,
      placement: 'topRight',
      duration: 3
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!tenDangNhap || !matKhau) {
      openNotification('error', 'Thiếu thông tin', 'Vui lòng nhập tên đăng nhập và mật khẩu')
      return
    }

    try {
      const result = await login(tenDangNhap, matKhau)
      console.log('Login result:', result)

      if (result && result.success) {
        navigate('/main-layout')
      } else {
        openNotification('error', 'Đăng nhập thất bại', 'Tên đăng nhập hoặc mật khẩu không đúng')
      }
    } catch (error) {
      console.log('Login error:', error)
      openNotification(
        'error',
        'Lỗi đăng nhập',
        'Sai tên đăng nhập hoặc mật khẩu'
      )
    }
  }

  return (
    <div className='login-container'>
      {contextHolder}
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
