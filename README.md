# Acolhe Web

Portal web do **Acolhe**, plataforma de socorro e acompanhamento de pessoas idosas ou com deficiência.
Aqui a **família/rede de cuidadores** e os **médicos** acompanham alertas, remédios, rotina, receitas e consultas.

> O app mobile (pessoa cuidada e cuidadores) fica no repositório `acolhe-app`.

## Tecnologias

- React 19 + TypeScript + Vite
- React Router (rotas e áreas protegidas por perfil)
- TanStack React Query (busca e cache de dados)
- CSS Modules (estilo por componente) + variáveis CSS geradas a partir do tema
- lucide-react (ícones)

## Como rodar

```bash
npm install
cp .env.example .env
npm run dev
```

Abra http://localhost:5173.

Contas de demonstração (senha `12345678`), também disponíveis com um clique na tela de login:

| Perfil | E-mail |
| --- | --- |
| Familiar (Ana, filha da Dona Maria) | `ana@exemplo.com` |
| Médico (Dr. Paulo Mendes) | `paulo@exemplo.com` |

Outros comandos: `npm run build` (gera a versão de produção) e `npm run typecheck`.

## Estrutura de pastas

```
src/
├── theme/          # Cores (colors.ts), tokens e CSS global
├── types/          # Modelos de dados (Patient, Caregiver, EmergencyAlert...)
├── services/       # Camada de dados: uma função por chamada de API
├── mocks/          # Dados simulados usados enquanto não há backend
├── hooks/          # Hooks do React Query (usePatients, useCaregivers, useCare...)
├── contexts/       # AuthContext (login/sessão)
├── routes/         # Rotas, caminhos e proteção por perfil
├── components/
│   ├── ui/         # Componentes genéricos (Button, Card, Modal, Tabs...)
│   ├── domain/     # Componentes do Acolhe (Timeline, AlertsTable, CaregiverFormModal...)
│   └── layout/     # Layout do portal (menu lateral + topo) e grades
├── pages/
│   ├── auth/       # Login
│   ├── family/     # Painel, Alertas, Rotina, Receitas, Rede de cuidadores
│   ├── doctor/     # Pacientes, Perfil do paciente, Nova receita, Agenda, Relatórios
│   └── shared/     # Configurações, 404
└── utils/          # Datas, CSV, armazenamento local
```

## Cores e tema

Todas as cores ficam em **`src/theme/colors.ts`**. Ao iniciar, `applyTheme()` transforma cada cor em uma
variável CSS (`colors.primarySoft` → `var(--color-primary-soft)`), usada pelos arquivos `.module.css`.
Para mudar uma cor no portal inteiro, mude só esse arquivo.

## Integração com o backend

Os dados passam sempre por `src/services/*`. Cada função já tem os dois caminhos:

```ts
async listByPatient(patientId: string) {
  if (!apiConfig.useMocks) return http.get(`/patients/${patientId}/caregivers`); // API real
  return mockResponse(caregivers.filter(...));                                  // simulado
}
```

Para ligar o backend:

1. Defina no `.env`: `VITE_USE_MOCKS=false` e `VITE_API_URL=https://sua-api/api`.
2. Implemente no backend as rotas usadas pelos serviços (os caminhos estão em cada arquivo de `src/services`).
3. As respostas devem seguir os tipos de `src/types`.
4. O token de login é enviado como `Authorization: Bearer <token>` (veja `src/services/http.ts`).

Nenhuma página ou componente precisa mudar.

Pontos a evoluir com o backend:

- **Alertas em tempo real:** hoje `useActiveAlert` consulta a cada 15 s. O ideal é WebSocket/SSE ou push.
- **Assinatura digital de receitas:** hoje é simulada. Na prática, usar um provedor ICP-Brasil.
- **Configurações:** as preferências ainda não são salvas.
