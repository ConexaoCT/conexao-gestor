'use client';

import { useMemo, useState } from 'react';

type UserRole = 'teacher' | 'reception' | 'admin';
type ClassStatus = 'open' | 'upcoming' | 'closed';
type Sport = 'Beach Tennis' | 'Futevôlei';

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
  tag?: 'Fixo' | 'Reposição' | 'Avulsa' | 'Experimental' | 'Extra';
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

type Lead = {
  id: string;
  name: string;
  phone: string;
  modality: Sport;
  type: 'Experimental' | 'Avulsa';
  category: string;
  teacher: string;
  scheduledDate: string;
  scheduledTime: string;
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
};

const users: User[] = [
  { id: 't1', name: 'Hugo Leonardo', initials: 'HL', pin: '1111', role: 'teacher', sport: 'Beach Tennis' },
  { id: 't2', name: 'Felipe Zago', initials: 'FZ', pin: '2222', role: 'teacher', sport: 'Beach Tennis' },
  { id: 't3', name: 'Rudiery', initials: 'RU', pin: '3333', role: 'teacher', sport: 'Beach Tennis' },
  { id: 't4', name: 'João José', initials: 'JJ', pin: '4444', role: 'teacher', sport: 'Futevôlei' },
  { id: 'r1', name: 'Recepção CT', initials: 'RC', pin: '5555', role: 'reception' },
  { id: 'a1', name: 'Admin CT', initials: 'AC', pin: '9999', role: 'admin' },
];

const teacherFolders = users.filter((u) => u.role === 'teacher');

const categoryOptions = {
  beach: [
    'Iniciante 1',
    'Iniciante 2',
    'Intermediário 1',
    'Intermediário 2',
    'Avançado 1',
    'Avançado 2',
    'Infanto/Juvenil Iniciante',
    'Infanto/Juvenil Intermediário',
    'Infanto/Juvenil Avançado',
    'A definir',
  ],
  fute: [
    'Aprendiz',
    'Iniciante',
    'Intermediário',
    'Avançado',
    'Kids 1',
    'Kids 2',
    'Experimental',
    'Aprendiz - Exp',
    'Infanto/Juvenil Iniciante',
    'Infanto/Juvenil Intermediário',
    'Infanto/Juvenil Avançado',
  ],
};

