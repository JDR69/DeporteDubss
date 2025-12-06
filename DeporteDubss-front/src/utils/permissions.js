// Utilidad para verificar permisos
export const ROLES = {
  ADMIN: 1,
  ORGANIZADOR: 2,
  DELEGADO: 3,
  JUGADOR: 4
};

export const PERMISSIONS = {
  // Usuarios
  VIEW_USERS: 'view_users',
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  
  // Roles y permisos
  MANAGE_ROLES: 'manage_roles',
  
  // Campeonatos
  VIEW_CHAMPIONSHIPS: 'view_championships',
  CREATE_CHAMPIONSHIP: 'create_championship',
  EDIT_CHAMPIONSHIP: 'edit_championship',
  DELETE_CHAMPIONSHIP: 'delete_championship',
  
  // Equipos
  VIEW_TEAMS: 'view_teams',
  CREATE_TEAM: 'create_team',
  EDIT_TEAM: 'edit_team',
  DELETE_TEAM: 'delete_team',
  EDIT_OWN_TEAM: 'edit_own_team', // Delegado puede editar su propio equipo
  
  // Partidos
  VIEW_MATCHES: 'view_matches',
  CREATE_MATCH: 'create_match',
  EDIT_MATCH: 'edit_match',
  DELETE_MATCH: 'delete_match',
  
  // Fixtures
  VIEW_FIXTURES: 'view_fixtures',
  CREATE_FIXTURE: 'create_fixture',
  EDIT_FIXTURE: 'edit_fixture',
  DELETE_FIXTURE: 'delete_fixture',
  
  // Resultados
  VIEW_RESULTS: 'view_results',
  CREATE_RESULT: 'create_result',
  EDIT_RESULT: 'edit_result',
  
  // Incidencias
  VIEW_INCIDENTS: 'view_incidents',
  CREATE_INCIDENT: 'create_incident',
  EDIT_INCIDENT: 'edit_incident',
  DELETE_INCIDENT: 'delete_incident',
  
  // Recursos
  VIEW_RESOURCES: 'view_resources',
  MANAGE_RESOURCES: 'manage_resources',
};

// Mapa de permisos por rol
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // Admin tiene todos los permisos
    ...Object.values(PERMISSIONS)
  ],
  [ROLES.ORGANIZADOR]: [
    // Organizador puede gestionar campeonatos, fixtures, partidos, resultados
    PERMISSIONS.VIEW_CHAMPIONSHIPS,
    PERMISSIONS.CREATE_CHAMPIONSHIP,
    PERMISSIONS.EDIT_CHAMPIONSHIP,
    PERMISSIONS.DELETE_CHAMPIONSHIP,
    PERMISSIONS.VIEW_TEAMS,
    PERMISSIONS.VIEW_MATCHES,
    PERMISSIONS.CREATE_MATCH,
    PERMISSIONS.EDIT_MATCH,
    PERMISSIONS.DELETE_MATCH,
    PERMISSIONS.VIEW_FIXTURES,
    PERMISSIONS.CREATE_FIXTURE,
    PERMISSIONS.EDIT_FIXTURE,
    PERMISSIONS.DELETE_FIXTURE,
    PERMISSIONS.VIEW_RESULTS,
    PERMISSIONS.CREATE_RESULT,
    PERMISSIONS.EDIT_RESULT,
    PERMISSIONS.VIEW_INCIDENTS,
    PERMISSIONS.CREATE_INCIDENT,
    PERMISSIONS.EDIT_INCIDENT,
    PERMISSIONS.DELETE_INCIDENT,
    PERMISSIONS.VIEW_RESOURCES,
  ],
  [ROLES.DELEGADO]: [
    // Delegado puede ver campeonatos, gestionar su equipo, ver partidos y resultados
    PERMISSIONS.VIEW_CHAMPIONSHIPS,
    PERMISSIONS.VIEW_TEAMS,
    PERMISSIONS.EDIT_OWN_TEAM,
    PERMISSIONS.VIEW_MATCHES,
    PERMISSIONS.VIEW_FIXTURES,
    PERMISSIONS.VIEW_RESULTS,
    PERMISSIONS.VIEW_INCIDENTS,
    PERMISSIONS.VIEW_RESOURCES,
  ],
  [ROLES.JUGADOR]: [
    // Jugador solo puede ver información
    PERMISSIONS.VIEW_CHAMPIONSHIPS,
    PERMISSIONS.VIEW_TEAMS,
    PERMISSIONS.VIEW_MATCHES,
    PERMISSIONS.VIEW_FIXTURES,
    PERMISSIONS.VIEW_RESULTS,
    PERMISSIONS.VIEW_INCIDENTS,
  ]
};

/**
 * Verifica si un usuario tiene un permiso específico
 * @param {number} userRole - ID del rol del usuario
 * @param {string} permission - Permiso a verificar
 * @returns {boolean}
 */
export const hasPermission = (userRole, permission) => {
  if (!userRole) return false;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
};

/**
 * Verifica si un usuario tiene alguno de los permisos especificados
 * @param {number} userRole - ID del rol del usuario
 * @param {string[]} permissions - Array de permisos
 * @returns {boolean}
 */
export const hasAnyPermission = (userRole, permissions) => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

/**
 * Verifica si un usuario tiene todos los permisos especificados
 * @param {number} userRole - ID del rol del usuario
 * @param {string[]} permissions - Array de permisos
 * @returns {boolean}
 */
export const hasAllPermissions = (userRole, permissions) => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

/**
 * Obtiene el nombre del rol
 * @param {number} roleId - ID del rol
 * @returns {string}
 */
export const getRoleName = (roleId) => {
  const roleNames = {
    [ROLES.ADMIN]: 'Administrador',
    [ROLES.ORGANIZADOR]: 'Organizador',
    [ROLES.DELEGADO]: 'Delegado',
    [ROLES.JUGADOR]: 'Jugador'
  };
  return roleNames[roleId] || 'Desconocido';
};
