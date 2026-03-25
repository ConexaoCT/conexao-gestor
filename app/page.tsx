export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
      fontFamily: 'Arial'
    }}>
      <div style={{
        background: '#fff',
        padding: 40,
        borderRadius: 20,
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ marginBottom: 10 }}>Gestor Conexão</h1>
        <p>Sistema interno do CT</p>
      </div>
    </main>
  )
}