const initialClasses: ClassItem[] = [
  { id: 'h-seg-18', teacherId: 't1', teacherName: 'Hugo Leonardo', sport: 'Beach Tennis', day: 'Segunda', time: '18:00', category: 'A definir', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'h-seg-19', teacherId: 't1', teacherName: 'Hugo Leonardo', sport: 'Beach Tennis', day: 'Segunda', time: '19:00', category: 'Intermediário 2', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'h-seg-20', teacherId: 't1', teacherName: 'Hugo Leonardo', sport: 'Beach Tennis', day: 'Segunda', time: '20:00', category: 'Iniciante 2', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'h-ter-07', teacherId: 't1', teacherName: 'Hugo Leonardo', sport: 'Beach Tennis', day: 'Terça', time: '07:00', category: 'Iniciante 2', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'h-ter-18', teacherId: 't1', teacherName: 'Hugo Leonardo', sport: 'Beach Tennis', day: 'Terça', time: '18:00', category: 'Iniciante 2', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'h-ter-19', teacherId: 't1', teacherName: 'Hugo Leonardo', sport: 'Beach Tennis', day: 'Terça', time: '19:00', category: 'Intermediário 1', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'h-qua-17', teacherId: 't1', teacherName: 'Hugo Leonardo', sport: 'Beach Tennis', day: 'Quarta', time: '17:00', category: 'Infanto/Juvenil Iniciante', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'h-qua-18', teacherId: 't1', teacherName: 'Hugo Leonardo', sport: 'Beach Tennis', day: 'Quarta', time: '18:00', category: 'Infanto/Juvenil Intermediário', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'h-qua-19', teacherId: 't1', teacherName: 'Hugo Leonardo', sport: 'Beach Tennis', day: 'Quarta', time: '19:00', category: 'Intermediário 1', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'h-qua-20', teacherId: 't1', teacherName: 'Hugo Leonardo', sport: 'Beach Tennis', day: 'Quarta', time: '20:00', category: 'Iniciante 2', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'h-qui-0730', teacherId: 't1', teacherName: 'Hugo Leonardo', sport: 'Beach Tennis', day: 'Quinta', time: '07:30', category: 'Iniciante 1', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'h-qui-0830', teacherId: 't1', teacherName: 'Hugo Leonardo', sport: 'Beach Tennis', day: 'Quinta', time: '08:30', category: 'Infanto/Juvenil Iniciante', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'h-qui-18', teacherId: 't1', teacherName: 'Hugo Leonardo', sport: 'Beach Tennis', day: 'Quinta', time: '18:00', category: 'Iniciante 2', court: '', limit: 5, status: 'upcoming', students: [] },

  { id: 'z-seg-07', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Segunda', time: '07:00', category: 'Iniciante 2', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'z-seg-08', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Segunda', time: '08:00', category: 'Intermediário 2', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'z-seg-15', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Segunda', time: '15:00', category: 'Avançado 1', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'z-seg-16', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Segunda', time: '16:00', category: 'Iniciante 1', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'z-seg-17', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Segunda', time: '17:00', category: 'Intermediário 1', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'z-seg-18', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Segunda', time: '18:00', category: 'Iniciante 1', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'z-seg-19', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Segunda', time: '19:00', category: 'Iniciante 1', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'z-ter-07', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Terça', time: '07:00', category: 'Iniciante 2', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'z-ter-08', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Terça', time: '08:00', category: 'Iniciante 1', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'z-ter-09', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Terça', time: '09:00', category: 'Avançado 1', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'z-ter-17', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Terça', time: '17:00', category: 'Intermediário 2', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'z-ter-18', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Terça', time: '18:00', category: 'Intermediário 1', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'z-ter-19', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Terça', time: '19:00', category: 'Intermediário 1', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'z-qua-07', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Quarta', time: '07:00', category: 'Iniciante 2', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'z-qua-08', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Quarta', time: '08:00', category: 'Intermediário 2', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'z-qua-15', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Quarta', time: '15:00', category: 'Avançado 1', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'z-qua-17', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Quarta', time: '17:00', category: 'Intermediário 1', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'z-qua-18', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Quarta', time: '18:00', category: 'Iniciante 2', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'z-qua-19', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Quarta', time: '19:00', category: 'Intermediário 1', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'z-qui-07', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Quinta', time: '07:00', category: 'Intermediário 2', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'z-qui-08', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Quinta', time: '08:00', category: 'Iniciante 2', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'z-qui-09', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Quinta', time: '09:00', category: 'Intermediário 2', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'z-qui-17', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Quinta', time: '17:00', category: 'Avançado 2', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'z-qui-18', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Quinta', time: '18:00', category: 'Intermediário 1', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'z-qui-19', teacherId: 't2', teacherName: 'Felipe Zago', sport: 'Beach Tennis', day: 'Quinta', time: '19:00', category: 'Iniciante 2', court: '', limit: 5, status: 'upcoming', students: [] },

  { id: 'r-seg-17', teacherId: 't3', teacherName: 'Rudiery', sport: 'Beach Tennis', day: 'Segunda', time: '17:00', category: 'Iniciante', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'r-seg-18', teacherId: 't3', teacherName: 'Rudiery', sport: 'Beach Tennis', day: 'Segunda', time: '18:00', category: 'Iniciante', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'r-ter-17', teacherId: 't3', teacherName: 'Rudiery', sport: 'Beach Tennis', day: 'Terça', time: '17:00', category: 'Iniciante', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'r-qui-17', teacherId: 't3', teacherName: 'Rudiery', sport: 'Beach Tennis', day: 'Quinta', time: '17:00', category: 'Iniciante', court: '', limit: 5, status: 'upcoming', students: [] },
  { id: 'r-qui-18', teacherId: 't3', teacherName: 'Rudiery', sport: 'Beach Tennis', day: 'Quinta', time: '18:00', category: 'Iniciante', court: '', limit: 5, status: 'upcoming', students: [] },

  { id: 'j-seg-18', teacherId: 't4', teacherName: 'João José', sport: 'Futevôlei', day: 'Segunda', time: '18:00', category: 'Experimental', court: '', limit: 6, status: 'upcoming', students: [] },
  { id: 'j-seg-20', teacherId: 't4', teacherName: 'João José', sport: 'Futevôlei', day: 'Segunda', time: '20:00', category: 'Iniciante', court: '', limit: 6, status: 'upcoming', students: [] },
  { id: 'j-ter-07', teacherId: 't4', teacherName: 'João José', sport: 'Futevôlei', day: 'Terça', time: '07:00', category: 'Iniciante', court: '', limit: 6, status: 'upcoming', students: [] },
  { id: 'j-ter-08', teacherId: 't4', teacherName: 'João José', sport: 'Futevôlei', day: 'Terça', time: '08:00', category: 'Aprendiz', court: '', limit: 6, status: 'upcoming', students: [] },
  { id: 'j-ter-16', teacherId: 't4', teacherName: 'João José', sport: 'Futevôlei', day: 'Terça', time: '16:00', category: 'Kids 1', court: '', limit: 6, status: 'upcoming', students: [] },
  { id: 'j-ter-17', teacherId: 't4', teacherName: 'João José', sport: 'Futevôlei', day: 'Terça', time: '17:00', category: 'Kids 2', court: '', limit: 6, status: 'upcoming', students: [] },
  { id: 'j-ter-19', teacherId: 't4', teacherName: 'João José', sport: 'Futevôlei', day: 'Terça', time: '19:00', category: 'Aprendiz - Exp', court: '', limit: 6, status: 'upcoming', students: [] },
  { id: 'j-ter-20', teacherId: 't4', teacherName: 'João José', sport: 'Futevôlei', day: 'Terça', time: '20:00', category: 'Iniciante', court: '', limit: 6, status: 'upcoming', students: [] },
  { id: 'j-qua-20', teacherId: 't4', teacherName: 'João José', sport: 'Futevôlei', day: 'Quarta', time: '20:00', category: 'Iniciante', court: '', limit: 6, status: 'upcoming', students: [] },
  { id: 'j-qui-07', teacherId: 't4', teacherName: 'João José', sport: 'Futevôlei', day: 'Quinta', time: '07:00', category: 'Iniciante', court: '', limit: 6, status: 'upcoming', students: [] },
  { id: 'j-qui-08', teacherId: 't4', teacherName: 'João José', sport: 'Futevôlei', day: 'Quinta', time: '08:00', category: 'Aprendiz', court: '', limit: 6, status: 'upcoming', students: [] },
  { id: 'j-qui-16', teacherId: 't4', teacherName: 'João José', sport: 'Futevôlei', day: 'Quinta', time: '16:00', category: 'Kids 1', court: '', limit: 6, status: 'upcoming', students: [] },
  { id: 'j-qui-17', teacherId: 't4', teacherName: 'João José', sport: 'Futevôlei', day: 'Quinta', time: '17:00', category: 'Kids 2', court: '', limit: 6, status: 'upcoming', students: [] },
  { id: 'j-qui-19', teacherId: 't4', teacherName: 'João José', sport: 'Futevôlei', day: 'Quinta', time: '19:00', category: 'Experimental', court: '', limit: 6, status: 'upcoming', students: [] },
  { id: 'j-qui-20', teacherId: 't4', teacherName: 'João José', sport: 'Futevôlei', day: 'Quinta', time: '20:00', category: 'Iniciante', court: '', limit: 6, status: 'upcoming', students: [] },
];

