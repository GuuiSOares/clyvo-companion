# Clyvo Companion

Aplicativo mobile em **React Native com Expo**, voltado ao **tutor** na clínica veterinária. O Clyvo Companion autentica na API Java, cadastra pets, registra como o animal está em casa e consulta o prontuário com dados persistidos no servidor.

Projeto da disciplina **Mobile Application Development** — Entrega do **3º Sprint**.

---

## Links da entrega

| Item | Link |
|------|------|
| Repositório | https://github.com/GuuiSOares/clyvo-companion |
| API Java (Render) | https://challenge-clyvo-companion.onrender.com |
| Swagger | https://challenge-clyvo-companion.onrender.com/swagger-ui.html |
| Vídeo demonstrativo (YouTube, não listado) | https://youtu.be/B5sZ-Tn_EhU |

---

## Conta de teste (tutor)

Conta seed para testar:

| Campo | Valor |
|-------|--------|
| E-mail | `maria@email.com` |
| Senha | `senha123` |
| Perfil | `TUTOR` (`idUsuario: 1`) |

Pets seed da Maria: **Thor** (cachorro) e **Luna** (gato).

A primeira chamada pode levar cerca de **50 segundos** se o Render estiver dormindo. Se um pet criado no app sumir no dia seguinte, o seed da API provavelmente recriou o banco no restart.

---

## Sobre o projeto

O tutor usa o app para:

1. **Entrar** com e-mail e senha na API (`POST /auth/login`).
2. **Cadastrar, editar e excluir pets** (`/pets`).
3. **Registrar o dia** (peso, alimentação, exercício, temperatura ou frequência cardíaca) em `/logs-saude`, com edição e exclusão.
4. **Consultar o prontuário** com o histórico que veio da API.

Nome e foto em **Meu Perfil** ficam só no aparelho. Login, pets e registros do dia passam pela API.

---

## Tecnologias

| Tecnologia | Uso no projeto |
|------------|----------------|
| [Expo](https://expo.dev) (~54) | Toolchain e execução do app |
| [React Native](https://reactnative.dev) | Interface mobile |
| [React Navigation](https://reactnavigation.org) | Tabs + stack (7 rotas) |
| [TanStack Query](https://tanstack.com/query) (5.67.2) | Cache e mutações HTTP |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | Sessão local (e-mail/senha para Basic Auth) |
| TypeScript | Tipagem do código |

---

## Como executar

Nada precisa ser configurado além do Node e do Expo. A URL da API já está no código (`src/constants/api.ts`).

### Pré-requisitos

- [Node.js](https://nodejs.org/) (LTS recomendado)
- npm
- [Expo Go](https://expo.dev/go) no celular **ou** Android Studio / Xcode para emulador

### Instalação

```bash
git clone https://github.com/GuuiSOares/clyvo-companion.git
cd clyvo-companion
npm install
```

### Rodar o app

```bash
npx expo start
```

Depois:

- Escaneie o QR Code com o **Expo Go** (Android/iOS), ou
- Pressione `a` (Android emulator) / `i` (iOS simulator)

Scripts úteis:

```bash
npm run android   # Expo + Android
npm run ios       # Expo + iOS
npm run lint      # ESLint
```

---

## Arquitetura

| Camada | Pasta | Papel |
|--------|-------|--------|
| Telas | `src/screens/` | UI e formulários |
| Hooks | `src/hooks/` | TanStack Query (pets e logs) |
| Serviços | `src/services/` | Cliente HTTP, auth, pets, logs |
| Navegação | `src/navigation/` | Tabs + stack de pets |
| Tipos | `src/types/` | Contratos da API e do app |

Fluxo HTTP: tela → hook (`usePets` / `useHealthLogs`) → serviço (`petApi` / `logSaudeApi`) → `httpClient` com **HTTP Basic** (`email:senha`).

---

## Navegação (rotas)

O app utiliza **React Navigation** com **5 abas** e **stack** em Meus Pets — **7 telas navegáveis** no total:

| Rota | Tela | Descrição |
|------|------|-----------|
| Login | `AuthScreen` | Login na API (conta de teste visível na tela) |
| Início | `HomeScreen` | Painel do tutor e último registro da API |
| Meus Pets | `PetsList` | CRUD de pets na API |
| Detalhes do Pet | `PetDetails` | Dados do pet e histórico de `/logs-saude` |
| Registro do dia | `CheckinScreen` | CRUD de acompanhamento na API |
| Prontuário | `ProfileScreen` | Lista de pets da API |
| Meu Perfil | `SettingsScreen` | Nome/foto locais, sair da conta |

---

## Autenticação e CRUDs

- **Auth real:** `POST /auth/login` na API Java. O app não aceita login só local.
- **CRUD 1 — Pets:** `GET/POST/PUT/DELETE /pets`
- **CRUD 2 — Logs de saúde:** `GET/POST/PUT/DELETE /logs-saude`

A sessão fica no aparelho para reabrir o app sem esperar a API acordar. **Sair da conta** limpa a sessão local na hora (não espera `POST /auth/logout`).

---

## Estrutura do projeto

```
├── App.tsx                 # Auth gate + tabs + QueryClient
├── src/
│   ├── screens/            # Telas do app
│   ├── components/         # UI reutilizável
│   ├── navigation/         # PetsNavigator (stack)
│   ├── services/           # HTTP, auth, pets, logs
│   ├── hooks/              # TanStack Query
│   ├── context/            # AuthContext
│   ├── constants/          # URL da API, espécies, storage
│   ├── types/              # Tipos TypeScript
│   ├── theme/              # Cores e estilos comuns
│   └── utils/              # Validação e mapeamento de logs
└── assets/                 # Logo e ícones
```

---

## Equipe TriCode

| Integrante | RM |
|------------|-----|
| Lucas Silva Gastão Pinheiro | RM563960 |
| Geovanne Coneglian Passos | RM562673 |
| Guilherme Soares de Almeida | RM563143 |

---

## Licença

TriCode - Clyvo Companion.
