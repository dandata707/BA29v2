import { UserProfile } from '../types';
import { INITIAL_EMPLOYEES } from '../features/asset-return/data/mockData';
import { EMPLOYEE_PROFILE } from './mockTickets';
import { USERS as LIQUIDATION_USERS } from '../features/asset-liquidation/data/mockData';

const director = LIQUIDATION_USERS.find(user => user.role === 'GIAM_DOC')!;
export const DIRECTOR_PROFILE: UserProfile = {
  ...director,
  role: 'director',
  roleTitle: 'Giám đốc',
  code: 'GD-001',
};

// Use the same employee directory as the return-record employee selector.
export const EMPLOYEE_PROFILES: UserProfile[] = INITIAL_EMPLOYEES.map(employee => ({
  ...(employee.email === EMPLOYEE_PROFILE.email ? EMPLOYEE_PROFILE : {
    id: employee.id,
    code: employee.id,
    role: 'employee' as const,
    roleTitle: 'Nhân viên',
  }),
  employeeId: employee.id,
  name: employee.name,
  email: employee.email,
  department: employee.department,
  avatarText: employee.avatarText,
}));