const initialLeads: Lead[] = [
  {
    id: 'lead-1',
    name: 'Patrícia Lima',
    phone: '(34) 99999-1001',
    modality: 'Beach Tennis',
    type: 'Experimental',
    category: 'Iniciante 1',
    teacher: 'Hugo Leonardo',
    scheduledDate: '24/03/2026',
    scheduledTime: '18:00',
  },
  {
    id: 'lead-2',
    name: 'Thiago Lopes',
    phone: '(34) 99999-1002',
    modality: 'Futevôlei',
    type: 'Avulsa',
    category: 'Intermediário',
    teacher: 'João José',
    scheduledDate: '25/03/2026',
    scheduledTime: '19:00',
  },
];

const teacherRates: Record<string, number> = {
  'Hugo Leonardo': 0.45,
  'Felipe Zago': 0.45,
  Rudiery: 0.35,
  'João José': 0.3,
};

const initialFinancialByMonth: Record<string, FinancialRow[]> = {
  MARÇO: [
    { id: 'f1', student: '', notReceived: '', received: '', paymentMethod: '', teacher: 'Rudiery' },
    { id: 'f2', student: '', notReceived: '', received: '', paymentMethod: '', teacher: 'Rudiery' },
    { id: 'f3', student: '', notReceived: '', received: '', paymentMethod: '', teacher: 'Rudiery' },
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
      classes: items
        .filter((item) => item.day === day)
        .sort((a, b) => a.time.localeCompare(b.time)),
    }))
    .filter((item) => item.classes.length > 0);
}

