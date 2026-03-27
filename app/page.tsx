'use client';

import { useMemo, useState } from 'react';

type UserRole = 'teacher' | 'reception' | 'admin';
type ClassStatus = 'open' | 'upcoming' | 'closed';
type Sport = 'Beach Tennis' | 'Futevôlei';
type LoginTab = 'admin' | 'teachers' | 'reception';
type TeacherTab = 'today' | 'space';
type ReceptionTab = 'classes' | 'registrations';
type AdminTab = 'classes' | 'registrations' | 'financial';

type User = {
  id: string;
  name: string;
  initials: string;
  pin: string;
  role: UserRole;
  sport?: Sport;
};

type Student = {
  id: string;
  name: string;
  status?: 'ativo' | 'inadimplente';
  tag?: 'Fixo' | 'Reposição' | 'Avulsa' | 'Experimental' | 'Extra';
  present?: boolean;
};

type ClassItem = {
  id: string;
  teacherId: string;
  teacherName: string;
  sport: Sport;
  day: string;
  time: string;
  category: string;
  court: string;
  limit: number;
  status: ClassStatus;
  students: Student[];
};

type ExperimentalLead = {
  id: string;
  name: string;
  phone: string;
  modality: Sport;
  category: string;
  teacher: string;
  scheduledDate: string;
  scheduledTime: string;
  notes?: string;
};

type FinancialRow = {
  id: string;
  student: string;
  notReceived: string;
  received: string;
  paymentMethod: string;
  teacher: string;
};

const COLORS = {
  blue: '#3E4095',
  blueSoft: '#EEF0FB',
  green: '#7FA857',
  greenSoft: '#F4F9EF',
  border: '#E5E7EB',
  bg: '#F7F8FC',
  text: '#0F172A',
  muted: '#64748B',
  red: '#DC2626',
  redSoft: '#FEF2F2',
  amber: '#92400E',
  amberSoft: '#FFFBEB',
};

const users: User[] = [
  { id: 't1', name: 'Hugo Leonardo', initials: 'HL', pin: '1111', role: 'teacher', sport: 'Beach Tennis' },
  { id: 't2', name: 'Felipe Zago', initials: 'FZ', pin: '2222', role: 'teacher', sport: 'Beach Tennis' },
  { id: 't3', name: 'Rudiery', initials: 'RU', pin: '3333', role: 'teacher', sport: 'Beach Tennis' },
  { id: 't4', name: 'João José', initials: 'JJ', pin: '4444', role: 'teacher', sport: 'Futevôlei' },
  { id: 'r1', name: 'Recepção CT', initials: 'RC', pin: '5555', role: 'reception' },
  { id: 'a1', name: 'Admin CT', initials: 'AC', pin: '9999', role: 'admin' },
];

const categoryOptions = {
  beach: [
    'A definir',
    'Avançado 1',
    'Avançado 2',
    'Iniciante 1',
    'Iniciante 2',
    'Infanto/Juvenil Avançado',
    'Infanto/Juvenil Iniciante',
    'Infanto/Juvenil Intermediário',
    'Intermediário 1',
    'Intermediário 2',
  ],
  fute: [
    'Aprendiz',
    'Aprendiz - Exp',
    'Avançado',
    'Experimental',
    'Iniciante',
    'Infanto/Juvenil Avançado',
    'Infanto/Juvenil Iniciante',
    'Infanto/Juvenil Intermediário',
    'Intermediário',
    'Kids 1',
    'Kids 2',
  ],
};

const initialClasses: ClassItem[] = [
  {
    id: 'h-seg-19',
    teacherId: 't1',
    teacherName: 'Hugo Leonardo',
    sport: 'Beach Tennis',
    day: 'Segunda',
    time: '19:00',
    category: 'Intermediário 2',
    court: '',
    limit: 5,
    status: 'upcoming',
    students: [
      { id: 's1', name: 'Kerol', status: 'ativo', tag: 'Fixo', present: false },
      { id: 's2', name: 'Rafaela', status: 'ativo', tag: 'Experimental', present: false },
      { id: 's3', name: 'Fernanda', status: 'inadimplente', tag: 'Fixo', present: false },
      { id: 's4', name: 'Graziela', status: 'ativo', tag: 'Avulsa', present: false },
    ],
  },
  {
    id: 'h-ter-18',
    teacherId: 't1',
    teacherName: 'Hugo Leonardo',
    sport: 'Beach Tennis',
    day: 'Terça',
    time: '18:00',
    category: 'Iniciante 2',
    court: '',
    limit: 5,
    status: 'upcoming',
    students: [
      { id: 's5', name: 'Manu', status: 'ativo', tag: 'Fixo', present: false },
      { id: 's6', name: 'Bruna', status: 'ativo', tag: 'Reposição', present: false },
    ],
  },
  {
    id: 'z-seg-18',
    teacherId: 't2',
    teacherName: 'Felipe Zago',
    sport: 'Beach Tennis',
    day: 'Segunda',
    time: '18:00',
    category: 'Iniciante 1',
    court: '',
    limit: 5,
    status: 'upcoming',
    students: [
      { id: 's7', name: 'Mario Cesar', status: 'ativo', tag: 'Fixo', present: false },
      { id: 's8', name: 'Renata Paiva', status: 'ativo', tag: 'Fixo', present: false },
      { id: 's9', name: 'Vinicius Freitas', status: 'inadimplente', tag: 'Fixo', present: false },
    ],
  },
  {
    id: 'r-seg-17',
    teacherId: 't3',
    teacherName: 'Rudiery',
    sport: 'Beach Tennis',
    day: 'Segunda',
    time: '17:00',
    category: 'Iniciante',
    court: '',
    limit: 5,
    status: 'upcoming',
    students: [
      { id: 's10', name: 'Germano Reis', status: 'ativo', tag: 'Fixo', present: false },
      { id: 's11', name: 'Alex Eduart', status: 'ativo', tag: 'Fixo', present: false },
    ],
  },
  {
    id: 'j-ter-19',
    teacherId: 't4',
    teacherName: 'João José',
    sport: 'Futevôlei',
    day: 'Terça',
    time: '19:00',
    category: 'Aprendiz - Exp',
    court: '',
    limit: 6,
    status: 'upcoming',
    students: [
      { id: 's12', name: 'Sofia', status: 'ativo', tag: 'Fixo', present: false },
      { id: 's13', name: 'Maria Luiza', status: 'ativo', tag: 'Fixo', present: false },
      { id: 's14', name: 'Luana', status: 'ativo', tag: 'Experimental', present: false },
    ],
  },
];

