'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type UserRole = 'teacher' | 'reception' | 'admin';
type LoginTab = 'admin' | 'teachers' | 'reception';
type TeacherTab = 'today' | 'wallet';
type ReceptionTab = 'classes' | 'students' | 'experimentals';
type AdminTab = 'classes' | 'students' | 'financial' | 'experimentals';
type ClassStatus = 'upcoming' | 'open' | 'closed';

type LoginUser = {
  id: string;
  name: string;
  initials: string;
  pin: string;
  role: UserRole;
  sport?: string;
};

type DbProfessor = {
  id: string;
  nome: string;
  percentual: number | null;
};

type DbAluno = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  cpf: string | null;
  data_nascimento: string | null;
  endereco: string | null;
  cep: string | null;
  data_inicio: string | null;
  menor_idade: boolean | null;
  responsavel_nome: string | null;
  responsavel_telefone: string | null;
  responsavel_email: string | null;
  responsavel_cpf: string | null;
  responsavel_endereco: string | null;
  responsavel_cep: string | null;
  status: string | null;
  tipo: string | null;
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
  turma_id: string | null;
  aluno_id: string | null;
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
  email: string | null;
  modalidade: string | null;
  categoria: string | null;
  professor_id: string | null;
  data_agendada: string | null;
  horario_agendado: string | null;
  observacoes: string | null;
  dia_contato: string | null;
  professor_preferencia: string | null;
  dia_preferido: string | null;
  periodo_preferido: string | null;
  horario_pode_fazer: string | null;
  dia_horario_aula_experimental: string | null;
  fez_aula_experimental: boolean | null;
  entrou_em_contato_apos_aula: boolean | null;
  fechou_plano: boolean | null;
  motivo_nao_fechou: string | null;
  status_lead: string | null;
  follow_up: string | null;
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
};

const FIXED_ACCESS = {
  admin: { id: 'admin-fixed', name: 'Admin CT', pin: '9999', role: 'admin' as const },
  reception: { id: 'reception-fixed', name: 'Recepção CT', pin: '5555', role: 'reception' as const },
};

const FIXED_TEACHERS = [
  { fallbackId: 'teacher-zago', name: 'Felipe Zago', pin: '2222', sport: 'Beach Tennis' },
  { fallbackId: 'teacher-hugo', name: 'Hugo Leonardo', pin: '1111', sport: 'Beach Tennis' },
  { fallbackId: 'teacher-joao', name: 'João José', pin: '4444', sport: 'Futevôlei' },
  { fallbackId: 'teacher-rudi', name: 'Rudiery', pin: '3333', sport: 'Beach Tennis' },
];

type StudentFormState = {
  nome: string;
  telefone: string;
  email: string;
  cpf: string;
  data_nascimento: string;
  endereco: string;
  cep: string;
  data_inicio: string;
  menor_idade: boolean;
  responsavel_nome: string;
  responsavel_telefone: string;
};

type ExperimentalFormState = {
  nome: string;
  telefone: string;
  email: string;
  modalidade: string;
  categoria: string;
  professor_id: string;
  dia_contato: string;
  professor_preferencia: string;
  dia_preferido: string;
  periodo_preferido: string;
  horario_pode_fazer: string;
  dia_horario_aula_experimental: string;
  fechou_plano: 'sim' | 'nao';
};

const initialStudentForm: StudentFormState = {
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
};

