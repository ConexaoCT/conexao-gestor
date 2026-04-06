'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type UserRole = 'teacher' | 'reception' | 'admin';
type ClassStatus = 'open' | 'upcoming' | 'closed';
type Sport = 'Beach Tennis' | 'Futevôlei';
type LoginTab = 'admin' | 'teachers' | 'reception';
type TeacherTab = 'today' | 'space';
type ReceptionTab = 'classes' | 'registrations' | 'experimentals';
type AdminTab = 'classes' | 'registrations' | 'financial' | 'experimentals';

type LoginUser = {
  id: string;
  name: string;
  initials: string;
  pin: string;
  role: UserRole;
  sport?: Sport;
};

type DbProfessor = {
  id: string;
  nome: string;
  percentual: number;
};

type DbAluno = {
  id: string;
  nome: string;
  status: string | null;
  telefone: string | null;
  cpf: string | null;
  data_nascimento: string | null;
  responsavel_nome: string | null;
  responsavel_telefone: string | null;
  tipo: string | null;
  email?: string | null;
  endereco?: string | null;
  cep?: string | null;
  data_inicio?: string | null;
  menor_idade?: boolean | null;
  responsavel_email?: string | null;
  responsavel_cpf?: string | null;
  responsavel_endereco?: string | null;
  responsavel_cep?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type DbTurma = {
  id: string;
  professor_id: string | null;
  dia: string | null;
  horario: string | null;
  limite: number | null;
  categoria: string | null;
  quadra: string | null;
};

type DbTurmaAluno = {
  id: string;
  turma_id: string | null;
  aluno_id: string | null;
};

type DbPresenca = {
  id: string;
  aluno_id: string | null;
  turma_id: string | null;
  data: string | null;
};

type DbFinanceiro = {
  id: string;
  aluno_id: string | null;
  professor_id: string | null;
  valor: number | null;
  recebido: boolean | null;
  forma_pagamento: string | null;
  mes: string | null;
};

type DbExperimental = {
  id: string;
  nome: string;
  telefone: string | null;
  modalidade: string | null;
  categoria: string | null;
  professor_id: string | null;
  data_agendada: string | null;
  horario_agendado: string | null;
  observacoes: string | null;
  dia_contato?: string | null;
  professor_preferencia?: string | null;
  dia_preferido?: string | null;
  periodo_preferido?: string | null;
  horario_pode_fazer?: string | null;
  dia_horario_aula_experimental?: string | null;
  fez_aula_experimental?: boolean | null;
  entrou_em_contato_apos_aula?: boolean | null;
  fechou_plano?: boolean | null;
  motivo_nao_fechou?: string | null;
  status_lead?: string | null;
  follow_up?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type StudentCard = {
  id: string;
  name: string;
  status: 'ativo' | 'inadimplente';
  tag: 'Fixo' | 'Reposição' | 'Avulsa' | 'Experimental' | 'Extra';
  present: boolean;
  phone?: string;
  cpf?: string;
};

type ClassCard = {
  id: string;
  teacherId: string;
  teacherName: string;
  sport: Sport;
  day: string;
  time: string;
  category: string;
  court: string;
  limit: number;
  students: StudentCard[];
};

type ExperimentalCard = {
  id: string;
  name: string;
  phone: string;
  modality: string;
  category: string;
  teacher: string;
  teacherId: string;
  scheduledDate: string;
  scheduledTime: string;
  notes: string;
  diaContato: string;
  professorPreferencia: string;
  diaPreferido: string;
  periodoPreferido: string;
  horarioPodeFazer: string;
  diaHorarioAulaExperimental: string;
  fezAulaExperimental: boolean;
  entrouEmContatoAposAula: boolean;
  fechouPlano: boolean;
  motivoNaoFechou: string;
  statusLead: string;
  followUp: string;
};

type FinancialRowView = {
  id: string;
  alunoId: string;
  professorId: string;
  student: string;
  teacher: string;
  value: number;
  received: boolean;
  paymentMethod: string;
  month: string;
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

const FIXED_ACCESS = {
  admin: { id: 'admin-fixed', name: 'Admin CT', pin: '9999', role: 'admin' as const },
  reception: { id: 'reception-fixed', name: 'Recepção CT', pin: '5555', role: 'reception' as const },
};

const FIXED_TEACHER_ACCESS = [
  { fallbackId: 'teacher-hugo', name: 'Hugo Leonardo', pin: '1111', sport: 'Beach Tennis' as const },
  { fallbackId: 'teacher-zago', name: 'Felipe Zago', pin: '2222', sport: 'Beach Tennis' as const },
  { fallbackId: 'teacher-rudi', name: 'Rudiery', pin: '3333', sport: 'Beach Tennis' as const },
  { fallbackId: 'teacher-joao', name: 'João José', pin: '4444', sport: 'Futevôlei' as const },
];

const initialExperimentalForm = {
  nome: '',
  telefone: '',
  modalidade: 'Beach Tennis',
  categoria: '',
  professor_id: '',
  dia_contato: '',
  professor_preferencia: '',
  dia_preferido: '',
  periodo_preferido: '',
  horario_pode_fazer: '',
  dia_horario_aula_experimental: '',
  fez_aula_experimental: 'nao',
  entrou_em_contato_apos_aula: 'nao',
  fechou_plano: 'nao',
  motivo_nao_fechou: '',
  status_lead: '',
  follow_up: '',
  data_agendada: '',
  horario_agendado: '',
  observacoes: '',
};

const initialStudentForm = {
  nome: '',
  telefone: '',
  email: '',
  cpf: '',
  data_nascimento: '',
  endereco: '',
  cep: '',
  data_inicio: '',
  menor_idade: false,
  responsavel_nome: '',
  responsavel_telefone: '',
  responsavel_email: '',
  responsavel_cpf: '',
  responsavel_endereco: '',
  responsavel_cep: '',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

function parseBRL(value: string) {
  if (!value) return 0;
  const normalized = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatInputMoney(value: number) {
  return value ? value.toFixed(2).replace('.', ',') : '';
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  return value;
}

function maskCPF(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function maskCEP(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function toStatus(value?: string | null): 'ativo' | 'inadimplente' {
  return value === 'inadimplente' ? 'inadimplente' : 'ativo';
}

function toTag(value?: string | null): 'Fixo' | 'Reposição' | 'Avulsa' | 'Experimental' | 'Extra' {
  const normalized = (value || '').toLowerCase();
  if (normalized === 'experimental') return 'Experimental';
  if (normalized === 'avulsa') return 'Avulsa';
  if (normalized === 'reposição' || normalized === 'reposicao') return 'Reposição';
  if (normalized === 'extra') return 'Extra';
  return 'Fixo';
}

function teacherSport(name: string): Sport {
  return name === 'João José' ? 'Futevôlei' : 'Beach Tennis';
}

function groupByDay(items: ClassCard[]) {
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

function initialsFromName(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

function studentTagStyle(tag?: StudentCard['tag']): React.CSSProperties {
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
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<'login' | 'teacher' | 'reception' | 'admin'>('login');
  const [loginTab, setLoginTab] = useState<LoginTab>('admin');
  const [teacherTab, setTeacherTab] = useState<TeacherTab>('today');
  const [receptionTab, setReceptionTab] = useState<ReceptionTab>('classes');
  const [adminTab, setAdminTab] = useState<AdminTab>('classes');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [selectedTeacherIdForLogin, setSelectedTeacherIdForLogin] = useState('');
  const [selectedRoleUserId, setSelectedRoleUserId] = useState(FIXED_ACCESS.admin.id);
  const [selectedTeacherFolderId, setSelectedTeacherFolderId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('MARÇO');
  const [classUiStatus, setClassUiStatus] = useState<Record<string, ClassStatus>>({});
  const [dbErrors, setDbErrors] = useState<string[]>([]);
  const [saveMessage, setSaveMessage] = useState('');
  const [savingExperimental, setSavingExperimental] = useState(false);
  const [savingStudent, setSavingStudent] = useState(false);
  const [studentSaveMessage, setStudentSaveMessage] = useState('');

  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingExperimentalId, setEditingExperimentalId] = useState<string | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [deletingExperimentalId, setDeletingExperimentalId] = useState<string | null>(null);

  const [experimentalForm, setExperimentalForm] = useState(initialExperimentalForm);
  const [studentForm, setStudentForm] = useState(initialStudentForm);

  const [dbProfessores, setDbProfessores] = useState<DbProfessor[]>([]);
  const [dbAlunos, setDbAlunos] = useState<DbAluno[]>([]);
  const [dbTurmas, setDbTurmas] = useState<DbTurma[]>([]);
  const [dbTurmaAlunos, setDbTurmaAlunos] = useState<DbTurmaAluno[]>([]);
  const [dbPresencasHoje, setDbPresencasHoje] = useState<DbPresenca[]>([]);
  const [dbFinanceiro, setDbFinanceiro] = useState<DbFinanceiro[]>([]);
  const [dbExperimentais, setDbExperimentais] = useState<DbExperimental[]>([]);

  async function loadAllData() {
    setLoading(true);
    setDbErrors([]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      profRes,
      alunosRes,
      turmasRes,
      turmaAlunosRes,
      presencasRes,
      financeiroRes,
      experimentaisRes,
    ] = await Promise.all([
      supabase.from('professores').select('*').order('nome'),
      supabase.from('alunos').select('*').order('nome'),
      supabase.from('turmas').select('*'),
      supabase.from('turma_alunos').select('*'),
      supabase
        .from('presencas')
        .select('*')
        .gte('data', todayStart.toISOString())
        .lte('data', todayEnd.toISOString()),
      supabase.from('financeiro').select('*'),
      supabase.from('experimentais').select('*').order('nome'),
    ]);

    const errors: string[] = [];
    if (profRes.error) errors.push(`professores: ${profRes.error.message}`);
    if (alunosRes.error) errors.push(`alunos: ${alunosRes.error.message}`);
    if (turmasRes.error) errors.push(`turmas: ${turmasRes.error.message}`);
    if (turmaAlunosRes.error) errors.push(`turma_alunos: ${turmaAlunosRes.error.message}`);
    if (presencasRes.error) errors.push(`presencas: ${presencasRes.error.message}`);
    if (financeiroRes.error) errors.push(`financeiro: ${financeiroRes.error.message}`);
    if (experimentaisRes.error) errors.push(`experimentais: ${experimentaisRes.error.message}`);

    setDbErrors(errors);
    setDbProfessores((profRes.data || []) as DbProfessor[]);
    setDbAlunos((alunosRes.data || []) as DbAluno[]);
    setDbTurmas((turmasRes.data || []) as DbTurma[]);
    setDbTurmaAlunos((turmaAlunosRes.data || []) as DbTurmaAluno[]);
    setDbPresencasHoje((presencasRes.data || []) as DbPresenca[]);
    setDbFinanceiro((financeiroRes.data || []) as DbFinanceiro[]);
    setDbExperimentais((experimentaisRes.data || []) as DbExperimental[]);

    setLoading(false);
  }

  useEffect(() => {
    loadAllData();
  }, []);

  const teacherUsers: LoginUser[] = useMemo(() => {
    return sortByName(
      FIXED_TEACHER_ACCESS.map((teacher) => {
        const professorFromDb = dbProfessores.find((prof) => prof.nome === teacher.name);

        return {
          id: professorFromDb?.id || teacher.fallbackId,
          name: teacher.name,
          initials: initialsFromName(teacher.name),
          pin: teacher.pin,
          role: 'teacher' as const,
          sport: teacher.sport,
        };
      })
    );
  }, [dbProfessores]);

  useEffect(() => {
    if (!selectedTeacherIdForLogin && teacherUsers.length > 0) {
      setSelectedTeacherIdForLogin(teacherUsers[0].id);
    }
    if (!selectedTeacherFolderId && teacherUsers.length > 0) {
      setSelectedTeacherFolderId(teacherUsers[0].id);
    }
    if (!experimentalForm.professor_id && teacherUsers.length > 0) {
      setExperimentalForm((current) => ({ ...current, professor_id: teacherUsers[0].id }));
    }
  }, [teacherUsers, selectedTeacherIdForLogin, selectedTeacherFolderId, experimentalForm.professor_id]);

  useEffect(() => {
    if (Object.keys(classUiStatus).length === 0 && dbTurmas.length > 0) {
      const next: Record<string, ClassStatus> = {};
      dbTurmas.forEach((turma) => {
        next[turma.id] = 'upcoming';
      });
      setClassUiStatus(next);
    }
  }, [dbTurmas, classUiStatus]);

  const sortedReceptionUsers: LoginUser[] = [
    {
      id: FIXED_ACCESS.reception.id,
      name: FIXED_ACCESS.reception.name,
      initials: initialsFromName(FIXED_ACCESS.reception.name),
      pin: FIXED_ACCESS.reception.pin,
      role: 'reception',
    },
  ];

  const sortedAdminUsers: LoginUser[] = [
    {
      id: FIXED_ACCESS.admin.id,
      name: FIXED_ACCESS.admin.name,
      initials: initialsFromName(FIXED_ACCESS.admin.name),
      pin: FIXED_ACCESS.admin.pin,
      role: 'admin',
    },
  ];

  const currentLoginUser: LoginUser =
    loginTab === 'teachers'
      ? teacherUsers.find((u) => u.id === selectedTeacherIdForLogin) || teacherUsers[0]
      : loginTab === 'reception'
        ? sortedReceptionUsers[0]
        : sortedAdminUsers[0];

  const attendanceSet = useMemo(() => {
    const set = new Set<string>();
    dbPresencasHoje.forEach((item) => {
      if (item.turma_id && item.aluno_id) {
        set.add(`${item.turma_id}_${item.aluno_id}`);
      }
    });
    return set;
  }, [dbPresencasHoje]);

  const assembledClasses: ClassCard[] = useMemo(() => {
    return dbTurmas
      .map((turma) => {
        const professor = dbProfessores.find((p) => p.id === turma.professor_id);
        if (!professor) return null;

        const studentIds = dbTurmaAlunos
          .filter((ta) => ta.turma_id === turma.id && ta.aluno_id)
          .map((ta) => ta.aluno_id as string);

        const students = studentIds
          .map((studentId) => {
            const aluno = dbAlunos.find((a) => a.id === studentId);
            if (!aluno) return null;

            return {
              id: aluno.id,
              name: aluno.nome,
              status: toStatus(aluno.status),
              tag: toTag(aluno.tipo),
              present: attendanceSet.has(`${turma.id}_${aluno.id}`),
              phone: aluno.telefone || '',
              cpf: aluno.cpf || '',
            } satisfies StudentCard;
          })
          .filter(Boolean) as StudentCard[];

        return {
          id: turma.id,
          teacherId: professor.id,
          teacherName: professor.nome,
          sport: teacherSport(professor.nome),
          day: turma.dia || 'Sem dia',
          time: turma.horario || 'Sem horário',
          category: turma.categoria || 'A definir',
          court: turma.quadra || 'A definir',
          limit: turma.limite || 0,
          students: students.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
        } satisfies ClassCard;
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a!.teacherName !== b!.teacherName) return a!.teacherName.localeCompare(b!.teacherName, 'pt-BR');
        if (a!.day !== b!.day) return a!.day.localeCompare(b!.day, 'pt-BR');
        return a!.time.localeCompare(b!.time);
      }) as ClassCard[];
  }, [dbTurmas, dbProfessores, dbTurmaAlunos, dbAlunos, attendanceSet]);

  const experimentalsView: ExperimentalCard[] = useMemo(() => {
    return dbExperimentais
      .map((item) => {
        const professor = dbProfessores.find((p) => p.id === item.professor_id);
        return {
          id: item.id,
          name: item.nome,
          phone: item.telefone || '',
          modality: item.modalidade || '',
          category: item.categoria || '',
          teacher: professor?.nome || item.professor_preferencia || 'Sem professor',
          teacherId: item.professor_id || '',
          scheduledDate: item.data_agendada || '',
          scheduledTime: item.horario_agendado || '',
          notes: item.observacoes || '',
          diaContato: item.dia_contato || '',
          professorPreferencia: item.professor_preferencia || '',
          diaPreferido: item.dia_preferido || '',
          periodoPreferido: item.periodo_preferido || '',
          horarioPodeFazer: item.horario_pode_fazer || '',
          diaHorarioAulaExperimental: item.dia_horario_aula_experimental || '',
          fezAulaExperimental: !!item.fez_aula_experimental,
          entrouEmContatoAposAula: !!item.entrou_em_contato_apos_aula,
          fechouPlano: !!item.fechou_plano,
          motivoNaoFechou: item.motivo_nao_fechou || '',
          statusLead: item.status_lead || '',
          followUp: item.follow_up || '',
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [dbExperimentais, dbProfessores]);

  const financialRows: FinancialRowView[] = useMemo(() => {
    return dbFinanceiro
      .map((row) => {
        const aluno = dbAlunos.find((a) => a.id === row.aluno_id);
        const professor = dbProfessores.find((p) => p.id === row.professor_id);

        return {
          id: row.id,
          alunoId: row.aluno_id || '',
          professorId: row.professor_id || '',
          student: aluno?.nome || 'Sem aluno',
          teacher: professor?.nome || 'Sem professor',
          value: row.valor || 0,
          received: !!row.recebido,
          paymentMethod: row.forma_pagamento || '',
          month: row.mes || 'SEM MÊS',
        };
      })
      .sort((a, b) => a.student.localeCompare(b.student, 'pt-BR'));
  }, [dbFinanceiro, dbAlunos, dbProfessores]);

  const availableMonths = useMemo(() => {
    const set = new Set(financialRows.map((row) => row.month));
    if (set.size === 0) set.add('MARÇO');
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [financialRows]);

  useEffect(() => {
    if (!availableMonths.includes(selectedMonth) && availableMonths.length > 0) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  const monthRows = useMemo(() => financialRows.filter((row) => row.month === selectedMonth), [financialRows, selectedMonth]);

  const currentUser = currentLoginUser;
  const selectedTeacher = teacherUsers.find((u) => u.id === selectedTeacherFolderId) || teacherUsers[0];
  const teacherClasses = assembledClasses.filter((item) => item.teacherId === currentUser?.id);
  const folderClasses = assembledClasses.filter((item) => item.teacherId === selectedTeacher?.id);
  const groupedFolderClasses = groupByDay(folderClasses);
  const teacherHasOpenClass = teacherClasses.some((item) => classUiStatus[item.id] === 'open');

  const teacherStudents = useMemo(() => {
    const unique = new Map<string, StudentCard & { turma: string; horario: string }>();
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
      .filter((row) => row.teacher === currentUser?.name)
      .map((row) => {
        const professor = dbProfessores.find((p) => p.id === row.professorId);
        const rate = professor?.percentual || 0;
        return {
          ...row,
          teacherValue: row.received ? row.value * rate : 0,
        };
      });
  }, [monthRows, currentUser, dbProfessores]);

  const teacherMonthlyValue = useMemo(
    () => teacherFinancialMirror.reduce((acc, row) => acc + row.teacherValue, 0),
    [teacherFinancialMirror]
  );

  const financialSummary = useMemo(() => {
    return monthRows.reduce(
      (acc, row) => {
        const professor = dbProfessores.find((p) => p.id === row.professorId);
        const rate = professor?.percentual || 0;
        if (row.received) {
          acc.teacher += row.value * rate;
          acc.arena += row.value * (1 - rate);
        }
        return acc;
      },
      { teacher: 0, arena: 0 }
    );
  }, [monthRows, dbProfessores]);

  const sharedStudentsForSelectedTeacher = useMemo(() => {
    const map = new Map<string, StudentCard & { turma: string; horario: string; quadra: string }>();
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
    const openClasses = Object.values(classUiStatus).filter((status) => status === 'open').length;
    const overdue = monthRows.filter((row) => !row.received).length;

    return {
      openClasses: `${openClasses}/${assembledClasses.length}`,
      experimentals: String(experimentalsView.length),
      overdue: String(overdue),
      teacherTotal: formatCurrency(financialSummary.teacher),
      arenaTotal: formatCurrency(financialSummary.arena),
      enrolledStudents: String(dbAlunos.length),
    };
  }, [classUiStatus, monthRows, assembledClasses.length, experimentalsView.length, financialSummary, dbAlunos.length]);

  async function handleLogin() {
    if (!currentLoginUser) {
      setPinError('Carregando usuários.');
      return;
    }

    if (pin === currentLoginUser.pin) {
      setPin('');
      setPinError('');
      setSaveMessage('');
      setStudentSaveMessage('');
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
    setSaveMessage('');
    setStudentSaveMessage('');
    setEditingStudentId(null);
    setEditingExperimentalId(null);
    setDeletingStudentId(null);
    setDeletingExperimentalId(null);
  }

  function openClass(classId: string) {
    const sameTeacherOpen = teacherClasses.some((item) => item.id !== classId && classUiStatus[item.id] === 'open');
    if (sameTeacherOpen) return;
    setClassUiStatus((current) => ({ ...current, [classId]: 'open' }));
  }

  function closeClass(classId: string) {
    setClassUiStatus((current) => ({ ...current, [classId]: 'closed' }));
  }

  async function togglePresence(classId: string, studentId: string) {
    const alreadyPresent = attendanceSet.has(`${classId}_${studentId}`);

    if (alreadyPresent) {
      const { data: existing } = await supabase
        .from('presencas')
        .select('id')
        .eq('turma_id', classId)
        .eq('aluno_id', studentId)
        .gte('data', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
        .lte('data', new Date(new Date().setHours(23, 59, 59, 999)).toISOString());

      if (existing && existing.length > 0) {
        await supabase.from('presencas').delete().in('id', existing.map((item: { id: string }) => item.id));
      }
    } else {
      await supabase.from('presencas').insert({
        turma_id: classId,
        aluno_id: studentId,
        data: new Date().toISOString(),
      });
    }

    await loadAllData();
  }

  async function updateClassField(classId: string, field: 'categoria' | 'quadra', value: string) {
    const update: Record<string, string> = {};
    update[field] = value;

    const { error } = await supabase.from('turmas').update(update).eq('id', classId);
    if (error) {
      console.error(error);
      return;
    }

    await loadAllData();
  }

  async function updateFinancialRow(
    rowId: string,
    changes: Partial<{
      aluno_id: string | null;
      professor_id: string | null;
      valor: number;
      recebido: boolean;
      forma_pagamento: string;
      mes: string;
    }>
  ) {
    const { error } = await supabase.from('financeiro').update(changes).eq('id', rowId);
    if (error) {
      console.error(error);
      return;
    }
    await loadAllData();
  }

  async function addFinancialRow() {
    const professorId = selectedTeacher?.id || dbProfessores[0]?.id || null;
    const { error } = await supabase.from('financeiro').insert({
      aluno_id: null,
      professor_id: professorId,
      valor: 0,
      recebido: false,
      forma_pagamento: '',
      mes: selectedMonth,
    });

    if (error) {
      console.error(error);
      return;
    }

    await loadAllData();
  }

  async function createMonth() {
    const name = window.prompt('Digite o nome do novo mês (ex: ABRIL)');
    if (!name) return;
    setSelectedMonth(name.toUpperCase());
  }

  function updateExperimentalField(field: keyof typeof initialExperimentalForm, value: string | boolean) {
    setExperimentalForm((current) => ({ ...current, [field]: value as never }));
  }

  function updateStudentField(field: keyof typeof initialStudentForm, value: string | boolean) {
    setStudentForm((current) => ({ ...current, [field]: value as never }));
  }

  async function handleSaveExperimental() {
    setSaveMessage('');

    if (!experimentalForm.nome.trim()) {
      setSaveMessage('Preencha o nome do aluno experimental.');
      return;
    }

    if (!experimentalForm.telefone.trim()) {
      setSaveMessage('Preencha o celular do aluno experimental.');
      return;
    }

    setSavingExperimental(true);

    const payload = {
      nome: experimentalForm.nome.trim(),
      telefone: experimentalForm.telefone.trim(),
      modalidade: experimentalForm.modalidade,
      categoria: experimentalForm.categoria.trim() || null,
      professor_id: experimentalForm.professor_id || null,
      dia_contato: experimentalForm.dia_contato || null,
      professor_preferencia: experimentalForm.professor_preferencia.trim() || null,
      dia_preferido: experimentalForm.dia_preferido.trim() || null,
      periodo_preferido: experimentalForm.periodo_preferido.trim() || null,
      horario_pode_fazer: experimentalForm.horario_pode_fazer.trim() || null,
      dia_horario_aula_experimental: experimentalForm.dia_horario_aula_experimental.trim() || null,
      fez_aula_experimental: experimentalForm.fez_aula_experimental === 'sim',
      entrou_em_contato_apos_aula: experimentalForm.entrou_em_contato_apos_aula === 'sim',
      fechou_plano: experimentalForm.fechou_plano === 'sim',
      motivo_nao_fechou: experimentalForm.motivo_nao_fechou.trim() || null,
      status_lead: experimentalForm.status_lead.trim() || null,
      follow_up: experimentalForm.follow_up.trim() || null,
      data_agendada: experimentalForm.data_agendada || null,
      horario_agendado: experimentalForm.horario_agendado || null,
      observacoes: experimentalForm.observacoes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const query =
      editingExperimentalId
        ? supabase.from('experimentais').update(payload).eq('id', editingExperimentalId)
        : supabase.from('experimentais').insert(payload);

    const { error } = await query;

    setSavingExperimental(false);

    if (error) {
      setSaveMessage(`Erro ao salvar experimental: ${error.message}`);
      return;
    }

    setSaveMessage(editingExperimentalId ? 'Lead experimental atualizado com sucesso.' : 'Lead experimental cadastrado com sucesso.');
    setEditingExperimentalId(null);
    setExperimentalForm({
      ...initialExperimentalForm,
      professor_id: experimentalForm.professor_id || teacherUsers[0]?.id || '',
    });
    await loadAllData();
  }

  async function handleSaveStudent() {
    setStudentSaveMessage('');

    if (!studentForm.nome.trim()) {
      setStudentSaveMessage('Preencha o nome completo do aluno.');
      return;
    }

    if (!studentForm.telefone.trim()) {
      setStudentSaveMessage('Preencha o celular do aluno.');
      return;
    }

    if (studentForm.menor_idade && !studentForm.responsavel_nome.trim()) {
      setStudentSaveMessage('Preencha o nome completo do responsável.');
      return;
    }

    setSavingStudent(true);

    const payload = {
      nome: studentForm.nome.trim(),
      telefone: studentForm.telefone.trim() || null,
      email: studentForm.email.trim() || null,
      cpf: studentForm.cpf.trim() || null,
      data_nascimento: studentForm.data_nascimento || null,
      endereco: studentForm.endereco.trim() || null,
      cep: studentForm.cep.trim() || null,
      data_inicio: studentForm.data_inicio || null,
      menor_idade: !!studentForm.menor_idade,
      responsavel_nome: studentForm.menor_idade ? studentForm.responsavel_nome.trim() || null : null,
      responsavel_telefone: studentForm.menor_idade ? studentForm.responsavel_telefone.trim() || null : null,
      responsavel_email: studentForm.menor_idade ? studentForm.responsavel_email.trim() || null : null,
      responsavel_cpf: studentForm.menor_idade ? studentForm.responsavel_cpf.trim() || null : null,
      responsavel_endereco: studentForm.menor_idade ? studentForm.responsavel_endereco.trim() || null : null,
      responsavel_cep: studentForm.menor_idade ? studentForm.responsavel_cep.trim() || null : null,
      status: 'ativo',
      tipo: 'fixo',
      updated_at: new Date().toISOString(),
    };

    const query =
      editingStudentId
        ? supabase.from('alunos').update(payload).eq('id', editingStudentId)
        : supabase.from('alunos').insert(payload);

    const { error } = await query;

    setSavingStudent(false);

    if (error) {
      setStudentSaveMessage(`Erro ao salvar aluno: ${error.message}`);
      return;
    }

    setStudentSaveMessage(editingStudentId ? 'Aluno atualizado com sucesso.' : 'Aluno matriculado cadastrado com sucesso.');
    setEditingStudentId(null);
    setStudentForm(initialStudentForm);
    await loadAllData();
  }

  function startEditStudent(aluno: DbAluno) {
    setEditingStudentId(aluno.id);
    setStudentSaveMessage('');
    setStudentForm({
      nome: aluno.nome || '',
      telefone: maskPhone(aluno.telefone || ''),
      email: aluno.email || '',
      cpf: maskCPF(aluno.cpf || ''),
      data_nascimento: aluno.data_nascimento || '',
      endereco: aluno.endereco || '',
      cep: maskCEP(aluno.cep || ''),
      data_inicio: aluno.data_inicio || '',
      menor_idade: !!aluno.menor_idade,
      responsavel_nome: aluno.responsavel_nome || '',
      responsavel_telefone: maskPhone(aluno.responsavel_telefone || ''),
      responsavel_email: aluno.responsavel_email || '',
      responsavel_cpf: maskCPF(aluno.responsavel_cpf || ''),
      responsavel_endereco: aluno.responsavel_endereco || '',
      responsavel_cep: maskCEP(aluno.responsavel_cep || ''),
    });
    setReceptionTab('registrations');
    setAdminTab('registrations');
  }

  function cancelEditStudent() {
    setEditingStudentId(null);
    setStudentForm(initialStudentForm);
    setStudentSaveMessage('');
  }

  async function deleteStudent(id: string) {
    const confirmar = window.confirm('Deseja excluir este aluno matriculado?');
    if (!confirmar) return;

    setDeletingStudentId(id);
    const { error } = await supabase.from('alunos').delete().eq('id', id);
    setDeletingStudentId(null);

    if (error) {
      setStudentSaveMessage(`Erro ao excluir aluno: ${error.message}`);
      return;
    }

    if (editingStudentId === id) {
      cancelEditStudent();
    }

    setStudentSaveMessage('Aluno excluído com sucesso.');
    await loadAllData();
  }

  function startEditExperimental(item: DbExperimental) {
    setEditingExperimentalId(item.id);
    setSaveMessage('');
    setExperimentalForm({
      nome: item.nome || '',
      telefone: maskPhone(item.telefone || ''),
      modalidade: item.modalidade || 'Beach Tennis',
      categoria: item.categoria || '',
      professor_id: item.professor_id || teacherUsers[0]?.id || '',
      dia_contato: item.dia_contato || '',
      professor_preferencia: item.professor_preferencia || '',
      dia_preferido: item.dia_preferido || '',
      periodo_preferido: item.periodo_preferido || '',
      horario_pode_fazer: item.horario_pode_fazer || '',
      dia_horario_aula_experimental: item.dia_horario_aula_experimental || '',
      fez_aula_experimental: item.fez_aula_experimental ? 'sim' : 'nao',
      entrou_em_contato_apos_aula: item.entrou_em_contato_apos_aula ? 'sim' : 'nao',
      fechou_plano: item.fechou_plano ? 'sim' : 'nao',
      motivo_nao_fechou: item.motivo_nao_fechou || '',
      status_lead: item.status_lead || '',
      follow_up: item.follow_up || '',
      data_agendada: item.data_agendada || '',
      horario_agendado: item.horario_agendado || '',
      observacoes: item.observacoes || '',
    });
    setReceptionTab('experimentals');
    setAdminTab('experimentals');
  }

  function cancelEditExperimental() {
    setEditingExperimentalId(null);
    setSaveMessage('');
    setExperimentalForm({
      ...initialExperimentalForm,
      professor_id: teacherUsers[0]?.id || '',
    });
  }

  async function deleteExperimental(id: string) {
    const confirmar = window.confirm('Deseja excluir este lead experimental?');
    if (!confirmar) return;

    setDeletingExperimentalId(id);
    const { error } = await supabase.from('experimentais').delete().eq('id', id);
    setDeletingExperimentalId(null);

    if (error) {
      setSaveMessage(`Erro ao excluir experimental: ${error.message}`);
      return;
    }

    if (editingExperimentalId === id) {
      cancelEditExperimental();
    }

    setSaveMessage('Lead experimental excluído com sucesso.');
    await loadAllData();
  }

function convertExperimentalToAluno(item: ExperimentalCard) {
  setStudentForm({
    nome: item.name || '',
    telefone: maskPhone(item.phone || ''),
    email: '',
    cpf: '',
    data_nascimento: '',
    endereco: '',
    cep: '',
    data_inicio: new Date().toISOString().slice(0, 10),
    menor_idade: false,
    responsavel_nome: '',
    responsavel_telefone: '',
    responsavel_email: '',
    responsavel_cpf: '',
    responsavel_endereco: '',
    responsavel_cep: '',
  });

  setReceptionTab('registrations');
  setAdminTab('registrations');

  setStudentSaveMessage(`Complete o cadastro para matricular ${item.name}`);
}

  function renderStudentRegistrationSection() {
    return (
      <div className="section-gap">
        <div>{sectionTitle(editingStudentId ? 'Editar aluno matriculado' : 'Cadastro de alunos matriculados')}</div>

        <div className="panel-card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, color: COLORS.blue, marginBottom: 16, fontSize: 20 }}>
            Dados do aluno
          </div>

          <div className="form-grid">
            <div className="form-block">
              <label className="form-label">Nome completo</label>
              <input
                className="field-input"
                value={studentForm.nome}
                onChange={(e) => updateStudentField('nome', e.target.value)}
                placeholder="Nome completo"
              />
            </div>

            <div className="form-block">
              <label className="form-label">Celular</label>
              <input
                className="field-input"
                value={studentForm.telefone}
                onChange={(e) => updateStudentField('telefone', maskPhone(e.target.value))}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="form-block">
              <label className="form-label">E-mail</label>
              <input
                className="field-input"
                value={studentForm.email}
                onChange={(e) => updateStudentField('email', e.target.value)}
                placeholder="E-mail"
              />
            </div>

            <div className="form-block">
              <label className="form-label">CPF</label>
              <input
                className="field-input"
                value={studentForm.cpf}
                onChange={(e) => updateStudentField('cpf', maskCPF(e.target.value))}
                placeholder="000.000.000-00"
              />
            </div>

            <div className="form-block">
              <label className="form-label">Data de nascimento</label>
              <input
                type="date"
                className="field-input"
                value={studentForm.data_nascimento}
                onChange={(e) => updateStudentField('data_nascimento', e.target.value)}
              />
            </div>

            <div className="form-block">
              <label className="form-label">Data de início</label>
              <input
                type="date"
                className="field-input"
                value={studentForm.data_inicio}
                onChange={(e) => updateStudentField('data_inicio', e.target.value)}
              />
            </div>

            <div className="form-block form-block-full">
              <label className="form-label">Endereço</label>
              <input
                className="field-input"
                value={studentForm.endereco}
                onChange={(e) => updateStudentField('endereco', e.target.value)}
                placeholder="Endereço"
              />
            </div>

            <div className="form-block">
              <label className="form-label">CEP</label>
              <input
                className="field-input"
                value={studentForm.cep}
                onChange={(e) => updateStudentField('cep', maskCEP(e.target.value))}
                placeholder="00000-000"
              />
            </div>

            <div className="form-block">
              <label className="form-label">Menor de idade?</label>
              <select
                className="field-select"
                value={studentForm.menor_idade ? 'sim' : 'nao'}
                onChange={(e) => updateStudentField('menor_idade', e.target.value === 'sim')}
              >
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
            </div>
          </div>

          {studentForm.menor_idade ? (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontWeight: 700, color: COLORS.blue, marginBottom: 16, fontSize: 20 }}>
                Dados do responsável
              </div>

              <div className="form-grid">
                <div className="form-block">
                  <label className="form-label">Nome completo</label>
                  <input
                    className="field-input"
                    value={studentForm.responsavel_nome}
                    onChange={(e) => updateStudentField('responsavel_nome', e.target.value)}
                    placeholder="Nome completo do responsável"
                  />
                </div>

                <div className="form-block">
                  <label className="form-label">Celular</label>
                  <input
                    className="field-input"
                    value={studentForm.responsavel_telefone}
                    onChange={(e) => updateStudentField('responsavel_telefone', maskPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="form-block">
                  <label className="form-label">E-mail</label>
                  <input
                    className="field-input"
                    value={studentForm.responsavel_email}
                    onChange={(e) => updateStudentField('responsavel_email', e.target.value)}
                    placeholder="E-mail do responsável"
                  />
                </div>

                <div className="form-block">
                  <label className="form-label">CPF</label>
                  <input
                    className="field-input"
                    value={studentForm.responsavel_cpf}
                    onChange={(e) => updateStudentField('responsavel_cpf', maskCPF(e.target.value))}
                    placeholder="000.000.000-00"
                  />
                </div>

                <div className="form-block form-block-full">
                  <label className="form-label">Endereço</label>
                  <input
                    className="field-input"
                    value={studentForm.responsavel_endereco}
                    onChange={(e) => updateStudentField('responsavel_endereco', e.target.value)}
                    placeholder="Endereço do responsável"
                  />
                </div>

                <div className="form-block">
                  <label className="form-label">CEP</label>
                  <input
                    className="field-input"
                    value={studentForm.responsavel_cep}
                    onChange={(e) => updateStudentField('responsavel_cep', maskCEP(e.target.value))}
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            <button className="primary-btn-inline" onClick={handleSaveStudent} disabled={savingStudent}>
              {savingStudent ? 'Salvando...' : editingStudentId ? 'Salvar alterações' : 'Salvar aluno matriculado'}
            </button>

            {editingStudentId ? (
              <button className="ghost-btn" onClick={cancelEditStudent}>
                Cancelar edição
              </button>
            ) : null}

            {studentSaveMessage ? (
              <span style={{ color: studentSaveMessage.includes('Erro') ? COLORS.red : COLORS.green, fontWeight: 700 }}>
                {studentSaveMessage}
              </span>
            ) : null}
          </div>
        </div>

        <div className="panel-card table-card">
          <div className="table-header">Alunos já matriculados</div>
          <div className="table-inner">
            <table>
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Celular</th>
                  <th>E-mail</th>
                  <th>CPF</th>
                  <th>Data de início</th>
                  <th>Menor?</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {dbAlunos.length > 0 ? (
                  dbAlunos.map((aluno) => (
                    <tr key={aluno.id}>
                      <td><strong>{aluno.nome}</strong></td>
                      <td>{aluno.telefone || '-'}</td>
                      <td>{aluno.email || '-'}</td>
                      <td>{aluno.cpf || '-'}</td>
                      <td>{aluno.data_inicio || '-'}</td>
                      <td>{aluno.menor_idade ? 'Sim' : 'Não'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button className="chip-btn active" onClick={() => startEditStudent(aluno)}>
                            Editar
                          </button>
                          <button
                            className="chip-btn"
                            onClick={() => deleteStudent(aluno.id)}
                            disabled={deletingStudentId === aluno.id}
                            style={{ color: COLORS.red, borderColor: COLORS.red }}
                          >
                            {deletingStudentId === aluno.id ? 'Excluindo...' : 'Excluir'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: 28, textAlign: 'center', color: COLORS.muted }}>
                      Nenhum aluno matriculado encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function renderExperimentalSection(showConvertButton: boolean) {
    return (
      <div className="section-gap">
        <div className="summary-grid">
          <div className="panel-card summary-card">
            <div className="summary-label">Experimentais cadastrados</div>
            <div className="summary-value">{metrics.experimentals}</div>
          </div>
          <div className="panel-card summary-card">
            <div className="summary-label">Alunos matriculados</div>
            <div className="summary-value">{metrics.enrolledStudents}</div>
          </div>
          <div className="panel-card summary-card">
            <div className="summary-label">Professores</div>
            <div className="summary-value">{teacherUsers.length}</div>
          </div>
        </div>

        <div>{sectionTitle(editingExperimentalId ? 'Editar lead experimental' : 'Cadastro de lead experimental')}</div>

        <div className="panel-card" style={{ padding: 20 }}>
          <div className="form-grid">
            <div className="form-block">
              <label className="form-label">Nome do aluno</label>
              <input
                className="field-input"
                value={experimentalForm.nome}
                onChange={(e) => updateExperimentalField('nome', e.target.value)}
                placeholder="Nome do aluno"
              />
            </div>

            <div className="form-block">
              <label className="form-label">Celular</label>
              <input
                className="field-input"
                value={experimentalForm.telefone}
                onChange={(e) => updateExperimentalField('telefone', maskPhone(e.target.value))}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="form-block">
              <label className="form-label">Dia do contato</label>
              <input
                type="date"
                className="field-input"
                value={experimentalForm.dia_contato}
                onChange={(e) => updateExperimentalField('dia_contato', e.target.value)}
              />
            </div>

            <div className="form-block">
              <label className="form-label">Categoria</label>
              <input
                className="field-input"
                value={experimentalForm.categoria}
                onChange={(e) => updateExperimentalField('categoria', e.target.value)}
                placeholder="Categoria"
              />
            </div>

            <div className="form-block">
              <label className="form-label">Professor de preferência</label>
              <input
                className="field-input"
                value={experimentalForm.professor_preferencia}
                onChange={(e) => updateExperimentalField('professor_preferencia', e.target.value)}
                placeholder="Professor de preferência"
              />
            </div>

            <div className="form-block">
              <label className="form-label">Professor vinculado</label>
              <select
                className="field-select"
                value={experimentalForm.professor_id}
                onChange={(e) => updateExperimentalField('professor_id', e.target.value)}
              >
                {teacherUsers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-block">
              <label className="form-label">Dia preferido</label>
              <input
                className="field-input"
                value={experimentalForm.dia_preferido}
                onChange={(e) => updateExperimentalField('dia_preferido', e.target.value)}
                placeholder="Dia preferido"
              />
            </div>

            <div className="form-block">
              <label className="form-label">Período preferido</label>
              <input
                className="field-input"
                value={experimentalForm.periodo_preferido}
                onChange={(e) => updateExperimentalField('periodo_preferido', e.target.value)}
                placeholder="Período preferido"
              />
            </div>

            <div className="form-block">
              <label className="form-label">Horário que pode fazer</label>
              <input
                className="field-input"
                value={experimentalForm.horario_pode_fazer}
                onChange={(e) => updateExperimentalField('horario_pode_fazer', e.target.value)}
                placeholder="Horário que pode fazer"
              />
            </div>

            <div className="form-block">
              <label className="form-label">Dia e horário da aula experimental</label>
              <input
                className="field-input"
                value={experimentalForm.dia_horario_aula_experimental}
                onChange={(e) => updateExperimentalField('dia_horario_aula_experimental', e.target.value)}
                placeholder="Dia e horário da aula experimental"
              />
            </div>

            <div className="form-block">
              <label className="form-label">Modalidade</label>
              <select
                className="field-select"
                value={experimentalForm.modalidade}
                onChange={(e) => updateExperimentalField('modalidade', e.target.value)}
              >
                <option value="Beach Tennis">Beach Tennis</option>
                <option value="Futevôlei">Futevôlei</option>
              </select>
            </div>

            <div className="form-block">
              <label className="form-label">Data agendada</label>
              <input
                type="date"
                className="field-input"
                value={experimentalForm.data_agendada}
                onChange={(e) => updateExperimentalField('data_agendada', e.target.value)}
              />
            </div>

            <div className="form-block">
              <label className="form-label">Horário agendado</label>
              <input
                type="time"
                className="field-input"
                value={experimentalForm.horario_agendado}
                onChange={(e) => updateExperimentalField('horario_agendado', e.target.value)}
              />
            </div>

            <div className="form-block">
              <label className="form-label">Fez aula experimental?</label>
              <select
                className="field-select"
                value={experimentalForm.fez_aula_experimental}
                onChange={(e) => updateExperimentalField('fez_aula_experimental', e.target.value)}
              >
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
            </div>

            <div className="form-block">
              <label className="form-label">Entrou em contato após aula?</label>
              <select
                className="field-select"
                value={experimentalForm.entrou_em_contato_apos_aula}
                onChange={(e) => updateExperimentalField('entrou_em_contato_apos_aula', e.target.value)}
              >
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
            </div>

            <div className="form-block">
              <label className="form-label">Fechou o plano?</label>
              <select
                className="field-select"
                value={experimentalForm.fechou_plano}
                onChange={(e) => updateExperimentalField('fechou_plano', e.target.value)}
              >
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
            </div>

            <div className="form-block">
              <label className="form-label">Status do lead</label>
              <input
                className="field-input"
                value={experimentalForm.status_lead}
                onChange={(e) => updateExperimentalField('status_lead', e.target.value)}
                placeholder="Status do lead"
              />
            </div>

            <div className="form-block form-block-full">
              <label className="form-label">Motivo se não fechou</label>
              <input
                className="field-input"
                value={experimentalForm.motivo_nao_fechou}
                onChange={(e) => updateExperimentalField('motivo_nao_fechou', e.target.value)}
                placeholder="Motivo se não fechou"
              />
            </div>

            <div className="form-block form-block-full">
              <label className="form-label">Follow-up</label>
              <textarea
                className="field-textarea"
                value={experimentalForm.follow_up}
                onChange={(e) => updateExperimentalField('follow_up', e.target.value)}
                placeholder="Follow-up"
              />
            </div>

            <div className="form-block form-block-full">
              <label className="form-label">Observações</label>
              <textarea
                className="field-textarea"
                value={experimentalForm.observacoes}
                onChange={(e) => updateExperimentalField('observacoes', e.target.value)}
                placeholder="Observações"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            <button className="primary-btn-inline" onClick={handleSaveExperimental} disabled={savingExperimental}>
              {savingExperimental ? 'Salvando...' : editingExperimentalId ? 'Salvar alterações' : 'Salvar experimental'}
            </button>

            {editingExperimentalId ? (
              <button className="ghost-btn" onClick={cancelEditExperimental}>
                Cancelar edição
              </button>
            ) : null}

            {saveMessage ? (
              <span style={{ color: saveMessage.includes('Erro') ? COLORS.red : COLORS.green, fontWeight: 700 }}>
                {saveMessage}
              </span>
            ) : null}
          </div>
        </div>

        <div className="panel-card table-card">
          <div className="table-header">Leads experimentais</div>
          <div className="table-inner">
            <table>
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Celular</th>
                  <th>Dia contato</th>
                  <th>Categoria</th>
                  <th>Professor preferência</th>
                  <th>Dia preferido</th>
                  <th>Período</th>
                  <th>Horário disponível</th>
                  <th>Aula experimental</th>
                  <th>Fez?</th>
                  <th>Pós-aula?</th>
                  <th>Fechou?</th>
                  <th>Status</th>
                  <th>Motivo</th>
                  <th>Follow-up</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {experimentalsView.length > 0 ? (
                  experimentalsView.map((item) => (
                    <tr key={item.id}>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.phone || '-'}</td>
                      <td>{item.diaContato || '-'}</td>
                      <td>{item.category || '-'}</td>
                      <td>{item.professorPreferencia || item.teacher || '-'}</td>
                      <td>{item.diaPreferido || '-'}</td>
                      <td>{item.periodoPreferido || '-'}</td>
                      <td>{item.horarioPodeFazer || '-'}</td>
                      <td>{item.diaHorarioAulaExperimental || '-'}</td>
                      <td>{item.fezAulaExperimental ? 'Sim' : 'Não'}</td>
                      <td>{item.entrouEmContatoAposAula ? 'Sim' : 'Não'}</td>
                      <td>{item.fechouPlano ? 'Sim' : 'Não'}</td>
                      <td>{item.statusLead || '-'}</td>
                      <td>{item.motivoNaoFechou || '-'}</td>
                      <td>{item.followUp || '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button className="chip-btn active" onClick={() => startEditExperimental(dbExperimentais.find((e) => e.id === item.id)!)}>
                            Editar
                          </button>
                          <button
                            className="chip-btn"
                            onClick={() => deleteExperimental(item.id)}
                            disabled={deletingExperimentalId === item.id}
                            style={{ color: COLORS.red, borderColor: COLORS.red }}
                          >
                            {deletingExperimentalId === item.id ? 'Excluindo...' : 'Excluir'}
                          </button>
                          {showConvertButton ? (
                            <button className="chip-btn active" onClick={() => convertExperimentalToAluno(item)}>
                              Matricular
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={16} style={{ padding: 28, textAlign: 'center', color: COLORS.muted }}>
                      Nenhum lead experimental cadastrado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel-card table-card">
          <div className="table-header">Lista de alunos matriculados</div>
          <div className="table-inner">
            <table>
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Celular</th>
                  <th>E-mail</th>
                  <th>CPF</th>
                  <th>Data de início</th>
                </tr>
              </thead>
              <tbody>
                {dbAlunos.length > 0 ? (
                  dbAlunos.map((aluno) => (
                    <tr key={aluno.id}>
                      <td><strong>{aluno.nome}</strong></td>
                      <td>{aluno.telefone || '-'}</td>
                      <td>{aluno.email || '-'}</td>
                      <td>{aluno.cpf || '-'}</td>
                      <td>{aluno.data_inicio || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: 28, textAlign: 'center', color: COLORS.muted }}>
                      Nenhum aluno matriculado cadastrado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  const globalStyles = (
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
      .teacher-folder-grid,
      .form-grid {
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
      .form-grid {
        grid-template-columns: 1fr;
      }
      .form-block {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .form-block-full {
        grid-column: 1 / -1;
      }
      .form-label {
        font-size: 14px;
        font-weight: 700;
        color: ${COLORS.muted};
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
      .field-select,
      .field-textarea {
        width: 100%;
        border-radius: 12px;
        border: 1px solid ${COLORS.border};
        padding: 0 12px;
        font-size: 15px;
        background: #fff;
      }
      .pin-input,
      .field-input,
      .field-select {
        height: 42px;
      }
      .field-textarea {
        min-height: 110px;
        padding: 12px;
        resize: vertical;
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
      .primary-btn-inline {
        height: 46px;
        border: none;
        border-radius: 14px;
        background: ${COLORS.blue};
        color: #fff;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        padding: 0 18px;
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
        white-space: nowrap;
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
      .debug-box {
        margin-top: 14px;
        padding: 12px;
        border-radius: 14px;
        background: #fff7ed;
        border: 1px solid #fed7aa;
        color: #9a3412;
        font-size: 13px;
        line-height: 1.45;
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
        .form-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (min-width: 1024px) {
        .teacher-folder-grid {
          grid-template-columns: repeat(4, 1fr);
        }
        .presence-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }
    `}</style>
  );

  if (loading) {
    return (
      <>
        {globalStyles}
        <main className="page-root">
          <div className="panel-wrap">
            <div className="panel-card" style={{ padding: 32, textAlign: 'center' }}>
              <div className="summary-value" style={{ fontSize: 28 }}>Carregando dados...</div>
              <div className="panel-subtitle" style={{ marginTop: 10 }}>
                Conectando o Gestor Conexão ao Supabase.
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (screen === 'login') {
    return (
      <>
        {globalStyles}
        <main className="page-root">
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
                  <button
                    className={`chip-btn ${loginTab === 'admin' ? 'active' : ''}`}
                    onClick={() => {
                      setLoginTab('admin');
                      setSelectedRoleUserId(FIXED_ACCESS.admin.id);
                    }}
                  >
                    ADMIN
                  </button>
                  <button
                    className={`chip-btn ${loginTab === 'teachers' ? 'active' : ''}`}
                    onClick={() => setLoginTab('teachers')}
                  >
                    PROFESSORES
                  </button>
                  <button
                    className={`chip-btn ${loginTab === 'reception' ? 'active' : ''}`}
                    onClick={() => {
                      setLoginTab('reception');
                      setSelectedRoleUserId(FIXED_ACCESS.reception.id);
                    }}
                  >
                    RECEPÇÃO
                  </button>
                </div>

                {loginTab === 'teachers' ? (
                  <div style={{ marginBottom: 12, color: '#64748B', fontSize: 14 }}>
                    Professores carregados: {teacherUsers.length}
                  </div>
                ) : null}

                <div className="profile-grid">
                  {loginTab === 'teachers'
                    ? teacherUsers.map((user) => {
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

                {dbErrors.length > 0 ? (
                  <div className="debug-box">
                    <strong>Diagnóstico do banco:</strong>
                    <div style={{ marginTop: 6 }}>{dbErrors.join(' | ')}</div>
                  </div>
                ) : null}

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
      </>
    );
  }

  if (screen === 'teacher') {
    return (
      <>
        {globalStyles}
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
                {teacherHasOpenClass ? (
                  <div className="alert-box">É obrigatório encerrar a turma aberta antes de iniciar a próxima.</div>
                ) : null}

                {teacherClasses.map((item) => {
                  const filteredStudents = item.students.filter((student) =>
                    student.name.toLowerCase().includes(classSearch.toLowerCase())
                  );
                  const disableOpen = teacherHasOpenClass && classUiStatus[item.id] !== 'open';

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
                            disabled={disableOpen || classUiStatus[item.id] === 'open'}
                            style={{
                              background: disableOpen || classUiStatus[item.id] === 'open' ? '#CBD5E1' : COLORS.blue,
                              color: '#fff',
                              borderColor: disableOpen || classUiStatus[item.id] === 'open' ? '#CBD5E1' : COLORS.blue,
                            }}
                          >
                            Abrir turma
                          </button>
                          <button
                            className="chip-btn"
                            onClick={() => closeClass(item.id)}
                            disabled={classUiStatus[item.id] !== 'open'}
                            style={{
                              color: classUiStatus[item.id] === 'open' ? COLORS.green : '#94A3B8',
                              borderColor: classUiStatus[item.id] === 'open' ? COLORS.green : COLORS.border,
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
                                disabled={classUiStatus[item.id] !== 'open'}
                                className={`presence-card ${student.present ? 'present' : ''} ${classUiStatus[item.id] !== 'open' ? 'disabled' : ''}`}
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
                              <td>{row.received ? '-' : formatCurrency(row.value)}</td>
                              <td>{row.received ? formatCurrency(row.value) : '-'}</td>
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
      </>
    );
  }

  if (screen === 'reception') {
    return (
      <>
        {globalStyles}
        <main className="page-root">
          <div className="panel-wrap">
            {renderHeader(
              'Painel da recepção',
              'Turmas, alunos, cadastros e controle separado de experimentais.',
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
                <div className="summary-value">{teacherUsers.length}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className={`chip-btn ${receptionTab === 'classes' ? 'active' : ''}`} onClick={() => setReceptionTab('classes')}>
                Turmas e alunos
              </button>
              <button className={`chip-btn ${receptionTab === 'registrations' ? 'active' : ''}`} onClick={() => setReceptionTab('registrations')}>
                Cadastros
              </button>
              <button className={`chip-btn ${receptionTab === 'experimentals' ? 'active' : ''}`} onClick={() => setReceptionTab('experimentals')}>
                Experimentais
              </button>
            </div>

            {receptionTab === 'classes' ? (
              <>
                <div>
                  <div style={{ marginBottom: 10, color: COLORS.muted, fontWeight: 700 }}>Professores</div>
                  <div className="teacher-folder-grid">
                    {teacherUsers.map((teacher) => {
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
                  <div>{sectionTitle(`Turmas · ${selectedTeacher?.name || ''}`)}</div>

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
                                      onChange={(e) => updateClassField(item.id, 'categoria', e.target.value)}
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
                                      onChange={(e) => updateClassField(item.id, 'quadra', e.target.value)}
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
                    {sectionTitle(`Lista de alunos · ${selectedTeacher?.name || ''}`)}
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
            ) : null}

            {receptionTab === 'registrations' ? renderStudentRegistrationSection() : null}
            {receptionTab === 'experimentals' ? renderExperimentalSection(false) : null}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      {globalStyles}
      <main className="page-root">
        <div className="panel-wrap">
          {renderHeader(
            'Painel da administração',
            'Gestão completa com turmas, cadastros, financeiro e experimentais.',
            'Gestor Conexão · Administração'
          )}

          <div className="summary-grid">
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
            <button className={`chip-btn ${adminTab === 'experimentals' ? 'active' : ''}`} onClick={() => setAdminTab('experimentals')}>
              Experimentais
            </button>
          </div>

          {adminTab === 'classes' ? (
            <>
              <div>
                <div style={{ marginBottom: 10, color: COLORS.muted, fontWeight: 700 }}>Professores</div>
                <div className="teacher-folder-grid">
                  {teacherUsers.map((teacher) => {
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
                  {sectionTitle(`${selectedTeacher?.name || ''} · ${group.day}`)}
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
                                  onChange={(e) => updateClassField(item.id, 'categoria', e.target.value)}
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
                                  onChange={(e) => updateClassField(item.id, 'quadra', e.target.value)}
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

          {adminTab === 'registrations' ? renderStudentRegistrationSection() : null}

          {adminTab === 'financial' ? (
            <div className="section-gap">
              <div>{sectionTitle('Financeiro')}</div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {availableMonths.map((month) => (
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
                        const professor = dbProfessores.find((p) => p.id === row.professorId);
                        const rate = professor?.percentual || 0;
                        const teacherValue = row.received ? row.value * rate : 0;
                        const arenaValue = row.received ? row.value * (1 - rate) : 0;

                        return (
                          <tr key={row.id}>
                            <td style={{ minWidth: 220 }}>
                              <select
                                className="field-select"
                                value={row.alunoId || ''}
                                onChange={(e) =>
                                  updateFinancialRow(row.id, {
                                    aluno_id: e.target.value || null,
                                  })
                                }
                              >
                                <option value="">Selecione</option>
                                {dbAlunos.map((aluno) => (
                                  <option key={aluno.id} value={aluno.id}>
                                    {aluno.nome}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td style={{ minWidth: 140 }}>
                              <input
                                className="field-input"
                                value={row.received ? '' : formatInputMoney(row.value)}
                                onChange={(e) =>
                                  updateFinancialRow(row.id, {
                                    valor: parseBRL(e.target.value),
                                    recebido: false,
                                  })
                                }
                              />
                            </td>
                            <td style={{ minWidth: 140 }}>
                              <input
                                className="field-input"
                                value={row.received ? formatInputMoney(row.value) : ''}
                                onChange={(e) =>
                                  updateFinancialRow(row.id, {
                                    valor: parseBRL(e.target.value),
                                    recebido: true,
                                  })
                                }
                              />
                            </td>
                            <td style={{ minWidth: 180 }}>
                              <input
                                className="field-input"
                                value={row.paymentMethod}
                                onChange={(e) =>
                                  updateFinancialRow(row.id, {
                                    forma_pagamento: e.target.value,
                                  })
                                }
                              />
                            </td>
                            <td style={{ minWidth: 220 }}>
                              <select
                                className="field-select"
                                value={row.professorId || ''}
                                onChange={(e) =>
                                  updateFinancialRow(row.id, {
                                    professor_id: e.target.value || null,
                                  })
                                }
                              >
                                <option value="">Selecione</option>
                                {dbProfessores.map((professor) => (
                                  <option key={professor.id} value={professor.id}>
                                    {professor.nome}
                                  </option>
                                ))}
                              </select>
                              <div style={{ marginTop: 8, color: COLORS.blue, fontWeight: 700 }}>
                                {formatCurrency(teacherValue)}
                              </div>
                            </td>
                            <td style={{ color: COLORS.blue, fontWeight: 700 }}>
                              {formatCurrency(arenaValue)}
                            </td>
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

          {adminTab === 'experimentals' ? renderExperimentalSection(true) : null}
        </div>
      </main>
    </>
  );
}