const initialExperimentals: ExperimentalLead[] = [
  {
    id: 'lead-1',
    name: 'Patrícia Lima',
    phone: '(34) 99999-1001',
    modality: 'Beach Tennis',
    category: 'Iniciante 1',
    teacher: 'Hugo Leonardo',
    scheduledDate: '24/03/2026',
    scheduledTime: '18:00',
    notes: 'Entrou em contato pelo Instagram',
  },
  {
    id: 'lead-2',
    name: 'Thiago Lopes',
    phone: '(34) 99999-1002',
    modality: 'Futevôlei',
    category: 'Intermediário',
    teacher: 'João José',
    scheduledDate: '25/03/2026',
    scheduledTime: '19:00',
    notes: 'Quer testar turma da noite',
  },
];

const teacherRates: Record<string, number> = {
  'Felipe Zago': 0.45,
  'Hugo Leonardo': 0.45,
  'João José': 0.3,
  Rudiery: 0.35,
};

const initialFinancialByMonth: Record<string, FinancialRow[]> = {
  MARÇO: [
    { id: 'f1', student: 'Kerol', notReceived: '', received: '305,00', paymentMethod: 'PIX', teacher: 'Hugo Leonardo' },
    { id: 'f2', student: 'Fernanda', notReceived: '305,00', received: '', paymentMethod: '', teacher: 'Hugo Leonardo' },
    { id: 'f3', student: 'Mario Cesar', notReceived: '', received: '305,00', paymentMethod: 'PIX', teacher: 'Felipe Zago' },
    { id: 'f4', student: 'Germano Reis', notReceived: '', received: '153,75', paymentMethod: 'PIX', teacher: 'Rudiery' },
    { id: 'f5', student: 'Sofia', notReceived: '', received: '250,00', paymentMethod: 'DINHEIRO', teacher: 'João José' },
  ],
  ABRIL: [],
  MAIO: [],
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

function parseMoney(value: string) {
  if (!value) return 0;
  const normalized = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function groupByDay(items: ClassItem[]) {
  const order = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  return order
    .map((day) => ({
      day,
      classes: items.filter((item) => item.day === day).sort((a, b) => a.time.localeCompare(b.time)),
    }))
    .filter((item) => item.classes.length > 0);
}

function sortByName<T extends { name: string }>(items: T[]) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

function cardStyle(): React.CSSProperties {
  return {
    background: '#fff',
    border: `1px solid ${COLORS.border}`,
    borderRadius: 24,
    boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
  };
}

function tabButton(active: boolean): React.CSSProperties {
  return {
    borderRadius: 999,
    padding: '10px 16px',
    border: `1px solid ${active ? COLORS.blue : COLORS.border}`,
    background: active ? COLORS.blueSoft : '#fff',
    color: active ? COLORS.blue : COLORS.muted,
    fontWeight: 700,
    cursor: 'pointer',
  };
}

function inputStyle(): React.CSSProperties {
  return {
    width: '100%',
    height: 38,
    borderRadius: 10,
    border: `1px solid ${COLORS.border}`,
    padding: '0 10px',
    fontSize: 14,
  };
}

function sectionTitle(text: string) {
  return (
    <div
      style={{
        background: COLORS.blue,
        color: '#fff',
        borderRadius: 16,
        padding: '12px 16px',
        fontWeight: 700,
      }}
    >
      {text}
    </div>
  );
}

function studentTagStyle(tag?: Student['tag']): React.CSSProperties {
  const base: React.CSSProperties = {
    borderRadius: 999,
    padding: '4px 8px',
    fontSize: 12,
    fontWeight: 700,
    display: 'inline-block',
  };

  if (tag === 'Experimental') return { ...base, background: COLORS.greenSoft, color: COLORS.green };
  if (tag === 'Avulsa') return { ...base, background: COLORS.blueSoft, color: COLORS.blue };
  if (tag === 'Reposição') return { ...base, background: '#FEF3C7', color: '#92400E' };
  if (tag === 'Extra') return { ...base, background: '#F3E8FF', color: '#7C3AED' };
  return { ...base, background: '#F8FAFC', color: COLORS.muted, border: `1px solid ${COLORS.border}` };
}

export default function Home() {
  const [screen, setScreen] = useState<'login' | 'teacher' | 'reception' | 'admin'>('login');
  const [loginTab, setLoginTab] = useState<LoginTab>('admin');
  const [selectedTeacherIdForLogin, setSelectedTeacherIdForLogin] = useState('t2');
  const [selectedRoleUserId, setSelectedRoleUserId] = useState('a1');
  const [selectedTeacherFolderId, setSelectedTeacherFolderId] = useState('t2');
  const [teacherTab, setTeacherTab] = useState<TeacherTab>('today');
  const [receptionTab, setReceptionTab] = useState<ReceptionTab>('classes');
  const [adminTab, setAdminTab] = useState<AdminTab>('classes');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [experimentals] = useState(initialExperimentals);
  const [financialByMonth, setFinancialByMonth] = useState(initialFinancialByMonth);
  const [selectedMonth, setSelectedMonth] = useState('MARÇO');

  const sortedTeachers = useMemo(() => sortByName(users.filter((u) => u.role === 'teacher')), []);
  const sortedReceptionUsers = useMemo(() => sortByName(users.filter((u) => u.role === 'reception')), []);
  const sortedAdminUsers = useMemo(() => sortByName(users.filter((u) => u.role === 'admin')), []);

  const currentLoginUser =
    loginTab === 'teachers'
      ? users.find((u) => u.id === selectedTeacherIdForLogin) || users[0]
      : users.find((u) => u.id === selectedRoleUserId) || users[0];

  const currentUser = currentLoginUser;
  const selectedTeacher = users.find((u) => u.id === selectedTeacherFolderId) || sortedTeachers[0];
  const teacherClasses = classes.filter((item) => item.teacherId === currentUser.id);
  const folderClasses = classes.filter((item) => item.teacherId === selectedTeacherFolderId);
  const groupedFolderClasses = groupByDay(folderClasses);
  const teacherHasOpenClass = teacherClasses.some((item) => item.status === 'open');
  const monthRows = financialByMonth[selectedMonth] || [];

  const teacherStudents = useMemo(() => {
    const unique = new Map<string, Student & { turma: string; horario: string }>();
    teacherClasses.forEach((item) => {
      item.students.forEach((student) => {
        if (!unique.has(student.id)) {
          unique.set(student.id, {
            ...student,
            turma: item.category,
            horario: `${item.day} ${item.time}`,
          });
        }
      });
    });
    return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [teacherClasses]);

  const teacherFinancialMirror = useMemo(() => {
    return monthRows
      .filter((row) => row.teacher === currentUser.name)
      .map((row) => {
        const received = parseMoney(row.received);
        const rate = teacherRates[row.teacher] || 0;
        return {
          ...row,
          teacherValue: received * rate,
        };
      })
      .sort((a, b) => a.student.localeCompare(b.student, 'pt-BR'));
  }, [monthRows, currentUser.name]);

  const teacherMonthlyValue = useMemo(() => {
    return teacherFinancialMirror.reduce((acc, row) => acc + row.teacherValue, 0);
  }, [teacherFinancialMirror]);

  const financialSummary = useMemo(() => {
    return monthRows.reduce(
      (acc, row) => {
        const received = parseMoney(row.received);
        const rate = teacherRates[row.teacher] || 0;
        acc.teacher += received * rate;
        acc.arena += received * (1 - rate);
        return acc;
      },
      { teacher: 0, arena: 0 }
    );
  }, [monthRows]);

  const sharedStudentsForSelectedTeacher = useMemo(() => {
    const map = new Map<string, Student & { turma: string; horario: string; quadra: string }>();
    folderClasses.forEach((item) => {
      item.students.forEach((student) => {
        if (!map.has(student.id)) {
          map.set(student.id, {
            ...student,
            turma: item.category,
            horario: `${item.day} ${item.time}`,
            quadra: item.court || 'A definir',
          });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [folderClasses]);

  const metrics = useMemo(() => {
    const openClasses = classes.filter((item) => item.status === 'open').length;
    const overdue = monthRows.filter((row) => row.notReceived.trim() !== '').length;
    return {
      openClasses: `${openClasses}/${classes.length}`,
      experimentals: String(experimentals.length),
      overdue: String(overdue),
      teacherTotal: formatCurrency(financialSummary.teacher),
      arenaTotal: formatCurrency(financialSummary.arena),
    };
  }, [classes, experimentals.length, monthRows, financialSummary.teacher, financialSummary.arena]);

  function handleLogin() {
    if (pin === currentLoginUser.pin) {
      setPin('');
      setPinError('');
      if (currentLoginUser.role === 'teacher') setScreen('teacher');
      if (currentLoginUser.role === 'reception') setScreen('reception');
      if (currentLoginUser.role === 'admin') setScreen('admin');
      return;
    }
    setPinError('PIN inválido.');
  }

  function logout() {
    setScreen('login');
    setPin('');
    setPinError('');
    setClassSearch('');
  }

  function openClass(classId: string) {
    setClasses((current) => {
      const target = current.find((item) => item.id === classId);
      if (!target) return current;
      const sameTeacherOpen = current.some(
        (item) => item.teacherId === target.teacherId && item.status === 'open' && item.id !== classId
      );
      if (sameTeacherOpen) return current;
      return current.map((item) => (item.id === classId ? { ...item, status: 'open' } : item));
    });
  }

  function closeClass(classId: string) {
    setClasses((current) =>
      current.map((item) => (item.id === classId ? { ...item, status: 'closed' } : item))
    );
  }

  function togglePresence(classId: string, studentId: string) {
    setClasses((current) =>
      current.map((item) => {
        if (item.id !== classId || item.status !== 'open') return item;
        return {
          ...item,
          students: item.students.map((student) =>
            student.id === studentId ? { ...student, present: !student.present } : student
          ),
        };
      })
    );
  }

  function updateClassField(classId: string, field: keyof ClassItem, value: string) {
    setClasses((current) =>
      current.map((item) => (item.id === classId ? { ...item, [field]: value } : item))
    );
  }

  function updateFinancialField(rowId: string, field: keyof FinancialRow, value: string) {
    setFinancialByMonth((current) => ({
      ...current,
      [selectedMonth]: (current[selectedMonth] || []).map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      ),
    }));
  }

  function addFinancialRow() {
    setFinancialByMonth((current) => ({
      ...current,
      [selectedMonth]: [
        ...(current[selectedMonth] || []),
        {
          id: `f-${Date.now()}`,
          student: '',
          notReceived: '',
          received: '',
          paymentMethod: '',
          teacher: selectedTeacher.name,
        },
      ],
    }));
  }

  function createMonth() {
    const name = `NOVO MÊS ${Object.keys(financialByMonth).length - 2}`;
    if (financialByMonth[name]) return;
    setFinancialByMonth((current) => ({ ...current, [name]: [] }));
    setSelectedMonth(name);
  }

  function renderHeader(title: string, subtitle: string, badge: string) {
    return (
      <div className="panel-card panel-header">
        <div>
          <div className="badge-soft">{badge}</div>
          <h1 className="panel-title">{title}</h1>
          <p className="panel-subtitle">{subtitle}</p>
        </div>

        <div className="header-user">
          <div className="avatar-circle">{currentUser.initials}</div>
          <div>
            <div className="header-user-name">{currentUser.name}</div>
            <div className="header-user-role">
              {currentUser.role === 'teacher'
                ? 'Professor'
                : currentUser.role === 'reception'
                  ? 'Recepção'
                  : 'Administração'}
            </div>
          </div>
          <button className="ghost-btn" onClick={logout}>
            Sair
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'login') {
    return (
      <main className="page-root">
        <style jsx global>{`
          * {
            box-sizing: border-box;
          }
          html,
          body {
            margin: 0;
            padding: 0;
            background: ${COLORS.bg};
            font-family: Arial, sans-serif;
            color: ${COLORS.text};
          }
          .page-root {
            min-height: 100vh;
            background: linear-gradient(180deg, ${COLORS.bg} 0%, #ffffff 100%);
            padding: 24px;
          }
          .login-wrap {
            max-width: 1180px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .panel-card {
            background: #fff;
            border: 1px solid ${COLORS.border};
            border-radius: 28px;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
          }
          .hero-card {
            overflow: hidden;
          }
          .hero-strip {
            background: ${COLORS.blue};
            color: #fff;
            padding: 20px 28px;
            font-size: 28px;
            font-weight: 800;
            letter-spacing: 0.03em;
          }
          .hero-body {
            padding: 28px;
          }
          .hero-title {
            margin: 0 0 14px;
            color: ${COLORS.blue};
            font-size: 42px;
            line-height: 1.08;
          }
          .hero-subtitle {
            margin: 0;
            color: ${COLORS.muted};
            font-size: 20px;
            line-height: 1.45;
          }
          .hero-grid {
            margin-top: 24px;
            display: grid;
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .hero-item {
            border-radius: 20px;
            border: 1px solid ${COLORS.border};
            background: ${COLORS.blueSoft};
            padding: 18px;
          }
          .hero-item strong {
            display: block;
            color: ${COLORS.blue};
            margin-bottom: 6px;
            font-size: 18px;
          }
          .hero-item span {
            color: ${COLORS.muted};
            font-size: 14px;
            line-height: 1.4;
          }
          .access-card {
            overflow: hidden;
          }
          .access-strip {
            background: ${COLORS.blue};
            color: #fff;
            padding: 18px 24px;
            font-size: 24px;
            font-weight: 800;
            text-align: center;
          }
          .access-body {
            padding: 24px;
          }
          .access-title {
            margin: 0 0 10px;
            color: ${COLORS.blue};
            font-size: 36px;
          }
          .access-subtitle {
            margin: 0 0 20px;
            color: ${COLORS.muted};
            font-size: 17px;
            line-height: 1.4;
          }
          .tab-row,
          .profile-grid,
          .summary-grid,
          .teacher-folder-grid {
            display: grid;
            gap: 12px;
          }
          .tab-row {
            grid-template-columns: 1fr;
            margin-bottom: 18px;
          }
          .profile-grid {
            margin-bottom: 18px;
            grid-template-columns: 1fr;
          }
          .summary-grid {
            grid-template-columns: 1fr;
          }
          .teacher-folder-grid {
            grid-template-columns: 1fr;
          }
          .login-profile-btn,
          .folder-btn {
            width: 100%;
            text-align: left;
            padding: 16px 18px;
            border-radius: 20px;
            border: 1px solid ${COLORS.border};
            background: #fff;
            cursor: pointer;
            font-size: 16px;
          }
          .login-profile-btn.active,
          .folder-btn.active {
            background: ${COLORS.blue};
            border-color: ${COLORS.blue};
            color: #fff;
          }
          .login-profile-role {
            font-size: 13px;
            opacity: 0.85;
            margin-top: 4px;
          }
          .pin-label {
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 10px;
          }
          .pin-input,
          .field-input,
          .field-select {
            width: 100%;
            height: 42px;
            border-radius: 12px;
            border: 1px solid ${COLORS.border};
            padding: 0 12px;
            font-size: 15px;
            background: #fff;
          }
          .pin-error {
            margin-top: 10px;
            color: ${COLORS.red};
            font-size: 14px;
          }
          .primary-btn {
            width: 100%;
            height: 48px;
            border: none;
            border-radius: 14px;
            background: ${COLORS.blue};
            color: #fff;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            margin-top: 12px;
          }
          .panel-wrap {
            max-width: 1280px;
            margin: 0 auto;
            display: grid;
            gap: 24px;
          }
          .panel-header {
            padding: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
          }
          .badge-soft {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 999px;
            background: ${COLORS.blueSoft};
            color: ${COLORS.blue};
            font-size: 12px;
            font-weight: 700;
          }
          .panel-title {
            margin: 12px 0 8px;
            color: ${COLORS.blue};
            font-size: 32px;
            line-height: 1.1;
          }
          .panel-subtitle {
            margin: 0;
            color: ${COLORS.muted};
            font-size: 16px;
          }
          .header-user {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
          }
          .avatar-circle {
            width: 42px;
            height: 42px;
            border-radius: 999px;
            background: ${COLORS.blue};
            color: #fff;
            display: grid;
            place-items: center;
            font-weight: 700;
          }
          .header-user-name {
            font-weight: 700;
            color: ${COLORS.blue};
          }
          .header-user-role {
            font-size: 12px;
            color: ${COLORS.muted};
          }
          .ghost-btn {
            height: 42px;
            border-radius: 14px;
            border: 1px solid ${COLORS.border};
            background: #fff;
            padding: 0 16px;
            font-weight: 700;
            cursor: pointer;
          }
          .chip-btn {
            border-radius: 999px;
            padding: 10px 16px;
            border: 1px solid ${COLORS.border};
            background: #fff;
            color: ${COLORS.muted};
            font-weight: 700;
            cursor: pointer;
          }
          .chip-btn.active {
            background: ${COLORS.blueSoft};
            color: ${COLORS.blue};
            border-color: ${COLORS.blue};
          }
          .alert-box {
            padding: 16px;
            border-radius: 20px;
            border: 1px solid #fcd34d;
            background: ${COLORS.amberSoft};
            color: ${COLORS.amber};
            font-weight: 700;
          }
          .summary-card {
            padding: 20px;
          }
          .summary-label {
            color: ${COLORS.muted};
            font-size: 14px;
          }
          .summary-value {
            color: ${COLORS.blue};
            font-size: 32px;
            font-weight: 800;
            margin-top: 6px;
          }
          .section-gap {
            display: grid;
            gap: 20px;
          }
          .table-card {
            overflow-x: auto;
          }
          .table-header {
            padding: 20px;
            border-bottom: 1px solid ${COLORS.border};
            color: ${COLORS.blue};
            font-weight: 700;
            font-size: 22px;
          }
          .table-inner {
            padding: 20px;
            overflow-x: auto;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          }
          th,
          td {
            padding: 12px 8px;
            text-align: left;
            vertical-align: top;
            border-bottom: 1px solid #f1f5f9;
          }
          th {
            border-bottom: 1px solid ${COLORS.border};
            font-size: 15px;
          }
          .empty-box {
            border: 1px dashed ${COLORS.border};
            border-radius: 24px;
            padding: 32px;
            background: #f8fafc;
            text-align: center;
          }
          .empty-title {
            color: ${COLORS.blue};
            font-weight: 700;
            margin-bottom: 8px;
          }
          .empty-text {
            color: ${COLORS.muted};
          }
          .presence-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .presence-card {
            padding: 16px;
            border-radius: 20px;
            border: 1px solid ${COLORS.border};
            background: #fff;
            cursor: pointer;
          }
          .presence-card.present {
            background: ${COLORS.greenSoft};
            border-color: ${COLORS.green};
          }
          .presence-card.disabled {
            opacity: 0.75;
            cursor: not-allowed;
          }
          .presence-name {
            font-weight: 700;
          }
          .presence-sub {
            margin-top: 6px;
            color: ${COLORS.muted};
            font-size: 14px;
          }
          .tag-row {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 12px;
          }
          .status-pill {
            border-radius: 999px;
            padding: 4px 8px;
            font-size: 12px;
            font-weight: 700;
            display: inline-block;
          }
          .status-inad {
            background: ${COLORS.redSoft};
            color: ${COLORS.red};
          }
          .status-default {
            background: #f8fafc;
            color: ${COLORS.muted};
            border: 1px solid ${COLORS.border};
          }
          .status-open {
            border-radius: 999px;
            border: 1px solid ${COLORS.border};
            padding: 6px 10px;
            font-size: 12px;
            font-weight: 700;
            display: inline-block;
          }
          @media (min-width: 768px) {
            .login-wrap {
              grid-template-columns: 1fr 1fr;
            }
            .hero-grid {
              grid-template-columns: repeat(3, 1fr);
            }
            .tab-row {
              grid-template-columns: repeat(3, max-content);
            }
            .profile-grid {
              grid-template-columns: repeat(2, 1fr);
            }
            .summary-grid {
              grid-template-columns: repeat(3, 1fr);
            }
            .teacher-folder-grid {
              grid-template-columns: repeat(2, 1fr);
            }
            .presence-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          @media (min-width: 1024px) {
            .profile-grid {
              grid-template-columns: repeat(2, 1fr);
            }
            .teacher-folder-grid {
              grid-template-columns: repeat(4, 1fr);
            }
            .presence-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }
        `}</style>

        <div className="login-wrap">
          <div className="panel-card hero-card">
            <div className="hero-strip">GESTOR CONEXÃO</div>
            <div className="hero-body">
              <h1 className="hero-title">Operação diária do CT em um só lugar</h1>
              <p className="hero-subtitle">
                Professores, recepção e administração com acessos separados por PIN.
              </p>

              <div className="hero-grid">
                <div className="hero-item">
                  <strong>Admin</strong>
                  <span>Visão completa com financeiro e gestão geral.</span>
                </div>
                <div className="hero-item">
                  <strong>Professores</strong>
                  <span>Turmas de hoje, presença com 1 clique e visão da própria carteira.</span>
                </div>
                <div className="hero-item">
                  <strong>Recepção</strong>
                  <span>Turmas, cadastros, alunos e controle de experimentais.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="panel-card access-card">
            <div className="access-strip">GESTOR CONEXÃO</div>
            <div className="access-body">
              <h2 className="access-title">Entrar no painel</h2>
              <p className="access-subtitle">
                Escolha a área, selecione o perfil e entre com o PIN.
              </p>

              <div className="tab-row">
                <button className={`chip-btn ${loginTab === 'admin' ? 'active' : ''}`} onClick={() => {
                  setLoginTab('admin');
                  setSelectedRoleUserId('a1');
                }}>
                  ADMIN
                </button>
                <button className={`chip-btn ${loginTab === 'teachers' ? 'active' : ''}`} onClick={() => {
                  setLoginTab('teachers');
                }}>
                  PROFESSORES
                </button>
                <button className={`chip-btn ${loginTab === 'reception' ? 'active' : ''}`} onClick={() => {
                  setLoginTab('reception');
                  setSelectedRoleUserId('r1');
                }}>
                  RECEPÇÃO
                </button>
              </div>

              <div className="profile-grid">
                {loginTab === 'teachers'
                  ? sortedTeachers.map((user) => {
                      const active = user.id === selectedTeacherIdForLogin;
                      return (
                        <button
                          key={user.id}
                          className={`login-profile-btn ${active ? 'active' : ''}`}
                          onClick={() => setSelectedTeacherIdForLogin(user.id)}
                        >
                          <div style={{ fontWeight: 700 }}>{user.name}</div>
                          <div className="login-profile-role">Professor</div>
                        </button>
                      );
                    })
                  : loginTab === 'reception'
                    ? sortedReceptionUsers.map((user) => {
                        const active = user.id === selectedRoleUserId;
                        return (
                          <button
                            key={user.id}
                            className={`login-profile-btn ${active ? 'active' : ''}`}
                            onClick={() => setSelectedRoleUserId(user.id)}
                          >
                            <div style={{ fontWeight: 700 }}>{user.name}</div>
                            <div className="login-profile-role">Recepção</div>
                          </button>
                        );
                      })
                    : sortedAdminUsers.map((user) => {
                        const active = user.id === selectedRoleUserId;
                        return (
                          <button
                            key={user.id}
                            className={`login-profile-btn ${active ? 'active' : ''}`}
                            onClick={() => setSelectedRoleUserId(user.id)}
                          >
                            <div style={{ fontWeight: 700 }}>{user.name}</div>
                            <div className="login-profile-role">Administração</div>
                          </button>
                        );
                      })}
              </div>

              <div className="pin-label">PIN de acesso</div>
              <input
                className="pin-input"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Digite o PIN de 4 dígitos"
              />
              {pinError ? <div className="pin-error">{pinError}</div> : null}

              <button className="primary-btn" onClick={handleLogin}>
                Entrar com PIN
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (screen === 'teacher') {
    return (
      <main className="page-root">
        <div className="panel-wrap">
          {renderHeader(
            'Acesso do professor',
            'Turmas do dia, presença rápida e visão da própria carteira.',
            'Gestor Conexão · Professor'
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className={`chip-btn ${teacherTab === 'space' ? 'active' : ''}`} onClick={() => setTeacherTab('space')}>
              Minha área
            </button>
            <button className={`chip-btn ${teacherTab === 'today' ? 'active' : ''}`} onClick={() => setTeacherTab('today')}>
              Turmas de hoje
            </button>
          </div>

          {teacherTab === 'today' ? (
            <>
              {teacherHasOpenClass ? <div className="alert-box">É obrigatório encerrar a turma aberta antes de iniciar a próxima.</div> : null}

              {teacherClasses.map((item) => {
                const filteredStudents = item.students.filter((student) =>
                  student.name.toLowerCase().includes(classSearch.toLowerCase())
                );
                const disableOpen = teacherHasOpenClass && item.status !== 'open';

                return (
                  <div key={item.id} className="panel-card">
                    <div className="panel-header" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                      <div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                          <span className="status-pill" style={{ background: COLORS.greenSoft, color: COLORS.green }}>
                            {item.day}
                          </span>
                        </div>
                        <h2 className="panel-title" style={{ fontSize: 28, marginBottom: 0 }}>
                          {item.time}
                        </h2>
                        <p className="panel-subtitle">
                          Categoria: {item.category} · {item.court || 'Quadra a definir'} · {item.students.length}/{item.limit}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          className="chip-btn"
                          onClick={() => openClass(item.id)}
                          disabled={disableOpen || item.status === 'open'}
                          style={{
                            background: disableOpen || item.status === 'open' ? '#CBD5E1' : COLORS.blue,
                            color: '#fff',
                            borderColor: disableOpen || item.status === 'open' ? '#CBD5E1' : COLORS.blue,
                          }}
                        >
                          Abrir turma
                        </button>
                        <button
                          className="chip-btn"
                          onClick={() => closeClass(item.id)}
                          disabled={item.status !== 'open'}
                          style={{
                            color: item.status === 'open' ? COLORS.green : '#94A3B8',
                            borderColor: item.status === 'open' ? COLORS.green : COLORS.border,
                          }}
                        >
                          Encerrar turma
                        </button>
                      </div>
                    </div>

                    <div className="table-inner">
                      <input
                        className="pin-input"
                        value={classSearch}
                        onChange={(e) => setClassSearch(e.target.value)}
                        placeholder="Buscar aluno pelo nome"
                        style={{ maxWidth: 360, marginBottom: 20 }}
                      />

                      {filteredStudents.length > 0 ? (
                        <div className="presence-grid">
                          {filteredStudents.map((student) => (
                            <button
                              key={student.id}
                              onClick={() => togglePresence(item.id, student.id)}
                              disabled={item.status !== 'open'}
                              className={`presence-card ${student.present ? 'present' : ''} ${item.status !== 'open' ? 'disabled' : ''}`}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                                <div>
                                  <div className="presence-name">{student.name}</div>
                                  <div className="presence-sub">{student.present ? 'Presente' : 'Não marcado'}</div>
                                </div>
                                <div style={studentTagStyle(student.tag)}>{student.tag || 'Fixo'}</div>
                              </div>

                              <div className="tag-row">
                                {student.status === 'inadimplente' ? (
                                  <span className="status-pill status-inad">Inadimplente</span>
                                ) : null}
                                {student.tag === 'Experimental' ? (
                                  <span className="status-pill" style={{ background: COLORS.greenSoft, color: COLORS.green }}>
                                    Experimental
                                  </span>
                                ) : null}
                                {student.tag === 'Avulsa' ? (
                                  <span className="status-pill" style={{ background: COLORS.blueSoft, color: COLORS.blue }}>
                                    Aula avulsa
                                  </span>
                                ) : null}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-box">
                          <div className="empty-title">Aguardando importação ou cadastro dos alunos</div>
                          <div className="empty-text">A estrutura da turma já está pronta. Os alunos podem ser incluídos depois.</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              <div className="summary-grid">
                <div className="panel-card summary-card">
                  <div className="summary-label">Turmas dele</div>
                  <div className="summary-value">{teacherClasses.length}</div>
                </div>
                <div className="panel-card summary-card">
                  <div className="summary-label">Alunos dele</div>
                  <div className="summary-value">{teacherStudents.length}</div>
                </div>
                <div className="panel-card summary-card">
                  <div className="summary-label">Valor do mês</div>
                  <div className="summary-value">{formatCurrency(teacherMonthlyValue)}</div>
                </div>
              </div>

              <div className="panel-card table-card">
                <div className="table-header">Minhas turmas</div>
                <div className="table-inner">
                  <table>
                    <thead>
                      <tr>
                        <th>Dia</th>
                        <th>Horário</th>
                        <th>Categoria</th>
                        <th>Quadra</th>
                        <th>Alunos da turma</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacherClasses.map((item) => (
                        <tr key={item.id}>
                          <td>{item.day}</td>
                          <td><strong>{item.time}</strong></td>
                          <td>{item.category}</td>
                          <td>{item.court || 'A definir'}</td>
                          <td>{item.students.length > 0 ? item.students.map((s) => s.name).join(', ') : 'Sem alunos'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="panel-card table-card">
                <div className="table-header">Minha lista de alunos · espelho do financeiro</div>
                <div className="table-inner">
                  <table>
                    <thead>
                      <tr>
                        <th>Aluno</th>
                        <th>Não recebido</th>
                        <th>Recebido</th>
                        <th>Forma de pagamento</th>
                        <th>Meu valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacherFinancialMirror.length > 0 ? (
                        teacherFinancialMirror.map((row) => (
                          <tr key={row.id}>
                            <td><strong>{row.student}</strong></td>
                            <td>{row.notReceived || '-'}</td>
                            <td>{row.received || '-'}</td>
                            <td>{row.paymentMethod || '-'}</td>
                            <td style={{ color: COLORS.blue, fontWeight: 700 }}>{formatCurrency(row.teacherValue)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ padding: 28, textAlign: 'center', color: COLORS.muted }}>
                            Sem lançamentos para este professor neste mês.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    );
  }

  if (screen === 'reception') {
    return (
      <main className="page-root">
        <div className="panel-wrap">
          {renderHeader(
            'Painel da recepção',
            'Turmas, alunos e cadastros, sem acesso ao financeiro.',
            'Gestor Conexão · Recepção'
          )}

          <div className="summary-grid">
            <div className="panel-card summary-card">
              <div className="summary-label">Turmas abertas</div>
              <div className="summary-value">{metrics.openClasses}</div>
            </div>
            <div className="panel-card summary-card">
              <div className="summary-label">Experimentais cadastrados</div>
              <div className="summary-value">{metrics.experimentals}</div>
            </div>
            <div className="panel-card summary-card">
              <div className="summary-label">Professores</div>
              <div className="summary-value">{sortedTeachers.length}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className={`chip-btn ${receptionTab === 'classes' ? 'active' : ''}`} onClick={() => setReceptionTab('classes')}>
              Turmas e alunos
            </button>
            <button className={`chip-btn ${receptionTab === 'registrations' ? 'active' : ''}`} onClick={() => setReceptionTab('registrations')}>
              Cadastros
            </button>
          </div>

          {receptionTab === 'classes' ? (
            <>
              <div>
                <div style={{ marginBottom: 10, color: COLORS.muted, fontWeight: 700 }}>Professores</div>
                <div className="teacher-folder-grid">
                  {sortedTeachers.map((teacher) => {
                    const active = teacher.id === selectedTeacherFolderId;
                    return (
                      <button
                        key={teacher.id}
                        className={`folder-btn ${active ? 'active' : ''}`}
                        onClick={() => setSelectedTeacherFolderId(teacher.id)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontWeight: 700 }}>{teacher.name}</span>
                          <span style={{ color: active ? '#fff' : COLORS.muted }}>⋮</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="section-gap">
                <div>{sectionTitle(`Turmas · ${selectedTeacher.name}`)}</div>

                {groupedFolderClasses.map((group) => (
                  <div key={group.day}>
                    {sectionTitle(group.day)}
                    <div className="panel-card table-card" style={{ marginTop: 12 }}>
                      <div className="table-inner">
                        <table>
                          <thead>
                            <tr>
                              <th>Horário</th>
                              <th>Categoria</th>
                              <th>Quadra</th>
                              <th>Alunos</th>
                              <th>Limite</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.classes.map((item) => (
                              <tr key={item.id}>
                                <td><strong>{item.time}</strong></td>
                                <td>
                                  <select
                                    className="field-select"
                                    value={item.category}
                                    onChange={(e) => updateClassField(item.id, 'category', e.target.value)}
                                  >
                                    {(item.sport === 'Beach Tennis' ? categoryOptions.beach : categoryOptions.fute).map((option) => (
                                      <option key={option} value={option}>{option}</option>
                                    ))}
                                  </select>
                                </td>
                                <td>
                                  <input
                                    className="field-input"
                                    value={item.court}
                                    onChange={(e) => updateClassField(item.id, 'court', e.target.value)}
                                    placeholder="A definir"
                                  />
                                </td>
                                <td>{item.students.map((s) => s.name).join(', ') || 'Sem alunos'}</td>
                                <td>{item.limit}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}

                <div>
                  {sectionTitle(`Lista de alunos · ${selectedTeacher.name}`)}
                  <div className="panel-card table-card" style={{ marginTop: 12 }}>
                    <div className="table-inner">
                      <table>
                        <thead>
                          <tr>
                            <th>Aluno</th>
                            <th>Turma</th>
                            <th>Horário</th>
                            <th>Quadra</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sharedStudentsForSelectedTeacher.length > 0 ? (
                            sharedStudentsForSelectedTeacher.map((student) => (
                              <tr key={student.id}>
                                <td><strong>{student.name}</strong></td>
                                <td>{student.turma}</td>
                                <td>{student.horario}</td>
                                <td>{student.quadra}</td>
                                <td>
                                  {student.status === 'inadimplente' ? (
                                    <span className="status-pill status-inad">Inadimplente</span>
                                  ) : (
                                    <span className="status-pill status-default">Ativo</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} style={{ padding: 28, textAlign: 'center', color: COLORS.muted }}>
                                Aguardando importação de alunos.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="section-gap">
              <div>{sectionTitle('Cadastros')}</div>

              <div className="panel-card" style={{ padding: 20 }}>
                <div style={{ fontWeight: 700, color: COLORS.blue, marginBottom: 16 }}>Cadastro de alunos</div>
                <div className="summary-grid" style={{ gridTemplateColumns: '1fr', gap: 12 }}>
                  <input className="field-input" placeholder="Nome do aluno" />
                  <input className="field-input" placeholder="Telefone" />
                  <input className="field-input" placeholder="CPF" />
                  <input className="field-input" placeholder="Data de nascimento" />
                  <input className="field-input" placeholder="Responsável (se menor)" />
                  <input className="field-input" placeholder="Telefone do responsável" />
                </div>
              </div>

              <div className="panel-card table-card">
                <div className="table-header">Pasta · Aula experimental</div>
                <div className="table-inner">
                  <table>
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Telefone</th>
                        <th>Modalidade</th>
                        <th>Categoria</th>
                        <th>Professor</th>
                        <th>Agendamento</th>
                        <th>Observações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortByName(experimentals).map((item) => (
                        <tr key={item.id}>
                          <td><strong>{item.name}</strong></td>
                          <td>{item.phone}</td>
                          <td>{item.modality}</td>
                          <td>{item.category}</td>
                          <td>{item.teacher}</td>
                          <td>{item.scheduledDate} · {item.scheduledTime}</td>
                          <td>{item.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="page-root">
      <div className="panel-wrap">
        {renderHeader(
          'Painel da administração',
          'Gestão completa com turmas, cadastros e financeiro.',
          'Gestor Conexão · Administração'
        )}

        <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
          {[
            ['Alunos em aberto', metrics.overdue],
            ['Experimentais', metrics.experimentals],
            ['Total arena', metrics.arenaTotal],
            ['Total professor', metrics.teacherTotal],
            ['Turmas abertas', metrics.openClasses],
          ].map(([title, value]) => (
            <div key={title} className="panel-card summary-card">
              <div className="summary-label">{title}</div>
              <div className="summary-value">{value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className={`chip-btn ${adminTab === 'classes' ? 'active' : ''}`} onClick={() => setAdminTab('classes')}>
            Turmas e alunos
          </button>
          <button className={`chip-btn ${adminTab === 'financial' ? 'active' : ''}`} onClick={() => setAdminTab('financial')}>
            Financeiro
          </button>
          <button className={`chip-btn ${adminTab === 'registrations' ? 'active' : ''}`} onClick={() => setAdminTab('registrations')}>
            Cadastros
          </button>
        </div>

        {adminTab === 'classes' ? (
          <>
            <div>
              <div style={{ marginBottom: 10, color: COLORS.muted, fontWeight: 700 }}>Professores</div>
              <div className="teacher-folder-grid">
                {sortedTeachers.map((teacher) => {
                  const active = teacher.id === selectedTeacherFolderId;
                  return (
                    <button
                      key={teacher.id}
                      className={`folder-btn ${active ? 'active' : ''}`}
                      onClick={() => setSelectedTeacherFolderId(teacher.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontWeight: 700 }}>{teacher.name}</span>
                        <span style={{ color: active ? '#fff' : COLORS.muted }}>⋮</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {groupedFolderClasses.map((group) => (
              <div key={group.day}>
                {sectionTitle(`${selectedTeacher.name} · ${group.day}`)}
                <div className="panel-card table-card" style={{ marginTop: 12 }}>
                  <div className="table-inner">
                    <table>
                      <thead>
                        <tr>
                          <th>Horário</th>
                          <th>Categoria</th>
                          <th>Quadra</th>
                          <th>Alunos</th>
                          <th>Limite</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.classes.map((item) => (
                          <tr key={item.id}>
                            <td><strong>{item.time}</strong></td>
                            <td>
                              <select
                                className="field-select"
                                value={item.category}
                                onChange={(e) => updateClassField(item.id, 'category', e.target.value)}
                              >
                                {(item.sport === 'Beach Tennis' ? categoryOptions.beach : categoryOptions.fute).map((option) => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                className="field-input"
                                value={item.court}
                                onChange={(e) => updateClassField(item.id, 'court', e.target.value)}
                                placeholder="A definir"
                              />
                            </td>
                            <td>{item.students.map((s) => s.name).join(', ') || 'Sem alunos'}</td>
                            <td>{item.limit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : null}

        {adminTab === 'registrations' ? (
          <div className="section-gap">
            <div className="panel-card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, color: COLORS.blue, marginBottom: 16 }}>Cadastro de alunos</div>
              <div className="summary-grid" style={{ gridTemplateColumns: '1fr', gap: 12 }}>
                <input className="field-input" placeholder="Nome do aluno" />
                <input className="field-input" placeholder="Telefone" />
                <input className="field-input" placeholder="CPF" />
                <input className="field-input" placeholder="Data de nascimento" />
                <input className="field-input" placeholder="Responsável (se menor)" />
                <input className="field-input" placeholder="Telefone do responsável" />
              </div>
            </div>

            <div className="panel-card table-card">
              <div className="table-header">Pasta · Aula experimental</div>
              <div className="table-inner">
                <table>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Telefone</th>
                      <th>Modalidade</th>
                      <th>Categoria</th>
                      <th>Professor</th>
                      <th>Agendamento</th>
                      <th>Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortByName(experimentals).map((item) => (
                      <tr key={item.id}>
                        <td><strong>{item.name}</strong></td>
                        <td>{item.phone}</td>
                        <td>{item.modality}</td>
                        <td>{item.category}</td>
                        <td>{item.teacher}</td>
                        <td>{item.scheduledDate} · {item.scheduledTime}</td>
                        <td>{item.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}

        {adminTab === 'financial' ? (
          <div className="section-gap">
            <div>{sectionTitle('Financeiro')}</div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {Object.keys(financialByMonth).sort((a, b) => a.localeCompare(b, 'pt-BR')).map((month) => (
                <button
                  key={month}
                  className={`chip-btn ${selectedMonth === month ? 'active' : ''}`}
                  onClick={() => setSelectedMonth(month)}
                >
                  {month}
                </button>
              ))}
              <button className="chip-btn" onClick={createMonth} style={{ color: COLORS.green, borderColor: COLORS.green }}>
                Novo mês
              </button>
            </div>

            <div className="summary-grid">
              {[
                ['Alunos em aberto', metrics.overdue],
                ['Total professor', metrics.teacherTotal],
                ['Total arena', metrics.arenaTotal],
              ].map(([title, value]) => (
                <div key={title} className="panel-card summary-card">
                  <div className="summary-label">{title}</div>
                  <div className="summary-value">{value}</div>
                </div>
              ))}
            </div>

            <div className="panel-card table-card">
              <div className="table-header">Recebimento do mês · {selectedMonth}</div>
              <div className="table-inner">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                  <button className="chip-btn active" onClick={addFinancialRow}>
                    Adicionar linha
                  </button>
                </div>

                <table>
                  <thead>
                    <tr>
                      <th>Aluno</th>
                      <th>Não recebido</th>
                      <th>Recebido</th>
                      <th>Forma de pagamento</th>
                      <th>Professor</th>
                      <th>Arena</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthRows.map((row) => {
                      const received = parseMoney(row.received);
                      const rate = teacherRates[row.teacher] || 0;
                      const teacherValue = received * rate;
                      const arenaValue = received * (1 - rate);

                      return (
                        <tr key={row.id}>
                          <td><input className="field-input" value={row.student} onChange={(e) => updateFinancialField(row.id, 'student', e.target.value)} /></td>
                          <td><input className="field-input" value={row.notReceived} onChange={(e) => updateFinancialField(row.id, 'notReceived', e.target.value)} /></td>
                          <td><input className="field-input" value={row.received} onChange={(e) => updateFinancialField(row.id, 'received', e.target.value)} /></td>
                          <td><input className="field-input" value={row.paymentMethod} onChange={(e) => updateFinancialField(row.id, 'paymentMethod', e.target.value)} /></td>
                          <td style={{ color: COLORS.blue, fontWeight: 700 }}>{formatCurrency(teacherValue)}</td>
                          <td style={{ color: COLORS.blue, fontWeight: 700 }}>{formatCurrency(arenaValue)}</td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'right', fontWeight: 800, color: COLORS.blue }}>
                        TOTAL AULAS
                      </td>
                      <td style={{ fontWeight: 800, color: COLORS.green }}>{formatCurrency(financialSummary.teacher)}</td>
                      <td style={{ fontWeight: 800, color: COLORS.green }}>{formatCurrency(financialSummary.arena)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
