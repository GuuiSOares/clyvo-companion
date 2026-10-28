# Clyvo Companion

Aplicativo mobile em **React Native com Expo**, voltado ao **tutor** na clínica veterinária. O Clyvo Companion autentica na API Java com **JWT**, cadastra pets, registra como o animal está em casa e consulta o prontuário com dados persistidos no servidor.

Projeto da disciplina **Mobile Application Development** — Entrega do **4º Sprint**.

---

## Links

| Item | Link |
|------|------|
| Repositório | https://github.com/GuuiSOares/clyvo-companion |
| API Java (Render) | https://challenge-clyvo-companion.onrender.com |
| Swagger | https://challenge-clyvo-companion.onrender.com/swagger-ui/index.html |

---

## Conta de teste (tutor)

| Campo | Valor |
|-------|--------|
| E-mail | `maria@email.com` |
| Senha | `senha123` |
| Perfil | `TUTOR` |

Pets seed da Maria: **Thor** (cachorro) e **Luna** (gato).

A primeira chamada pode levar cerca de **50 segundos** se o Render estiver dormindo. Se um pet criado no app sumir no dia seguinte, o seed da API provavelmente recriou o banco no restart.

---

## Sobre o projeto

O tutor usa o app para:

1. **Entrar** ou **criar conta** na API (`POST /auth/login`, `POST /usuarios`).
2. **Cadastrar, editar e excluir pets** (`/pets`).
3. **Registrar o dia** (peso, alimentação, exercício, temperatura ou frequência cardíaca) em `/logs-saude`, com edição e exclusão — ao salvar, o app dispara uma **notificação local**; ao tocar, abre a aba de registro.
4. **Consultar o prontuário** com o histórico que veio da API.
5. Em **Meu Perfil**: nome/foto locais, **tema** (sistema / claro / escuro), **Sobre o App** (hash do commit da build) e sair da conta.

Nome e foto ficam só no aparelho. Login, pets e registros do dia passam pela API. A autenticação usa **JWT** (tokens no SecureStore, com renovação automática).

---

## Tecnologias

| Tecnologia | Uso no projeto |
|------------|----------------|
| [Expo](https://expo.dev) (~54) | Toolchain e execução do app |
| [React Native](https://reactnative.dev) | Interface mobile |
| [React Navigation](https://reactnavigation.org) | Tabs + stacks |
| [TanStack Query](https://tanstack.com/query) | Cache e mutações HTTP |
| [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/) | Tokens JWT |
| [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) | Notificação local do registro do dia |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | Perfil de sessão e preferências locais |
| TypeScript | Tipagem do código |

---

## Como executar

A URL da API já está em `src/constants/api.ts`.

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
| Serviços | `src/services/` | HTTP, auth JWT, pets, logs, notificação |
| Navegação | `src/navigation/` | Tabs + stacks (pets e configurações) |
| Tema | `src/theme/` | Claro / escuro / sistema |
| Tipos | `src/types/` | Contratos da API e do app |

Fluxo HTTP: tela → hook (`usePets` / `useHealthLogs`) → serviço (`petApi` / `logSaudeApi`) → `httpClient` com **`Authorization: Bearer`**.

---

## Autenticação (JWT)

- Login: `POST /auth/login` → `accessToken`, `refreshToken`, `expiresIn` + dados do usuário.
- Rotas protegidas: header `Authorization: Bearer <accessToken>`.
- Renovação: `POST /auth/refresh` com `{ refreshToken }` (antes do vencimento e após 401).
- Tokens no **SecureStore**. Perfil da sessão (id, nome, e-mail, perfil) no AsyncStorage.
- **Sair da conta** limpa a sessão local na hora.

---

## Navegação (rotas)

| Rota | Tela | Descrição |
|------|------|-----------|
| Login | `AuthScreen` | Login / cadastro na API |
| Início | `HomeScreen` | Painel do tutor e último registro |
| Meus Pets | `PetsList` | CRUD de pets |
| Detalhes do Pet | `PetDetails` | Dados do pet e histórico de logs |
| Registro do dia | `CheckinScreen` | CRUD de acompanhamento + notificação local |
| Prontuário | `ProfileScreen` | Lista de pets da API |
| Meu Perfil | `SettingsScreen` | Nome/foto, tema, sair |
| Sobre o App | `AboutScreen` | Hash do commit da versão |

---

## CRUDs na API

- **Pets:** `GET/POST/PUT/DELETE /pets`
- **Logs de saúde:** `GET/POST/PUT/DELETE /logs-saude`

---

## Estrutura do projeto

```
├── App.tsx                 # Auth gate + tabs + QueryClient + tema
├── app.config.js           # Hash do commit + plugins Expo
├── metro.config.js         # Resolução do módulo util (expo-notifications)
├── src/
│   ├── screens/            # Telas do app
│   ├── components/         # UI reutilizável
│   ├── navigation/         # PetsNavigator + SettingsNavigator
│   ├── services/           # HTTP, auth, pets, logs, notificação
│   ├── hooks/              # TanStack Query
│   ├── context/            # AuthContext
│   ├── theme/              # ThemeProvider, cores claro/escuro
│   ├── constants/          # URL da API, espécies, storage
│   ├── types/              # Tipos TypeScript
│   ├── setup/              # Ajustes de runtime (Expo Go)
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
