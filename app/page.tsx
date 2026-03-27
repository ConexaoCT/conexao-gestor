'use client';

import { useMemo, useState } from 'react';

type UserRole = 'teacher' | 'reception' | 'admin';
type ClassStatus = 'open' | 'upcoming' | 'closed';
type Sport = 'Beach Tennis' | 'Futevôlei';
type LoginTab = 'teachers' | 'reception' | 'admin';
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
  'Hugo Leonardo': 0.45,
  'Felipe Zago': 0.45,
  Rudiery: 0.35,
  'João José': 0.3,
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
  const [loginTab, setLoginTab] = useState<LoginTab>('teachers');
  const [selectedTeacherIdForLogin, setSelectedTeacherIdForLogin] = useState('t1');
  const [selectedRoleUserId, setSelectedRoleUserId] = useState('r1');
  const [selectedTeacherFolderId, setSelectedTeacherFolderId] = useState('t1');
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

  const currentLoginUser =
    loginTab === 'teachers'
      ? users.find((u) => u.id === selectedTeacherIdForLogin) || users[0]
      : users.find((u) => u.id === selectedRoleUserId) || users[0];

  const currentUser = currentLoginUser;
  const selectedTeacher = users.find((u) => u.id === selectedTeacherFolderId) || teacherFolders[0];
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
    return Array.from(unique.values());
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
      });
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
    return Array.from(map.values());
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
              {currentUser.initials}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: COLORS.blue }}>{currentUser.name}</div>
              <div style={{ fontSize: 12, color: COLORS.muted }}>
                {currentUser.role === 'teacher'
                  ? 'Professor'
                  : currentUser.role === 'reception'
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
    const teacherUsers = users.filter((u) => u.role === 'teacher');
    const receptionUsers = users.filter((u) => u.role === 'reception');
    const adminUsers = users.filter((u) => u.role === 'admin');

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
                Professores, recepção e administração com acessos separados por PIN.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                ['Professores', 'Turmas de hoje, presença com 1 clique e visão da própria carteira.'],
                ['Recepção', 'Turmas, cadastros, alunos e controle de experimentais.'],
                ['Admin', 'Visão completa com financeiro e gestão geral.'],
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
                Escolha a área, selecione o usuário e entre com o PIN.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
              <button onClick={() => setLoginTab('teachers')} style={tabButton(loginTab === 'teachers')}>
                PROFESSORES
              </button>
              <button
                onClick={() => {
                  setLoginTab('reception');
                  setSelectedRoleUserId('r1');
                }}
                style={tabButton(loginTab === 'reception')}
              >
                RECEPÇÃO
              </button>
              <button
                onClick={() => {
                  setLoginTab('admin');
                  setSelectedRoleUserId('a1');
                }}
                style={tabButton(loginTab === 'admin')}
              >
                ADMIN
              </button>
            </div>

            <div style={{ display: 'grid', gap: 12, maxHeight: 320, overflow: 'auto', marginBottom: 20 }}>
              {loginTab === 'teachers'
                ? teacherUsers.map((user) => {
                    const active = user.id === selectedTeacherIdForLogin;
                    return (
                      <button
                        key={user.id}
                        onClick={() => setSelectedTeacherIdForLogin(user.id)}
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
                        <div style={{ fontSize: 13, opacity: 0.85 }}>Professor</div>
                      </button>
                    );
                  })
                : loginTab === 'reception'
                  ? receptionUsers.map((user) => {
                      const active = user.id === selectedRoleUserId;
                      return (
                        <button
                          key={user.id}
                          onClick={() => setSelectedRoleUserId(user.id)}
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
                          <div style={{ fontSize: 13, opacity: 0.85 }}>Recepção</div>
                        </button>
                      );
                    })
                  : adminUsers.map((user) => {
                      const active = user.id === selectedRoleUserId;
                      return (
                        <button
                          key={user.id}
                          onClick={() => setSelectedRoleUserId(user.id)}
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
                          <div style={{ fontSize: 13, opacity: 0.85 }}>Administração</div>
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
            {pinError ? <div style={{ color: COLORS.red, fontSize: 14, marginBottom: 10 }}>{pinError}</div> : null}

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
            'Acesso do professor',
            'Turmas do dia, presença rápida e visão da própria carteira.',
            'Gestor Conexão · Professor'
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => setTeacherTab('today')} style={tabButton(teacherTab === 'today')}>
              Turmas de hoje
            </button>
            <button onClick={() => setTeacherTab('space')} style={tabButton(teacherTab === 'space')}>
              Minha área
            </button>
          </div>

          {teacherTab === 'today' ? (
            <>
              {teacherHasOpenClass ? (
                <div
                  style={{
                    ...cardStyle(),
                    padding: 16,
                    borderColor: '#FCD34D',
                    background: COLORS.amberSoft,
                    color: COLORS.amber,
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
                              background: COLORS.greenSoft,
                              color: COLORS.green,
                              padding: '6px 12px',
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          >
                            {item.day}
                          </span>
                        </div>

                        <h2 style={{ margin: 0, color: COLORS.blue, fontSize: 28 }}>
                          {item.time}
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
                            <button
                              key={student.id}
                              onClick={() => togglePresence(item.id, student.id)}
                              disabled={item.status !== 'open'}
                              style={{
                                ...cardStyle(),
                                padding: 16,
                                textAlign: 'left',
                                cursor: item.status === 'open' ? 'pointer' : 'not-allowed',
                                opacity: item.status === 'open' ? 1 : 0.75,
                                background: student.present ? COLORS.greenSoft : '#fff',
                                borderColor: student.present ? COLORS.green : COLORS.border,
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                                <div>
                                  <div style={{ fontWeight: 700 }}>{student.name}</div>
                                  <div style={{ color: COLORS.muted, fontSize: 14, marginTop: 6 }}>
                                    {student.present ? 'Presente' : 'Não marcado'}
                                  </div>
                                </div>
                                <div style={studentTagStyle(student.tag)}>{student.tag || 'Fixo'}</div>
                              </div>

                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                                {student.status === 'inadimplente' ? (
                                  <span
                                    style={{
                                      borderRadius: 999,
                                      background: COLORS.redSoft,
                                      color: COLORS.red,
                                      padding: '4px 8px',
                                      fontSize: 12,
                                      fontWeight: 700,
                                    }}
                                  >
                                    Inadimplente
                                  </span>
                                ) : null}
                                {student.tag === 'Experimental' ? (
                                  <span
                                    style={{
                                      borderRadius: 999,
                                      background: COLORS.greenSoft,
                                      color: COLORS.green,
                                      padding: '4px 8px',
                                      fontSize: 12,
                                      fontWeight: 700,
                                    }}
                                  >
                                    Experimental
                                  </span>
                                ) : null}
                                {student.tag === 'Avulsa' ? (
                                  <span
                                    style={{
                                      borderRadius: 999,
                                      background: COLORS.blueSoft,
                                      color: COLORS.blue,
                                      padding: '4px 8px',
                                      fontSize: 12,
                                      fontWeight: 700,
                                    }}
                                  >
                                    Aula avulsa
                                  </span>
                                ) : null}
                              </div>
                            </button>
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
            </>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
                <div style={{ ...cardStyle(), padding: 20 }}>
                  <div style={{ color: COLORS.muted, fontSize: 14 }}>Turmas dele</div>
                  <div style={{ color: COLORS.blue, fontWeight: 800, fontSize: 30, marginTop: 6 }}>
                    {teacherClasses.length}
                  </div>
                </div>
                <div style={{ ...cardStyle(), padding: 20 }}>
                  <div style={{ color: COLORS.muted, fontSize: 14 }}>Alunos dele</div>
                  <div style={{ color: COLORS.blue, fontWeight: 800, fontSize: 30, marginTop: 6 }}>
                    {teacherStudents.length}
                  </div>
                </div>
                <div style={{ ...cardStyle(), padding: 20 }}>
                  <div style={{ color: COLORS.muted, fontSize: 14 }}>Valor do mês</div>
                  <div style={{ color: COLORS.blue, fontWeight: 800, fontSize: 30, marginTop: 6 }}>
                    {formatCurrency(teacherMonthlyValue)}
                  </div>
                </div>
              </div>

              <div style={cardStyle()}>
                <div style={{ padding: 20, borderBottom: `1px solid ${COLORS.border}`, fontWeight: 700, color: COLORS.blue }}>
                  Minhas turmas
                </div>
                <div style={{ overflowX: 'auto', padding: 20 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${COLORS.border}`, textAlign: 'left' }}>
                        <th style={{ padding: '12px 8px' }}>Dia</th>
                        <th style={{ padding: '12px 8px' }}>Horário</th>
                        <th style={{ padding: '12px 8px' }}>Categoria</th>
                        <th style={{ padding: '12px 8px' }}>Quadra</th>
                        <th style={{ padding: '12px 8px' }}>Alunos da turma</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacherClasses.map((item) => (
                        <tr key={item.id} style={{ borderBottom: `1px solid #F1F5F9` }}>
                          <td style={{ padding: '12px 8px' }}>{item.day}</td>
                          <td style={{ padding: '12px 8px', fontWeight: 700 }}>{item.time}</td>
                          <td style={{ padding: '12px 8px' }}>{item.category}</td>
                          <td style={{ padding: '12px 8px' }}>{item.court || 'A definir'}</td>
                          <td style={{ padding: '12px 8px' }}>
                            {item.students.length > 0 ? item.students.map((s) => s.name).join(', ') : 'Sem alunos'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={cardStyle()}>
                <div style={{ padding: 20, borderBottom: `1px solid ${COLORS.border}`, fontWeight: 700, color: COLORS.blue }}>
                  Minha lista de alunos · espelho do financeiro
                </div>
                <div style={{ overflowX: 'auto', padding: 20 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${COLORS.border}`, textAlign: 'left' }}>
                        <th style={{ padding: '12px 8px' }}>Aluno</th>
                        <th style={{ padding: '12px 8px' }}>Não recebido</th>
                        <th style={{ padding: '12px 8px' }}>Recebido</th>
                        <th style={{ padding: '12px 8px' }}>Forma de pagamento</th>
                        <th style={{ padding: '12px 8px' }}>Meu valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacherFinancialMirror.length > 0 ? (
                        teacherFinancialMirror.map((row) => (
                          <tr key={row.id} style={{ borderBottom: `1px solid #F1F5F9` }}>
                            <td style={{ padding: '12px 8px', fontWeight: 700 }}>{row.student}</td>
                            <td style={{ padding: '12px 8px' }}>{row.notReceived || '-'}</td>
                            <td style={{ padding: '12px 8px' }}>{row.received || '-'}</td>
                            <td style={{ padding: '12px 8px' }}>{row.paymentMethod || '-'}</td>
                            <td style={{ padding: '12px 8px', color: COLORS.blue, fontWeight: 700 }}>
                              {formatCurrency(row.teacherValue)}
                            </td>
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
      <main style={{ minHeight: '100vh', background: COLORS.bg, padding: 24, fontFamily: 'Arial, sans-serif' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gap: 24 }}>
          {renderHeader(
            'Painel da recepção',
            'Turmas, alunos e cadastros, sem acesso ao financeiro.',
            'Gestor Conexão · Recepção'
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
            <div style={{ ...cardStyle(), padding: 20 }}>
              <div style={{ color: COLORS.muted, fontSize: 14 }}>Turmas abertas</div>
              <div style={{ color: COLORS.blue, fontWeight: 800, fontSize: 30, marginTop: 6 }}>{metrics.openClasses}</div>
            </div>
            <div style={{ ...cardStyle(), padding: 20 }}>
              <div style={{ color: COLORS.muted, fontSize: 14 }}>Experimentais cadastrados</div>
              <div style={{ color: COLORS.blue, fontWeight: 800, fontSize: 30, marginTop: 6 }}>{metrics.experimentals}</div>
            </div>
            <div style={{ ...cardStyle(), padding: 20 }}>
              <div style={{ color: COLORS.muted, fontSize: 14 }}>Professores</div>
              <div style={{ color: COLORS.blue, fontWeight: 800, fontSize: 30, marginTop: 6 }}>{teacherFolders.length}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => setReceptionTab('classes')} style={tabButton(receptionTab === 'classes')}>
              Turmas e alunos
            </button>
            <button onClick={() => setReceptionTab('registrations')} style={tabButton(receptionTab === 'registrations')}>
              Cadastros
            </button>
          </div>

          {receptionTab === 'classes' ? (
            <>
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

              <div>
                {sectionTitle(`Turmas · ${selectedTeacher.name}`)}
                {groupedFolderClasses.map((group) => (
                  <div key={group.day} style={{ marginTop: 16 }}>
                    {sectionTitle(group.day)}
                    <div style={{ overflowX: 'auto', marginTop: 12 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', ...cardStyle() }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${COLORS.border}`, textAlign: 'left' }}>
                            <th style={{ padding: '12px 8px' }}>Horário</th>
                            <th style={{ padding: '12px 8px' }}>Categoria</th>
                            <th style={{ padding: '12px 8px' }}>Quadra</th>
                            <th style={{ padding: '12px 8px' }}>Alunos</th>
                            <th style={{ padding: '12px 8px' }}>Limite</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.classes.map((item) => (
                            <tr key={item.id} style={{ borderBottom: `1px solid #F1F5F9` }}>
                              <td style={{ padding: '12px 8px', fontWeight: 700 }}>{item.time}</td>
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
                              <td style={{ padding: '12px 8px' }}>{item.students.map((s) => s.name).join(', ') || 'Sem alunos'}</td>
                              <td style={{ padding: '12px 8px' }}>{item.limit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: 20 }}>
                  {sectionTitle(`Lista de alunos · ${selectedTeacher.name}`)}
                  <div style={{ overflowX: 'auto', marginTop: 12 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', ...cardStyle() }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${COLORS.border}`, textAlign: 'left' }}>
                          <th style={{ padding: '12px 8px' }}>Aluno</th>
                          <th style={{ padding: '12px 8px' }}>Turma</th>
                          <th style={{ padding: '12px 8px' }}>Horário</th>
                          <th style={{ padding: '12px 8px' }}>Quadra</th>
                          <th style={{ padding: '12px 8px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sharedStudentsForSelectedTeacher.length > 0 ? (
                          sharedStudentsForSelectedTeacher.map((student) => (
                            <tr key={student.id} style={{ borderBottom: `1px solid #F1F5F9` }}>
                              <td style={{ padding: '12px 8px', fontWeight: 700 }}>{student.name}</td>
                              <td style={{ padding: '12px 8px' }}>{student.turma}</td>
                              <td style={{ padding: '12px 8px' }}>{student.horario}</td>
                              <td style={{ padding: '12px 8px' }}>{student.quadra}</td>
                              <td style={{ padding: '12px 8px' }}>
                                {student.status === 'inadimplente' ? (
                                  <span
                                    style={{
                                      borderRadius: 999,
                                      background: COLORS.redSoft,
                                      color: COLORS.red,
                                      padding: '4px 8px',
                                      fontSize: 12,
                                      fontWeight: 700,
                                    }}
                                  >
                                    Inadimplente
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      borderRadius: 999,
                                      background: '#F8FAFC',
                                      color: COLORS.muted,
                                      padding: '4px 8px',
                                      fontSize: 12,
                                      fontWeight: 700,
                                      border: `1px solid ${COLORS.border}`,
                                    }}
                                  >
                                    Ativo
                                  </span>
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
            </>
          ) : (
            <>
              <div>
                {sectionTitle('Cadastros')}
              </div>

              <div style={{ ...cardStyle(), padding: 20 }}>
                <div style={{ fontWeight: 700, color: COLORS.blue, marginBottom: 16 }}>Cadastro de alunos</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
                  <input placeholder="Nome do aluno" style={inputStyle()} />
                  <input placeholder="Telefone" style={inputStyle()} />
                  <input placeholder="CPF" style={inputStyle()} />
                  <input placeholder="Data de nascimento" style={inputStyle()} />
                  <input placeholder="Responsável (se menor)" style={inputStyle()} />
                  <input placeholder="Telefone do responsável" style={inputStyle()} />
                </div>
              </div>

              <div style={{ ...cardStyle(), padding: 20 }}>
                <div style={{ fontWeight: 700, color: COLORS.blue, marginBottom: 16 }}>
                  Pasta · Aula experimental
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${COLORS.border}`, textAlign: 'left' }}>
                        <th style={{ padding: '12px 8px' }}>Nome</th>
                        <th style={{ padding: '12px 8px' }}>Telefone</th>
                        <th style={{ padding: '12px 8px' }}>Modalidade</th>
                        <th style={{ padding: '12px 8px' }}>Categoria</th>
                        <th style={{ padding: '12px 8px' }}>Professor</th>
                        <th style={{ padding: '12px 8px' }}>Agendamento</th>
                        <th style={{ padding: '12px 8px' }}>Observações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {experimentals.map((item) => (
                        <tr key={item.id} style={{ borderBottom: `1px solid #F1F5F9` }}>
                          <td style={{ padding: '12px 8px', fontWeight: 700 }}>{item.name}</td>
                          <td style={{ padding: '12px 8px' }}>{item.phone}</td>
                          <td style={{ padding: '12px 8px' }}>{item.modality}</td>
                          <td style={{ padding: '12px 8px' }}>{item.category}</td>
                          <td style={{ padding: '12px 8px' }}>{item.teacher}</td>
                          <td style={{ padding: '12px 8px' }}>{item.scheduledDate} · {item.scheduledTime}</td>
                          <td style={{ padding: '12px 8px' }}>{item.notes || '-'}</td>
                        </tr>
                      ))}
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

  return (
    <main style={{ minHeight: '100vh', background: COLORS.bg, padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gap: 24 }}>
        {renderHeader(
          'Painel da administração',
          'Gestão completa com turmas, cadastros e financeiro.',
          'Gestor Conexão · Administração'
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 16 }}>
          {[
            ['Turmas abertas', metrics.openClasses, 'Real x esperado'],
            ['Experimentais', metrics.experimentals, 'Cadastros'],
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

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => setAdminTab('classes')} style={tabButton(adminTab === 'classes')}>
            Turmas e alunos
          </button>
          <button onClick={() => setAdminTab('registrations')} style={tabButton(adminTab === 'registrations')}>
            Cadastros
          </button>
          <button onClick={() => setAdminTab('financial')} style={tabButton(adminTab === 'financial')}>
            Financeiro
          </button>
        </div>

        {adminTab === 'classes' ? (
          <>
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

            {groupedFolderClasses.map((group) => (
              <div key={group.day}>
                {sectionTitle(`${selectedTeacher.name} · ${group.day}`)}
                <div style={{ overflowX: 'auto', marginTop: 12 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', ...cardStyle() }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${COLORS.border}`, textAlign: 'left' }}>
                        <th style={{ padding: '12px 8px' }}>Horário</th>
                        <th style={{ padding: '12px 8px' }}>Categoria</th>
                        <th style={{ padding: '12px 8px' }}>Quadra</th>
                        <th style={{ padding: '12px 8px' }}>Alunos</th>
                        <th style={{ padding: '12px 8px' }}>Limite</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.classes.map((item) => (
                        <tr key={item.id} style={{ borderBottom: `1px solid #F1F5F9` }}>
                          <td style={{ padding: '12px 8px', fontWeight: 700 }}>{item.time}</td>
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
                          <td style={{ padding: '12px 8px' }}>{item.students.map((s) => s.name).join(', ') || 'Sem alunos'}</td>
                          <td style={{ padding: '12px 8px' }}>{item.limit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </>
        ) : null}

        {adminTab === 'registrations' ? (
          <>
            <div style={{ ...cardStyle(), padding: 20 }}>
              <div style={{ fontWeight: 700, color: COLORS.blue, marginBottom: 16 }}>Cadastro de alunos</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
                <input placeholder="Nome do aluno" style={inputStyle()} />
                <input placeholder="Telefone" style={inputStyle()} />
                <input placeholder="CPF" style={inputStyle()} />
                <input placeholder="Data de nascimento" style={inputStyle()} />
                <input placeholder="Responsável (se menor)" style={inputStyle()} />
                <input placeholder="Telefone do responsável" style={inputStyle()} />
              </div>
            </div>

            <div style={{ ...cardStyle(), padding: 20 }}>
              <div style={{ fontWeight: 700, color: COLORS.blue, marginBottom: 16 }}>Pasta · Aula experimental</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${COLORS.border}`, textAlign: 'left' }}>
                      <th style={{ padding: '12px 8px' }}>Nome</th>
                      <th style={{ padding: '12px 8px' }}>Telefone</th>
                      <th style={{ padding: '12px 8px' }}>Modalidade</th>
                      <th style={{ padding: '12px 8px' }}>Categoria</th>
                      <th style={{ padding: '12px 8px' }}>Professor</th>
                      <th style={{ padding: '12px 8px' }}>Agendamento</th>
                      <th style={{ padding: '12px 8px' }}>Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {experimentals.map((item) => (
                      <tr key={item.id} style={{ borderBottom: `1px solid #F1F5F9` }}>
                        <td style={{ padding: '12px 8px', fontWeight: 700 }}>{item.name}</td>
                        <td style={{ padding: '12px 8px' }}>{item.phone}</td>
                        <td style={{ padding: '12px 8px' }}>{item.modality}</td>
                        <td style={{ padding: '12px 8px' }}>{item.category}</td>
                        <td style={{ padding: '12px 8px' }}>{item.teacher}</td>
                        <td style={{ padding: '12px 8px' }}>{item.scheduledDate} · {item.scheduledTime}</td>
                        <td style={{ padding: '12px 8px' }}>{item.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}

        {adminTab === 'financial' ? (
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
                              style={inputStyle()}
                            />
                          </td>
                          <td style={{ padding: '12px 8px', minWidth: 140 }}>
                            <input
                              value={row.notReceived}
                              onChange={(e) => updateFinancialField(row.id, 'notReceived', e.target.value)}
                              style={inputStyle()}
                            />
                          </td>
                          <td style={{ padding: '12px 8px', minWidth: 140 }}>
                            <input
                              value={row.received}
                              onChange={(e) => updateFinancialField(row.id, 'received', e.target.value)}
                              style={inputStyle()}
                            />
                          </td>
                          <td style={{ padding: '12px 8px', minWidth: 180 }}>
                            <input
                              value={row.paymentMethod}
                              onChange={(e) => updateFinancialField(row.id, 'paymentMethod', e.target.value)}
                              style={inputStyle()}
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
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function inputStyle(): React.CSSProperties {
  return {
    width: '100%',
    height: 38,
    borderRadius: 10,
    border: `1px solid ${COLORS.border}`,
    padding: '0 10px',
  };
}
