import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './login.css'
import logo from '../../../assets/images/LogoIcon.png'
import { useTaiKhoan } from '../../../component/hooks/useTaiKhoan'
import { notification, Input } from 'antd'

const Login = () => {
  const navigate = useNavigate()
  const { loadingDangNhap, login } = useTaiKhoan(false)

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
      openNotification('error', 'Thiếu thông tin', 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.')
      return
    }
    const usernameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!usernameRegex.test(tenDangNhap)) {
      openNotification(
        'error',
        'Tên đăng nhập không hợp lệ',
        'Tên đăng nhập chỉ được chứa chữ cái, số, dấu chấm (.), dấu gạch dưới (_), hoặc dấu gạch ngang (-).'
      );
      return; 
    }
    try {
      const result = await login(tenDangNhap, matKhau)
      console.log('Login result:', result)

      if (result && result.success) {
        navigate('/main-layout/chamcong');
      } else {
        let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';

        if (result && result.message) {
          switch (result.message.toLowerCase().trim()) {
            case "tên đăng nhập không tồn tại.":
            case "invalid username":
              errorMessage = "Tên đăng nhập không tồn tại trong hệ thống. Vui lòng kiểm tra lại.";
              break;
            case "mật khẩu không đúng.":
            case "incorrect password":
            case "invalid password":
              errorMessage = "Mật khẩu không đúng. Vui lòng nhập lại mật khẩu chính xác.";
              break;
            case "tài khoản đã bị khóa.":
            case "account locked":
              errorMessage = "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.";
              break;
            case "tài khoản chưa được kích hoạt.":
            case "account not activated":
              errorMessage = "Tài khoản của bạn chưa được kích hoạt. Vui lòng kiểm tra email hoặc liên hệ quản trị viên.";
              break;
            case "yêu cầu không hợp lệ.":
            case "invalid request":
            case "invalid credentials":
              errorMessage = "Dữ liệu đăng nhập không hợp lệ. Vui lòng kiểm tra định dạng hoặc thông tin đã nhập.";
              break;
            default:
              errorMessage = "Đã xảy ra lỗi không xác định. Vui lòng liên hệ hỗ trợ.";
              break;
          }
        }

        openNotification('error', 'Đăng nhập thất bại', errorMessage);
      }
    } catch (error) {
      console.error('Login error (unexpected - network/system):', error);
      openNotification(
        'error',
        'Lỗi kết nối',
        'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.'
      );
    }
  }

  return (
    <div className='login-container'>
      {contextHolder}
      <form onSubmit={handleLogin} className='login-form'>
        <img src={logo} alt="Logo" />
        <div className='input-container'>
          <label>Tên đăng nhập</label>
          <Input
            type="text"
            placeholder="Tên đăng nhập của bạn"
            value={tenDangNhap}
            onChange={e => setTenDangNhap(e.target.value)}
            required
            style={
              {
                border: '2px solid gray'
              }
            }
          />
        </div>
        <div className='input-container'>
          <label>Mật khẩu</label>
          <Input.Password
            value={matKhau}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Mật khẩu của bạn"
            style={
              {
                border: '2px solid gray'
              }
            }
          />
        </div>
        <button type="submit" disabled={loadingDangNhap}>
          {loadingDangNhap ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  )
}

export default Login;