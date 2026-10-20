import type { RouteConfig } from '@react-router/dev/routes'
import { flatRoutes } from '@react-router/fs-routes'
// import importedRoutes from './Custom/pages/Imported/routes.json'

const existingRoutes = await flatRoutes()
// const contentRoutes = importedRoutes.filter((entry) => entry.path !== '/')
// for (const entry of contentRoutes) {
//   if (existingRoutes.some((route) => route.path === entry.path.slice(1))) {
//     throw new Error(
//       `Импортированный маршрут конфликтует с существующим: ${entry.path}`,
//     )
//   }
// }

export default [
  ...existingRoutes,
  // ...contentRoutes.map(({ path, file }) => ({ path: path.slice(1), file })),
] satisfies RouteConfig
