# Clyvo Companion

Aplicativo mobile desenvolvido em **React Native com Expo**, voltado ao **tutor** na clínica veterinária. O Clyvo Companion permite criar conta, completar o perfil, cadastrar pets, registrar como o animal está em casa e consultar o prontuário com dados salvos localmente no aparelho.

Projeto da disciplina **Mobile Application Development** — Entrega do **1º Sprint**.

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/GDVnG_N-)

---

## Links da entrega

| Item | Link |
|------|------|
| Repositório (GitHub Classroom) | https://github.com/2TDSPX/challenge12-clyvo-companion |
| Vídeo demonstrativo (YouTube, não listado) | https://youtu.be/viu-uQ8KbfI |

---

## Sobre o projeto

O tutor usa o app para:

1. **Entrar** com e-mail e senha (primeira vez: criar conta).
2. **Completar o perfil** em Meu Perfil (nome obrigatório, foto opcional).
3. **Cadastrar pets** (nome, espécie, raça, peso, foto opcional).
4. **Registrar o dia** como o pet está se comportando em casa, com prévia em tempo real.
5. **Consultar o prontuário** lista de pets e detalhes com histórico de acompanhamento.

Fluxo progressivo: enquanto o perfil não estiver completo, cadastro de pets, registro e prontuário permanecem bloqueados com orientações na tela.

> **Conta no aparelho:** uma conta por dispositivo. Para testar outro tutor do zero, use **Limpar todos os dados** em Meu Perfil.

---

## Tecnologias

| Tecnologia | Uso no projeto |
|------------|----------------|
| [Expo](https://expo.dev) (~54) | Toolchain e execução do app |
| [React Native](https://reactnative.dev) | Interface mobile |
| [React Navigation](https://reactnavigation.org) | Tabs + stack (7 rotas) |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | Persistência local |
| [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) | Foto do tutor e dos pets |
| TypeScript | Tipagem do código |

---

## Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (LTS recomendado)
- npm
- [Expo Go](https://expo.dev/go) no celular **ou** Android Studio / Xcode para emulador

### Instalação

```bash
git clone https://github.com/2TDSPX/challenge12-clyvo-companion.git
cd challenge12-clyvo-companion
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

## Navegação (rotas)

O app utiliza **React Navigation** com **5 abas** e **stack** em Meus Pets — **7 telas navegáveis** no total:

| Rota | Tela | Descrição |
|------|------|-----------|
| Login | `AuthScreen` | Entrar ou criar conta (e-mail e senha) |
| Início | `HomeScreen` | Painel do tutor e resumo na clínica |
| Meus Pets | `PetsList` | Lista e cadastro de pets |
| Detalhes do Pet | `PetDetails` | Foto, peso, sobre e acompanhamento |
| Registro do dia | `CheckinScreen` | Formulário diário com prévia em tempo real |
| Prontuário | `ProfileScreen` | Lista de pets para ver detalhes |
| Meu Perfil | `SettingsScreen` | Perfil do tutor, sair da conta, limpar dados |

---

## Formulários e `useState`

Há formulários com campos controlados por **`useState`** em várias telas.

- Seleção de pet, comportamento (dropdown) e observações.
- Card **“Prévia do que será enviado”** atualiza **enquanto o usuário preenche**.
- Botão **Salvar** grava no AsyncStorage e limpa os campos.

Outros formulários: cadastro de pet (modal), perfil do tutor, login/cadastro.

---

## Armazenamento local (AsyncStorage)

Dados persistidos e **restaurados ao reabrir o app**:

| Dado | Serviço / chave |
|------|------------------|
| Conta (e-mail/senha) | `src/services/authData.ts` |
| Sessão logada | `@clyvo/authSession` |
| Perfil do tutor | `src/services/tutorData.ts` → `@clyvo/tutorProfile` |
| Lista de pets | `src/services/petData.ts` → `@clyvo/pets` |
| Último registro do dia | `@clyvo/lastCheckin` |

---

## Estrutura do projeto

```
├── App.tsx                 # Navegação principal e auth gate
├── src/
│   ├── screens/            # Telas do app
│   ├── components/         # UI reutilizável (cards, dropdown, layout)
│   ├── navigation/         # PetsNavigator (stack)
│   ├── services/           # AsyncStorage (auth, tutor, pets)
│   ├── context/            # AuthContext
│   ├── constants/          # Espécies, comportamento, chaves storage
│   ├── types/              # Tipos TypeScript
│   ├── theme/              # Cores e estilos comuns
│   └── utils/              # Validação, formatação de peso
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