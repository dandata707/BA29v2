// Compatibility adapters for the prototype views, backed by the application's directory.
import { EMPLOYEE_PROFILES } from '../../../data/userProfiles';
import { INITIAL_ASSETS } from '../../../data/mockData';
export const INITIAL_RECIPIENTS = EMPLOYEE_PROFILES.map(user => ({
  id: user.id, name: user.name, role: user.roleTitle, dept: user.department,
}));
export const INITIAL_LOCATIONS = [...new Set([
  ...INITIAL_ASSETS.map(asset => asset.viTriLuuKho).filter((value): value is string => !!value),
  ...EMPLOYEE_PROFILES.map(user => user.department),
])];
export const DEPARTMENT_MAP = Object.fromEntries(EMPLOYEE_PROFILES.map(user => [user.department, user.department]));
export const EMPLOYEE_MAP = Object.fromEntries(EMPLOYEE_PROFILES.map(user => [user.id, { ho_ten: user.name }]));
