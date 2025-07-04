// src/App.jsx
import { NotificationProvider } from './component/ui/notification.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

function App() {
  return (
    <NotificationProvider>
      <AppRoutes />
    </NotificationProvider>
  )
}
export default App