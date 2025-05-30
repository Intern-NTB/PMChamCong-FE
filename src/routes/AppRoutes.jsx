import { Routes, Route } from 'react-router-dom';
import { privateRoutes } from './privateRoutes';
import { publicRoutes } from './publicRoutes';
import ProtectedRoute from './protectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {publicRoutes.map(({ path, element }, idx) => (
        <Route key={idx} path={path} element={element} />
      ))}

      {privateRoutes.map(({ path, element, children }, idx) => (
        <Route key={idx} path={path} element={<ProtectedRoute>{element}</ProtectedRoute>}>
          {children && children.map((child, cIdx) => (
            <Route
              key={cIdx}
              index={child.index}
              path={child.path}
              element={child.element}
            />
          ))}
        </Route>
      ))}
    </Routes>
  );
}