const initialExperimentalForm: ExperimentalFormState = {
  nome: '',
  telefone: '',
  email: '',
  modalidade: 'Beach Tennis',
  categoria: '',
  professor_id: '',
  dia_contato: '',
  professor_preferencia: '',
  dia_preferido: '',
  periodo_preferido: '',
  horario_pode_fazer: '',
  dia_horario_aula_experimental: '',
  fechou_plano: 'nao',
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
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

function initialsFromName(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function Home() {
  const [screen, setScreen] = useState<'login' | 'teacher' | 'reception' | 'admin'>('login');
  const [loginTab, setLoginTab] = useState<LoginTab>('admin');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const [studentForm, setStudentForm] = useState(initialStudentForm);
  const [experimentalForm, setExperimentalForm] = useState(initialExperimentalForm);

  const [dbAlunos, setDbAlunos] = useState<DbAluno[]>([]);
  const [dbExperimentais, setDbExperimentais] = useState<DbExperimental[]>([]);
  const [dbProfessores, setDbProfessores] = useState<DbProfessor[]>([]);

  async function loadAllData() {
    const [alunos, experimentais, professores] = await Promise.all([
      supabase.from('alunos').select('*'),
      supabase.from('experimentais').select('*'),
      supabase.from('professores').select('*'),
    ]);

    if (alunos.data) setDbAlunos(alunos.data);
    if (experimentais.data) setDbExperimentais(experimentais.data);
    if (professores.data) setDbProfessores(professores.data);
  }

  useEffect(() => {
    loadAllData();
  }, []);

  const teacherUsers: LoginUser[] = useMemo(() => {
    return FIXED_TEACHERS.map((teacher) => {
      const professorFromDb = dbProfessores.find((prof) => prof.nome === teacher.name);

      return {
        id: professorFromDb?.id || teacher.fallbackId,
        name: teacher.name,
        initials: initialsFromName(teacher.name),
        pin: teacher.pin,
        role: 'teacher',
        sport: teacher.sport,
      };
    }).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [dbProfessores]);

  const currentLoginUser: LoginUser | undefined =
    loginTab === 'teachers'
      ? teacherUsers[0]
      : loginTab === 'reception'
        ? {
            id: FIXED_ACCESS.reception.id,
            name: FIXED_ACCESS.reception.name,
            initials: initialsFromName(FIXED_ACCESS.reception.name),
            pin: FIXED_ACCESS.reception.pin,
            role: 'reception',
          }
        : {
            id: FIXED_ACCESS.admin.id,
            name: FIXED_ACCESS.admin.name,
            initials: initialsFromName(FIXED_ACCESS.admin.name),
            pin: FIXED_ACCESS.admin.pin,
            role: 'admin',
          };

  function handleLogin() {
    if (!currentLoginUser) {
      setPinError('Usuário não encontrado.');
      return;
    }

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
  }

  function convertExperimentalToAluno(item: DbExperimental) {
    setStudentForm({
      nome: item.nome || '',
      telefone: maskPhone(item.telefone || ''),
      email: item.email || '',
      cpf: '',
      data_nascimento: '',
      endereco: '',
      cep: '',
      data_inicio: new Date().toISOString().slice(0, 10),
      menor_idade: false,
      responsavel_nome: '',
      responsavel_telefone: '',
    });

    setScreen('admin');
    setLoginTab('admin');
  }

  async function saveStudent() {
    const payload = {
      nome: studentForm.nome,
      telefone: studentForm.telefone || null,
      email: studentForm.email || null,
      cpf: studentForm.cpf || null,
      data_nascimento: studentForm.data_nascimento || null,
      endereco: studentForm.endereco || null,
      cep: studentForm.cep || null,
      data_inicio: studentForm.data_inicio || null,
      menor_idade: studentForm.menor_idade,
      responsavel_nome: studentForm.menor_idade ? studentForm.responsavel_nome || null : null,
      responsavel_telefone: studentForm.menor_idade ? studentForm.responsavel_telefone || null : null,
      status: 'ativo',
      tipo: 'fixo',
    };

    await supabase.from('alunos').insert(payload);
    setStudentForm(initialStudentForm);
    await loadAllData();
  }

  async function saveExperimental() {
    const payload = {
      nome: experimentalForm.nome,
      telefone: experimentalForm.telefone || null,
      email: experimentalForm.email || null,
      modalidade: experimentalForm.modalidade || null,
      categoria: experimentalForm.categoria || null,
      professor_id: experimentalForm.professor_id || null,
      dia_contato: experimentalForm.dia_contato || null,
      professor_preferencia: experimentalForm.professor_preferencia || null,
      dia_preferido: experimentalForm.dia_preferido || null,
      periodo_preferido: experimentalForm.periodo_preferido || null,
      horario_pode_fazer: experimentalForm.horario_pode_fazer || null,
      dia_horario_aula_experimental: experimentalForm.dia_horario_aula_experimental || null,
      fechou_plano: experimentalForm.fechou_plano === 'sim',
    };

    await supabase.from('experimentais').insert(payload);
    setExperimentalForm(initialExperimentalForm);
    await loadAllData();
  }

  if (screen === 'login') {
    return (
      <main style={{ minHeight: '100vh', background: COLORS.bg, padding: 24 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: 24, gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ background: '#fff', borderRadius: 24, border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
            <div style={{ background: COLORS.blue, color: '#fff', padding: '20px 28px', fontSize: 28, fontWeight: 800 }}>
              GESTOR CONEXÃO
            </div>
            <div style={{ padding: 28 }}>
              <h1 style={{ margin: 0, color: COLORS.blue, fontSize: 40 }}>Operação diária do CT em um só lugar</h1>
              <p style={{ color: COLORS.muted, fontSize: 18, lineHeight: 1.5 }}>
                Professores, recepção e administração com acessos separados por PIN.
              </p>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 24, border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
            <div style={{ background: COLORS.blue, color: '#fff', padding: '20px 28px', fontSize: 24, fontWeight: 800 }}>
              ENTRAR
            </div>
            <div style={{ padding: 28 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                <button onClick={() => setLoginTab('admin')}>ADMIN</button>
                <button onClick={() => setLoginTab('teachers')}>PROFESSORES</button>
                <button onClick={() => setLoginTab('reception')}>RECEPÇÃO</button>
              </div>

              <div style={{ marginBottom: 12, color: COLORS.muted, fontWeight: 700 }}>PIN de acesso</div>
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Digite o PIN"
                style={{ width: '100%', height: 44, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: '0 12px' }}
              />

              {pinError ? (
                <div style={{ marginTop: 10, color: COLORS.red, fontWeight: 700 }}>{pinError}</div>
              ) : null}

              <button
                onClick={handleLogin}
                style={{
                  marginTop: 16,
                  width: '100%',
                  height: 48,
                  borderRadius: 14,
                  border: 'none',
                  background: COLORS.blue,
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Entrar com PIN
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const panelHeader = (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 24,
        padding: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div>
        <div
          style={{
            display: 'inline-block',
            background: COLORS.blueSoft,
            color: COLORS.blue,
            borderRadius: 999,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Gestor Conexão
        </div>
        <h1 style={{ margin: '12px 0 8px', color: COLORS.blue }}>
          {screen === 'admin' ? 'Painel da administração' : screen === 'reception' ? 'Painel da recepção' : 'Acesso do professor'}
        </h1>
      </div>

      <button
        onClick={logout}
        style={{
          height: 42,
          borderRadius: 14,
          border: `1px solid ${COLORS.border}`,
          background: '#fff',
          padding: '0 16px',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Sair
      </button>
    </div>
  );

  return (
    <main style={{ minHeight: '100vh', background: COLORS.bg, padding: 24 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gap: 24 }}>
        {panelHeader}

        {(screen === 'admin' || screen === 'reception') && (
          <>
            <div style={{ background: '#fff', borderRadius: 24, border: `1px solid ${COLORS.border}`, padding: 20 }}>
              <h2 style={{ color: COLORS.blue }}>Cadastro de alunos matriculados</h2>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                <input placeholder="Nome completo" value={studentForm.nome} onChange={(e) => setStudentForm({ ...studentForm, nome: e.target.value })} />
                <input placeholder="Celular" value={studentForm.telefone} onChange={(e) => setStudentForm({ ...studentForm, telefone: maskPhone(e.target.value) })} />
                <input placeholder="E-mail" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} />
                <input placeholder="CPF" value={studentForm.cpf} onChange={(e) => setStudentForm({ ...studentForm, cpf: maskCPF(e.target.value) })} />
                <input type="date" value={studentForm.data_nascimento} onChange={(e) => setStudentForm({ ...studentForm, data_nascimento: e.target.value })} />
                <input type="date" value={studentForm.data_inicio} onChange={(e) => setStudentForm({ ...studentForm, data_inicio: e.target.value })} />
                <input placeholder="Endereço" value={studentForm.endereco} onChange={(e) => setStudentForm({ ...studentForm, endereco: e.target.value })} />
                <input placeholder="CEP" value={studentForm.cep} onChange={(e) => setStudentForm({ ...studentForm, cep: maskCEP(e.target.value) })} />
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={studentForm.menor_idade}
                    onChange={(e) => setStudentForm({ ...studentForm, menor_idade: e.target.checked })}
                  />
                  Menor de idade
                </label>
              </div>

              {studentForm.menor_idade && (
                <div style={{ marginTop: 16, display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                  <input
                    placeholder="Nome do responsável"
                    value={studentForm.responsavel_nome}
                    onChange={(e) => setStudentForm({ ...studentForm, responsavel_nome: e.target.value })}
                  />
                  <input
                    placeholder="Celular do responsável"
                    value={studentForm.responsavel_telefone}
                    onChange={(e) => setStudentForm({ ...studentForm, responsavel_telefone: maskPhone(e.target.value) })}
                  />
                </div>
              )}

              <button
                onClick={saveStudent}
                style={{ marginTop: 16, height: 44, padding: '0 18px', borderRadius: 14, border: 'none', background: COLORS.blue, color: '#fff', fontWeight: 700 }}
              >
                Salvar aluno
              </button>
            </div>

            <div style={{ background: '#fff', borderRadius: 24, border: `1px solid ${COLORS.border}`, padding: 20 }}>
              <h2 style={{ color: COLORS.blue }}>Cadastro de experimentais</h2>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                <input placeholder="Nome do aluno" value={experimentalForm.nome} onChange={(e) => setExperimentalForm({ ...experimentalForm, nome: e.target.value })} />
                <input placeholder="Celular" value={experimentalForm.telefone} onChange={(e) => setExperimentalForm({ ...experimentalForm, telefone: maskPhone(e.target.value) })} />
                <input placeholder="E-mail" value={experimentalForm.email} onChange={(e) => setExperimentalForm({ ...experimentalForm, email: e.target.value })} />
                <input type="date" value={experimentalForm.dia_contato} onChange={(e) => setExperimentalForm({ ...experimentalForm, dia_contato: e.target.value })} />
                <input placeholder="Categoria" value={experimentalForm.categoria} onChange={(e) => setExperimentalForm({ ...experimentalForm, categoria: e.target.value })} />
                <input placeholder="Professor de preferência" value={experimentalForm.professor_preferencia} onChange={(e) => setExperimentalForm({ ...experimentalForm, professor_preferencia: e.target.value })} />
                <input placeholder="Dia preferido" value={experimentalForm.dia_preferido} onChange={(e) => setExperimentalForm({ ...experimentalForm, dia_preferido: e.target.value })} />
                <input placeholder="Período preferido" value={experimentalForm.periodo_preferido} onChange={(e) => setExperimentalForm({ ...experimentalForm, periodo_preferido: e.target.value })} />
                <input placeholder="Horário que pode fazer" value={experimentalForm.horario_pode_fazer} onChange={(e) => setExperimentalForm({ ...experimentalForm, horario_pode_fazer: e.target.value })} />
                <input placeholder="Dia e horário da aula experimental" value={experimentalForm.dia_horario_aula_experimental} onChange={(e) => setExperimentalForm({ ...experimentalForm, dia_horario_aula_experimental: e.target.value })} />
              </div>

              <button
                onClick={saveExperimental}
                style={{ marginTop: 16, height: 44, padding: '0 18px', borderRadius: 14, border: 'none', background: COLORS.blue, color: '#fff', fontWeight: 700 }}
              >
                Salvar experimental
              </button>
            </div>

            <div style={{ background: '#fff', borderRadius: 24, border: `1px solid ${COLORS.border}`, padding: 20 }}>
              <h2 style={{ color: COLORS.blue }}>Alunos matriculados</h2>
              <ul>
                {dbAlunos.map((aluno) => (
                  <li key={aluno.id}>
                    {aluno.nome} — {aluno.telefone || '-'}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ background: '#fff', borderRadius: 24, border: `1px solid ${COLORS.border}`, padding: 20 }}>
              <h2 style={{ color: COLORS.blue }}>Experimentais</h2>
              <ul>
                {dbExperimentais.map((item) => (
                  <li key={item.id} style={{ marginBottom: 10 }}>
                    {item.nome} — {item.telefone || '-'}{' '}
                    <button onClick={() => convertExperimentalToAluno(item)} style={{ marginLeft: 8 }}>
                      Matricular
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {screen === 'teacher' && (
          <div style={{ background: '#fff', borderRadius: 24, border: `1px solid ${COLORS.border}`, padding: 20 }}>
            <h2 style={{ color: COLORS.blue }}>Área do professor</h2>
            <p style={{ color: COLORS.muted }}>
              Estrutura pronta. Depois podemos evoluir com turmas do dia, presença e espelho financeiro.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
