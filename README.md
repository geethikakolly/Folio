# Folio - Enterprise Notes & Knowledge Management Platform

A comprehensive learning platform demonstrating enterprise application architecture patterns through a Notes and Knowledge Management system (Evernote-like).

## 🎯 Project Purpose

Folio serves as an **educational reference architecture** teaching enterprise development patterns including:
- Microservices architecture and distributed systems
- Full-stack development (React + TypeScript frontend, Spring Boot backend)
- Database design and ORM patterns (Hibernate/JPA)
- API design best practices (REST with proper HTTP semantics)
- Observability and monitoring (OpenTelemetry, Jaeger, Prometheus, Grafana)
- Infrastructure as Code (Terraform)
- CI/CD automation (Jenkins)
- Container orchestration (Docker & Docker Compose)
- Security and authentication patterns
- Testing strategies (unit, integration, E2E)

## 📚 Documentation

All documentation is in the [docs/](docs/) folder:

- **[docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md)** - High-level architecture, goals, learning outcomes, 6-phase roadmap
- **[docs/TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md)** - Detailed specification including database schema, API contracts, code examples
- **[docs/IMPLEMENTATION_ROADMAP.md](docs/IMPLEMENTATION_ROADMAP.md)** - Week-by-week implementation plan (12 weeks total)
- **[docs/LATEST_UPDATES.md](docs/LATEST_UPDATES.md)** - Summary of recent changes and technology decisions

## 🏗️ Technology Stack

### Backend
- Java 17 LTS with Spring Boot 3.1+
- Spring Data JPA + Hibernate ORM
- PostgreSQL 14+ database
- Redis 7+ caching
- OpenTelemetry for observability
- Maven 3.8+

### Frontend
- TypeScript 5.0+
- React 18+ with Vite 5+
- Redux Toolkit for state management
- Material-UI (MUI) 5+ for components
- React Router v6 for navigation
- React Hook Form + Zod for forms
- OpenTelemetry for frontend tracing

### Infrastructure & DevOps
- Docker & Docker Compose (local development)
- Terraform (AWS & Azure infrastructure)
- Jenkins (7 custom jobs for CI/CD)
- Nginx (reverse proxy)
- OpenTelemetry Collector (observability hub)
- Jaeger (distributed tracing)
- Prometheus + Grafana (metrics & dashboards)

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Java 17+
- Node.js 18+
- Maven 3.8+

### Phase 1: Foundation Setup (Weeks 1-2)

**Backend Scaffolding:**
```bash
cd backend
mvn archetype:generate \
  -DgroupId=com.folio \
  -DartifactId=folio-api \
  -DarchetypeArtifactId=maven-archetype-quickstart \
  -DarchetypeVersion=1.4 \
  -DinteractiveMode=false
```

**Frontend Scaffolding:**
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

**Docker Compose:**
```bash
docker-compose up
```

## 📋 Business Domain

Folio's domain is a modern notes application with:

- **Users** - Authentication and profiles
- **Notebooks** - Organization containers for notes
- **Notes** - Core content with rich text, markdown, versioning
- **Tags** - Categorization with many-to-many relationships
- **Attachments** - Images, PDFs, documents
- **Sharing** - Collaboration with granular permissions
- **Audit Logs** - Compliance and security tracking

## 🎓 Learning Outcomes

By building Folio, developers will understand:

- ✅ Enterprise application architecture and patterns
- ✅ Microservices communication and integration
- ✅ Distributed tracing and observability
- ✅ Infrastructure as Code best practices
- ✅ Automated testing and CI/CD pipelines
- ✅ Security in distributed systems
- ✅ Performance optimization and caching
- ✅ Database design and complex queries

## 📅 Development Timeline

The project is divided into 6 phases over 12 weeks:

1. **Phase 1 (Weeks 1-2)**: Foundation - Scaffolding, database schema, Docker setup
2. **Phase 2 (Weeks 3-4)**: Core APIs - Note, Notebook, Tag operations
3. **Phase 3 (Weeks 5-6)**: Observability - OpenTelemetry, Jaeger, Prometheus, Grafana
4. **Phase 4 (Weeks 7-8)**: Infrastructure - Terraform AWS & Azure modules
5. **Phase 5 (Weeks 9-10)**: CI/CD - Jenkins pipeline and deployment automation
6. **Phase 6 (Weeks 11-12)**: Security & Documentation - Hardening and comprehensive docs

## 🔗 Repository Structure

```
folio/
├── docs/                          # All documentation
│   ├── PROJECT_PLAN.md           # Architecture and overview
│   ├── TECHNICAL_SPEC.md         # Detailed specifications
│   ├── IMPLEMENTATION_ROADMAP.md # Week-by-week plan
│   └── LATEST_UPDATES.md         # Change summary
├── backend/                       # Spring Boot application (Phase 1)
├── frontend/                      # React + TypeScript app (Phase 1)
├── infrastructure/                # Terraform modules (Phase 4)
├── ci-cd/                        # Jenkins jobs (Phase 5)
├── docker-compose.yml            # Local development environment
└── .gitignore
```

## 🤝 Contributing

This is an educational project. Contributions should follow the technical specifications and maintain consistency with the enterprise patterns being demonstrated.

## 📖 References

- Spring Boot: https://spring.io/projects/spring-boot
- React & Vite: https://vitejs.dev/guide/#scaffolding-your-first-vite-project
- OpenTelemetry: https://opentelemetry.io/
- Terraform: https://www.terraform.io/
- Jenkins: https://www.jenkins.io/

---

**Status**: 📋 Planning Phase Complete → Ready for Phase 1 Implementation