function cardStyle(): React.CSSProperties {
  return {
    background: '#fff',
    border: `1px solid ${COLORS.border}`,
    borderRadius: 24,
    boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
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

export default function Home() {
  const [screen, setScreen] = useState<'login' | 'teacher' | 'ops'>('login');
  const [selectedUserId, setSelectedUserId] = useState('t1');
  const [selectedTeacherFolderId, setSelectedTeacherFolderId] = useState('t1');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [leads] = useState(initialLeads);
  const [financialByMonth, setFinancialByMonth] = useState(initialFinancialByMonth);
  const [selectedMonth, setSelectedMonth] = useState('MARÇO');

  const selectedUser = users.find((u) => u.id === selectedUserId) || users[0];
  const selectedTeacher = users.find((u) => u.id === selectedTeacherFolderId) || teacherFolders[0];
  const teacherClasses = classes.filter((item) => item.teacherId === selectedUser.id);
  const folderClasses = classes.filter((item) => item.teacherId === selectedTeacherFolderId);
  const groupedFolderClasses = groupByDay(folderClasses);
  const teacherHasOpenClass = teacherClasses.some((item) => item.status === 'open');
  const monthRows = financialByMonth[selectedMonth] || [];

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

  const metrics = useMemo(() => {
    const openClasses = classes.filter((item) => item.status === 'open').length;
    const overdue = monthRows.filter((row) => row.notReceived.trim() !== '').length;
    return {
      openClasses: `${openClasses}/${classes.length}`,
      leads: String(leads.length),
      overdue: String(overdue),
      teacherTotal: formatCurrency(financialSummary.teacher),
      arenaTotal: formatCurrency(financialSummary.arena),
    };
  }, [classes, leads.length, monthRows, financialSummary.teacher, financialSummary.arena]);

  function handleLogin() {
    if (pin === selectedUser.pin) {
      setPin('');
      setPinError('');
      setScreen(selectedUser.role === 'teacher' ? 'teacher' : 'ops');
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
      <div
        style={{
          ...cardStyle(),
          padding: 24,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              borderRadius: 999,
              background: COLORS.blueSoft,
              color: COLORS.blue,
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {badge}
          </div>
          <h1 style={{ margin: '12px 0 8px', color: COLORS.blue, fontSize: 32 }}>{title}</h1>
          <p style={{ margin: 0, color: COLORS.muted }}>{subtitle}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: COLORS.blue,
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
              }}
            >
              {selectedUser.initials}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: COLORS.blue }}>{selectedUser.name}</div>
              <div style={{ fontSize: 12, color: COLORS.muted }}>
                {selectedUser.role === 'teacher'
                  ? 'Professor'
                  : selectedUser.role === 'reception'
                    ? 'Recepção'
                    : 'Administração'}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              border: `1px solid ${COLORS.border}`,
              background: '#fff',
              borderRadius: 14,
              padding: '10px 16px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'login') {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: `linear-gradient(180deg, ${COLORS.bg} 0%, #ffffff 100%)`,
          padding: 24,
          fontFamily: 'Arial, sans-serif',
          color: COLORS.text,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1.15fr 0.85fr',
            gap: 24,
          }}
        >
          <div
            style={{
              background: COLORS.blue,
              color: '#fff',
              borderRadius: 32,
              padding: 40,
              minHeight: 520,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-block',
                  borderRadius: 999,
                  padding: '6px 12px',
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                Gestor Conexão
              </div>
              <h1 style={{ fontSize: 48, margin: '20px 0 16px' }}>Operação diária do CT em um só lugar</h1>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.82)', fontSize: 18 }}>
                Login por PIN, professores organizados por pasta, turmas por dia e financeiro no modelo que vocês já usam.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                ['Acesso por PIN', 'Todos os usuários entram com PIN individual de 4 dígitos.'],
                ['Professor no tablet', 'Fluxo rápido para abrir turma, marcar presença e encerrar.'],
                ['Recepção ao vivo', 'Turmas, leads e financeiro em uma visão única.'],
              ].map(([title, text]) => (
                <div
                  key={title}
                  style={{
                    borderRadius: 24,
                    padding: 20,
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>{title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14 }}>{text}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...cardStyle(), padding: 32 }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: COLORS.green, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>
                ACESSO
              </div>
              <h2 style={{ fontSize: 36, margin: '10px 0 8px', color: COLORS.blue }}>
                Entrar no Gestor Conexão
              </h2>
              <p style={{ margin: 0, color: COLORS.muted }}>
                Selecione o usuário e entre com o PIN para acessar a área correspondente.
              </p>
            </div>

            <div style={{ display: 'grid', gap: 12, maxHeight: 320, overflow: 'auto', marginBottom: 20 }}>
              {users.map((user) => {
                const active = user.id === selectedUserId;
                return (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    style={{
                      textAlign: 'left',
                      padding: 16,
                      borderRadius: 24,
                      border: `1px solid ${active ? COLORS.blue : COLORS.border}`,
                      background: active ? COLORS.blue : '#fff',
                      color: active ? '#fff' : COLORS.text,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{user.name}</div>
                    <div style={{ fontSize: 13, opacity: 0.85 }}>
                      {user.role === 'teacher'
                        ? 'Professor'
                        : user.role === 'reception'
                          ? 'Recepção'
                          : 'Administração'}
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{ marginBottom: 12, fontWeight: 700, fontSize: 14 }}>PIN de acesso</div>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Digite o PIN de 4 dígitos"
              style={{
                width: '100%',
                height: 48,
                borderRadius: 16,
                border: `1px solid ${COLORS.border}`,
                padding: '0 14px',
                marginBottom: 10,
                fontSize: 16,
              }}
            />
            {pinError ? <div style={{ color: '#DC2626', fontSize: 14, marginBottom: 10 }}>{pinError}</div> : null}

            <button
              onClick={handleLogin}
              style={{
                width: '100%',
                height: 48,
                borderRadius: 16,
                border: 'none',
                background: COLORS.blue,
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              Entrar com PIN
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (screen === 'teacher') {
    return (
      <main style={{ minHeight: '100vh', background: COLORS.bg, padding: 24, fontFamily: 'Arial, sans-serif' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gap: 24 }}>
          {renderHeader(
            'Turmas de hoje',
            'Fluxo do professor para abrir a turma, marcar presença e encerrar antes da próxima.',
            'Gestor Conexão · Professor'
          )}

          {teacherHasOpenClass ? (
            <div
              style={{
                ...cardStyle(),
                padding: 16,
                borderColor: '#FCD34D',
                background: '#FFFBEB',
                color: '#92400E',
                fontWeight: 600,
              }}
            >
              É obrigatório encerrar a turma aberta antes de iniciar a próxima.
            </div>
          ) : null}

          {teacherClasses.map((item) => {
            const filteredStudents = item.students.filter((student) =>
              student.name.toLowerCase().includes(classSearch.toLowerCase())
            );
            const disableOpen = teacherHasOpenClass && item.status !== 'open';

            return (
              <div key={item.id} style={cardStyle()}>
                <div
                  style={{
                    padding: 24,
                    borderBottom: `1px solid ${COLORS.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 16,
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                      <span
                        style={{
                          borderRadius: 999,
                          background: COLORS.blueSoft,
                          color: COLORS.blue,
                          padding: '6px 12px',
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {item.sport}
                      </span>
                      <span
                        style={{
                          borderRadius: 999,
                          background: COLORS.greenSoft,
                          color: COLORS.green,
                          padding: '6px 12px',
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {item.day}
                      </span>
                      <span
                        style={{
                          borderRadius: 999,
                          border: `1px solid ${COLORS.border}`,
                          padding: '6px 12px',
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {item.status === 'open'
                          ? 'Turma aberta'
                          : item.status === 'closed'
                            ? 'Encerrada'
                            : 'Próxima turma'}
                      </span>
                    </div>

                    <h2 style={{ margin: 0, color: COLORS.blue, fontSize: 28 }}>
                      {item.teacherName} · {item.time}
                    </h2>
                    <p style={{ margin: '10px 0 0', color: COLORS.muted }}>
                      Categoria: {item.category} · {item.court || 'Quadra a definir'} · {item.students.length}/{item.limit}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => openClass(item.id)}
                      disabled={disableOpen || item.status === 'open'}
                      style={{
                        border: 'none',
                        background: disableOpen || item.status === 'open' ? '#CBD5E1' : COLORS.blue,
                        color: '#fff',
                        borderRadius: 14,
                        padding: '10px 16px',
                        cursor: disableOpen || item.status === 'open' ? 'not-allowed' : 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      Abrir turma
                    </button>
                    <button
                      onClick={() => closeClass(item.id)}
                      disabled={item.status !== 'open'}
                      style={{
                        border: `1px solid ${item.status === 'open' ? COLORS.green : COLORS.border}`,
                        background: '#fff',
                        color: item.status === 'open' ? COLORS.green : '#94A3B8',
                        borderRadius: 14,
                        padding: '10px 16px',
                        cursor: item.status === 'open' ? 'pointer' : 'not-allowed',
                        fontWeight: 700,
                      }}
                    >
                      Encerrar turma
                    </button>
                  </div>
                </div>

                <div style={{ padding: 24 }}>
                  <input
                    value={classSearch}
                    onChange={(e) => setClassSearch(e.target.value)}
                    placeholder="Buscar aluno pelo nome"
                    style={{
                      width: 360,
                      maxWidth: '100%',
                      height: 44,
                      borderRadius: 14,
                      border: `1px solid ${COLORS.border}`,
                      padding: '0 14px',
                      marginBottom: 20,
                    }}
                  />

                  {filteredStudents.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
                      {filteredStudents.map((student) => (
                        <div key={student.id} style={{ ...cardStyle(), padding: 16 }}>
                          <div style={{ fontWeight: 700 }}>{student.name}</div>
                          <div style={{ color: COLORS.muted, fontSize: 14, marginTop: 6 }}>
                            {student.tag || 'Fixo'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        border: `1px dashed ${COLORS.border}`,
                        borderRadius: 24,
                        padding: 32,
                        textAlign: 'center',
                        background: '#F8FAFC',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: COLORS.blue, marginBottom: 8 }}>
                        Aguardando importação ou cadastro dos alunos
                      </div>
                      <div style={{ color: COLORS.muted }}>
                        A estrutura da turma já está pronta. Os alunos podem ser incluídos depois.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: COLORS.bg, padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gap: 24 }}>
        {renderHeader(
          'Painel operacional',
          'Visão da recepção e administração com professores, turmas, leads e financeiro.',
          `Gestor Conexão · ${selectedUser.role === 'admin' ? 'Administração' : 'Recepção'}`
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 16 }}>
          {[
            ['Turmas abertas', metrics.openClasses, 'Real x esperado'],
            ['Leads', metrics.leads, 'Experimental / Avulsa'],
            ['Alunos em aberto', metrics.overdue, 'Financeiro'],
            ['Total professor', metrics.teacherTotal, 'Repasse'],
            ['Total arena', metrics.arenaTotal, 'Saldo'],
          ].map(([title, value, subtitle]) => (
            <div key={title} style={{ ...cardStyle(), padding: 20 }}>
              <div style={{ color: COLORS.muted, fontSize: 14 }}>{title}</div>
              <div style={{ color: COLORS.blue, fontWeight: 800, fontSize: 30, marginTop: 6 }}>{value}</div>
              <div style={{ color: COLORS.muted, fontSize: 12, marginTop: 6 }}>{subtitle}</div>
            </div>
          ))}
        </div>

        <div>
          <div style={{ marginBottom: 10, color: COLORS.muted, fontWeight: 700 }}>Professores</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
            {teacherFolders.map((teacher) => {
              const active = teacher.id === selectedTeacherFolderId;
              return (
                <button
                  key={teacher.id}
                  onClick={() => setSelectedTeacherFolderId(teacher.id)}
                  style={{
                    ...cardStyle(),
                    padding: 18,
                    textAlign: 'left',
                    cursor: 'pointer',
                    background: active ? COLORS.blueSoft : '#fff',
                    borderColor: active ? COLORS.blue : COLORS.border,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{teacher.name}</div>
                  <div style={{ color: COLORS.muted }}>⋮</div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={cardStyle()}>
          <div style={{ padding: 24, borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['students', 'classes', 'leads', 'financial'].map((tab) => (
                <div
                  key={tab}
                  style={{
                    borderRadius: 999,
                    padding: '8px 14px',
                    background:
                      tab === 'students'
                        ? COLORS.blueSoft
                        : '#fff',
                    color: tab === 'students' ? COLORS.blue : COLORS.muted,
                    border: `1px solid ${COLORS.border}`,
                    fontWeight: 700,
                  }}
                >
                  {tab === 'students'
                    ? 'Lista de alunos'
                    : tab === 'classes'
                      ? 'Turmas'
                      : tab === 'leads'
                        ? 'Experimental / Avulsa'
                        : 'Financeiro'}
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 24, display: 'grid', gap: 28 }}>
            <div>
              {sectionTitle(`Pasta do professor · ${selectedTeacher.name}`)}

              <div style={{ marginTop: 16, ...cardStyle(), padding: 20 }}>
                <div style={{ fontWeight: 700, color: COLORS.blue, marginBottom: 10 }}>Lista de alunos</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${COLORS.border}`, textAlign: 'left' }}>
                        <th style={{ padding: '12px 8px' }}>Aluno</th>
                        <th style={{ padding: '12px 8px' }}>Modalidade</th>
                        <th style={{ padding: '12px 8px' }}>Turma</th>
                        <th style={{ padding: '12px 8px' }}>Horário</th>
                        <th style={{ padding: '12px 8px' }}>Quadra</th>
                        <th style={{ padding: '12px 8px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={6} style={{ padding: 32, textAlign: 'center' }}>
                          <div style={{ fontWeight: 700, color: COLORS.blue, marginBottom: 8 }}>
                            Aguardando importação ou cadastro dos alunos
                          </div>
                          <div style={{ color: COLORS.muted }}>
                            A pasta do professor já está pronta. Os alunos podem ser incluídos depois.
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ marginTop: 20, display: 'grid', gap: 20 }}>
                {groupedFolderClasses.map((group) => (
                  <div key={group.day}>
                    {sectionTitle(group.day)}
                    <div style={{ overflowX: 'auto', marginTop: 12 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', ...cardStyle() }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${COLORS.border}`, textAlign: 'left' }}>
                            <th style={{ padding: '12px 8px' }}>Horário</th>
                            <th style={{ padding: '12px 8px' }}>Modalidade</th>
                            <th style={{ padding: '12px 8px' }}>Categoria</th>
                            <th style={{ padding: '12px 8px' }}>Quadra</th>
                            <th style={{ padding: '12px 8px' }}>Marcadores</th>
                            <th style={{ padding: '12px 8px' }}>Alunos</th>
                            <th style={{ padding: '12px 8px' }}>Limite</th>
                            <th style={{ padding: '12px 8px' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.classes.map((item) => (
                            <tr key={item.id} style={{ borderBottom: `1px solid #F1F5F9` }}>
                              <td style={{ padding: '12px 8px', fontWeight: 700 }}>{item.time}</td>
                              <td style={{ padding: '12px 8px' }}>{item.sport}</td>
                              <td style={{ padding: '12px 8px' }}>
                                <select
                                  value={item.category}
                                  onChange={(e) => updateClassField(item.id, 'category', e.target.value)}
                                  style={{
                                    height: 38,
                                    borderRadius: 10,
                                    border: `1px solid ${COLORS.border}`,
                                    padding: '0 10px',
                                    minWidth: 220,
                                  }}
                                >
                                  {(item.sport === 'Beach Tennis' ? categoryOptions.beach : categoryOptions.fute).map(
                                    (option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    )
                                  )}
                                </select>
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <input
                                  value={item.court}
                                  onChange={(e) => updateClassField(item.id, 'court', e.target.value)}
                                  placeholder="A definir"
                                  style={{
                                    height: 38,
                                    borderRadius: 10,
                                    border: `1px solid ${COLORS.border}`,
                                    padding: '0 10px',
                                    minWidth: 120,
                                  }}
                                />
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                  {['Fixo', 'Reposição', 'Avulsa', 'Experimental'].map((tag) => (
                                    <span
                                      key={tag}
                                      style={{
                                        border: `1px solid ${COLORS.border}`,
                                        borderRadius: 999,
                                        padding: '4px 8px',
                                        fontSize: 12,
                                      }}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td style={{ padding: '12px 8px' }}>{item.students.length}</td>
                              <td style={{ padding: '12px 8px' }}>{item.limit}</td>
                              <td style={{ padding: '12px 8px' }}>
                                <span
                                  style={{
                                    borderRadius: 999,
                                    border: `1px solid ${COLORS.border}`,
                                    padding: '6px 10px',
                                    fontSize: 12,
                                    fontWeight: 700,
                                  }}
                                >
                                  {item.status === 'open'
                                    ? 'Turma aberta'
                                    : item.status === 'closed'
                                      ? 'Encerrada'
                                      : 'Próxima turma'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {sectionTitle('Experimental / Avulsa')}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, marginTop: 16 }}>
                {leads.map((lead) => (
                  <div key={lead.id} style={{ ...cardStyle(), padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ fontWeight: 700 }}>{lead.name}</div>
                      <span
                        style={{
                          borderRadius: 999,
                          background: lead.type === 'Experimental' ? COLORS.greenSoft : COLORS.blueSoft,
                          color: lead.type === 'Experimental' ? COLORS.green : COLORS.blue,
                          padding: '6px 12px',
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        {lead.type}
                      </span>
                    </div>
                    <div style={{ marginTop: 10, color: COLORS.muted, fontSize: 14 }}>{lead.phone}</div>
                    <div style={{ marginTop: 10, color: COLORS.blue, fontWeight: 700 }}>
                      {lead.modality} · {lead.category}
                    </div>
                    <div style={{ marginTop: 8, color: COLORS.muted, fontSize: 14 }}>Professor: {lead.teacher}</div>
                    <div style={{ marginTop: 6, color: COLORS.muted, fontSize: 14 }}>
                      Agendado: {lead.scheduledDate} · {lead.scheduledTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {sectionTitle('Financeiro')}

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                {Object.keys(financialByMonth).map((month) => (
                  <button
                    key={month}
                    onClick={() => setSelectedMonth(month)}
                    style={{
                      borderRadius: 14,
                      padding: '10px 14px',
                      border: `1px solid ${selectedMonth === month ? COLORS.blue : COLORS.border}`,
                      background: selectedMonth === month ? COLORS.blue : '#fff',
                      color: selectedMonth === month ? '#fff' : COLORS.text,
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    {month}
                  </button>
                ))}
                <button
                  onClick={createMonth}
                  style={{
                    borderRadius: 14,
                    padding: '10px 14px',
                    border: `1px solid ${COLORS.green}`,
                    background: '#fff',
                    color: COLORS.green,
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Novo mês
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginTop: 16 }}>
                {[
                  ['Alunos em aberto', metrics.overdue],
                  ['Total professor', metrics.teacherTotal],
                  ['Total arena', metrics.arenaTotal],
                ].map(([title, value]) => (
                  <div key={title} style={{ ...cardStyle(), padding: 20 }}>
                    <div style={{ color: COLORS.muted, fontSize: 14 }}>{title}</div>
                    <div style={{ color: COLORS.blue, fontWeight: 800, fontSize: 28, marginTop: 6 }}>{value}</div>
                  </div>
                ))}
              </div>

              <div style={{ ...cardStyle(), marginTop: 16, padding: 20 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    alignItems: 'center',
                    marginBottom: 16,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ fontWeight: 700, color: COLORS.blue, fontSize: 20 }}>
                    Recebimento do mês · {selectedMonth}
                  </div>
                  <button
                    onClick={addFinancialRow}
                    style={{
                      borderRadius: 14,
                      padding: '10px 14px',
                      border: 'none',
                      background: COLORS.blue,
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    Adicionar linha
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${COLORS.border}`, textAlign: 'left' }}>
                        <th style={{ padding: '12px 8px' }}>Aluno</th>
                        <th style={{ padding: '12px 8px' }}>Não recebido</th>
                        <th style={{ padding: '12px 8px' }}>Recebido</th>
                        <th style={{ padding: '12px 8px' }}>Forma de pagamento</th>
                        <th style={{ padding: '12px 8px' }}>Professor</th>
                        <th style={{ padding: '12px 8px' }}>Arena</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthRows.map((row) => {
                        const received = parseMoney(row.received);
                        const rate = teacherRates[row.teacher] || 0;
                        const teacherValue = received * rate;
                        const arenaValue = received * (1 - rate);

                        return (
                          <tr key={row.id} style={{ borderBottom: `1px solid #F1F5F9` }}>
                            <td style={{ padding: '12px 8px', minWidth: 220 }}>
                              <input
                                value={row.student}
                                onChange={(e) => updateFinancialField(row.id, 'student', e.target.value)}
                                style={{
                                  width: '100%',
                                  height: 38,
                                  borderRadius: 10,
                                  border: `1px solid ${COLORS.border}`,
                                  padding: '0 10px',
                                }}
                              />
                            </td>
                            <td style={{ padding: '12px 8px', minWidth: 140 }}>
                              <input
                                value={row.notReceived}
                                onChange={(e) => updateFinancialField(row.id, 'notReceived', e.target.value)}
                                style={{
                                  width: '100%',
                                  height: 38,
                                  borderRadius: 10,
                                  border: `1px solid ${COLORS.border}`,
                                  padding: '0 10px',
                                }}
                              />
                            </td>
                            <td style={{ padding: '12px 8px', minWidth: 140 }}>
                              <input
                                value={row.received}
                                onChange={(e) => updateFinancialField(row.id, 'received', e.target.value)}
                                style={{
                                  width: '100%',
                                  height: 38,
                                  borderRadius: 10,
                                  border: `1px solid ${COLORS.border}`,
                                  padding: '0 10px',
                                }}
                              />
                            </td>
                            <td style={{ padding: '12px 8px', minWidth: 180 }}>
                              <input
                                value={row.paymentMethod}
                                onChange={(e) => updateFinancialField(row.id, 'paymentMethod', e.target.value)}
                                style={{
                                  width: '100%',
                                  height: 38,
                                  borderRadius: 10,
                                  border: `1px solid ${COLORS.border}`,
                                  padding: '0 10px',
                                }}
                              />
                            </td>
                            <td style={{ padding: '12px 8px', fontWeight: 700, color: COLORS.blue }}>
                              {formatCurrency(teacherValue)}
                            </td>
                            <td style={{ padding: '12px 8px', fontWeight: 700, color: COLORS.blue }}>
                              {formatCurrency(arenaValue)}
                            </td>
                          </tr>
                        );
                      })}

                      <tr>
                        <td colSpan={4} style={{ padding: '14px 8px', textAlign: 'right', fontWeight: 800, color: COLORS.blue }}>
                          TOTAL AULAS
                        </td>
                        <td style={{ padding: '14px 8px', fontWeight: 800, color: COLORS.green }}>
                          {formatCurrency(financialSummary.teacher)}
                        </td>
                        <td style={{ padding: '14px 8px', fontWeight: 800, color: COLORS.green }}>
                          {formatCurrency(financialSummary.arena)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, marginTop: 16 }}>
                  <div />
                  <div
                    style={{
                      background: '#DCECCB',
                      borderRadius: 24,
                      padding: 20,
                    }}
                  >
                    <div style={{ textAlign: 'center', fontWeight: 800, marginBottom: 12 }}>PAGAMENTOS</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <span>13/03</span>
                      <span>{formatCurrency(financialSummary.teacher)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
