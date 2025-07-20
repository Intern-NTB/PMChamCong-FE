// src/routes/AppRoutes.jsx
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

      {privateRoutes.map(({ path, element, children, requiredPermission }, idx) => (
        <Route
          key={idx}
          path={path}
          element={
            <ProtectedRoute requiredPermission={requiredPermission}>{element}</ProtectedRoute>
          }
        >
          {children && children.map((child, cIdx) => {
            if (child.children) {
              return (
                <Route
                  key={cIdx}
                  path={child.path}
                  element={
                    <ProtectedRoute requiredPermission={child.requiredPermission}>{child.element}</ProtectedRoute>
                  }
                >
                  {child.children.map((nestedChild, nIdx) => (
                    <Route
                      key={nIdx}
                      index={nestedChild.index}
                      path={nestedChild.path}
                      element={
                        <ProtectedRoute requiredPermission={nestedChild.requiredPermission}>{nestedChild.element}</ProtectedRoute>
                      }
                    />
                  ))}
                </Route>
              );
            }

            return (
              <Route
                key={cIdx}
                index={child.index}
                path={child.path}
                element={
                  <ProtectedRoute requiredPermission={child.requiredPermission}>{child.element}</ProtectedRoute>
                }
              />
            );
          })}
        </Route>
      ))}
    </Routes>
  );
}