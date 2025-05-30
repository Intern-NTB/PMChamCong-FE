import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../../../store/slices/authSlice'
import { useNavigate } from 'react-router-dom'
import './login.css'
import logo from '../../../assets/images/LogoIcon.png'

const Login = () => {
  const dispatch = useDispatch()
  const auth = useSelector(state => state.auth)
  const navigate = useNavigate()

  const [username, setTenDangNhap] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    if (username && password) {
      dispatch(login({ username }))
    } else {
      alert('Vui lòng nhập username và password')
    }
  }

  useEffect(() => {
    if (auth.isLoggedIn) {
      navigate('/main-layout')
    }
  }, [auth.isLoggedIn, navigate])

  return (
    <div className='login-container'>
      <form onSubmit={handleLogin} className='login-form'>
        <img src={logo} alt="Logo" />
        <div className='input-container'>
          <label>Tên đăng nhập</label>
          <input
            type="text"
            placeholder="Tên đăng nhập của bạn"
            value={username}
            onChange={e => setTenDangNhap(e.target.value)}
            required
          />
        </div>
        <div className='input-container'>
          <label>Mật khẩu</label>
          <input
            type="password"
            placeholder="Mật khẩu của bạn"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={!(username && password)}>Đăng nhập</button>
      </form>
    </div>
  )
}

export default Login
