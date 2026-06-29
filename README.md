
```
VOC_panel
├─ .prettierrc
├─ eslint.config.mjs
├─ nest-cli.json
├─ package-lock.json
├─ package.json
├─ README.md
├─ samm.csv
├─ samplData.json
├─ src
│  ├─ app.controller.ts
│  ├─ app.module.ts
│  ├─ app.service.ts
│  ├─ auth
│  │  ├─ auth.controller.ts
│  │  ├─ auth.module.ts
│  │  ├─ auth.service.ts
│  │  ├─ dto
│  │  │  ├─ login.dto.ts
│  │  │  ├─ refresh.dto.ts
│  │  │  └─ signup.dto.ts
│  │  ├─ guards
│  │  │  ├─ jwt-auth.guard.ts
│  │  │  └─ jwt-refresh.guard.ts
│  │  ├─ jwt.strategy.ts
│  │  └─ refresh.strategy.ts
│  ├─ config
│  │  ├─ config.constant.ts
│  │  ├─ config.service.ts
│  │  └─ model
│  │     ├─ configuration.schema.ts
│  │     └─ env.validation.interface.ts
│  ├─ database
│  │  ├─ data-source.ts
│  │  ├─ database.module.ts
│  │  ├─ database.providers.ts
│  │  └─ migrations
│  │     ├─ create-database.ts
│  │     └─ seed.ts
│  ├─ main.ts
│  ├─ task
│  │  └─ task.service.ts
│  ├─ ticket
│  │  ├─ ticket.entity.ts
│  │  ├─ ticket.module.ts
│  │  └─ ticket.service.ts
│  └─ user
│     ├─ user.entity.ts
│     ├─ user.module.ts
│     └─ user.service.ts
├─ tsconfig.build.json
└─ tsconfig.json

```