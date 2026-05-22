<template>
  <div class="page">
    <div class="about-shell">
      <header class="hero">
        <BackButton @click="goBack" />

        <div class="hero-text">
          <span class="hero-badge">{{ project.badge }}</span>
          <h1>{{ project.title }}</h1>
          <p>
            <strong>{{ project.school }}</strong>
            <span v-if="project.schoolLocation"> — {{ project.schoolLocation }}</span>
            · {{ project.program }}
          </p>
        </div>
      </header>

      <section class="block">
        <article class="content-card">
          <h2>¿Por que surgio?</h2>
          <p>{{ project.origin }}</p>
        </article>
      </section>

      <section class="block">
        <article class="content-card highlight">
          <h2>Objetivo</h2>
          <p>{{ project.objective }}</p>
        </article>
      </section>

      <section class="block">
        <article class="content-card">
          <h2>Diseño y construccion</h2>
          <p>{{ project.design }}</p>
        </article>
      </section>

      <section class="block">
        <div class="block-head">
          <h2>Equipo del proyecto</h2>
        </div>

        <div class="team-lead">
          <span class="team-icon">✨</span>
          <div>
            <strong>{{ project.lead.name }}</strong>
            <span class="team-role">{{ project.lead.role }}</span>
            <p class="team-note">{{ project.lead.note }}</p>
          </div>
        </div>

        <ul class="team-students">
          <li v-for="member in project.students" :key="member.name">
            <strong>{{ member.name }}</strong>
            <span>{{ member.role }}</span>
          </li>
        </ul>

        <div class="team-instructor">
          <span class="team-icon">🎓</span>
          <div>
            <strong>{{ project.instructor.name }}</strong>
            <span class="team-role">{{ project.instructor.role }}</span>
            <p class="team-note">{{ project.instructor.note }}</p>
          </div>
        </div>
      </section>

      <section class="final-cta">
        <p>Explora destinos y arma tu viaje por Santander.</p>
        <button type="button" class="btn-cta" @click="go(AppRoute.explorar())">
          Ir a explorar
        </button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { projectAbout as project } from '@/data/projectAbout.js'
import BackButton from '@/components/BackButton.vue'
import { AppRoute } from '@/router/links.js'

defineOptions({ name: 'AboutPage' })

const router = useRouter()
const go = (routeLocation) => router.push(routeLocation)
const goBack = () => router.back()
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.page {
  overflow-x: hidden;
  padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px));
  background: #f4f4f5;
}

.about-shell {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.hero {
  padding: 24px 20px 28px;
  background: linear-gradient(165deg, #0a0a0a 0%, #1a1a2e 55%, #16213e 100%);
  color: white;
  border-radius: 0 0 28px 28px;
}

.hero-text {
  margin-top: 14px;
}

.hero-badge {
  font-size: 13px;
  opacity: 0.88;
}

.hero-text h1 {
  margin: 8px 0;
  font-size: clamp(1.35rem, 4vw, 2rem);
  line-height: 1.15;
}

.hero-text p {
  margin: 0;
  opacity: 0.88;
  font-size: 0.92rem;
  line-height: 1.5;
}

.block {
  margin: 20px 16px 0;
}

.block-head h2 {
  margin: 0 0 12px;
  font-size: 1.15rem;
}

.content-card {
  background: #fff;
  border-radius: 18px;
  padding: 18px 16px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
}

.content-card.highlight {
  border: 1px solid #e8e8e8;
  background: linear-gradient(135deg, #fafafa, #f4f4f5);
}

.content-card h2 {
  margin: 0 0 8px;
  font-size: 1rem;
}

.content-card p {
  margin: 0;
  line-height: 1.6;
  color: #444;
  font-size: 0.92rem;
}

.team-lead,
.team-instructor {
  display: flex;
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.06);
  margin-bottom: 10px;
}

.team-instructor {
  background: linear-gradient(135deg, #111, #1a1a2e);
  color: #fff;
}

.team-instructor .team-role,
.team-instructor .team-note {
  color: rgba(255, 255, 255, 0.78);
}

.team-icon {
  font-size: 22px;
}

.team-lead strong,
.team-instructor strong {
  display: block;
  font-size: 0.95rem;
}

.team-role {
  font-size: 0.8rem;
  color: #666;
}

.team-note {
  margin: 6px 0 0;
  font-size: 0.82rem;
  color: #777;
  line-height: 1.4;
}

.team-students {
  list-style: none;
  margin: 0 0 10px;
  padding: 0;
  display: grid;
  gap: 8px;
}

.team-students li {
  padding: 12px 14px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
}

.team-students strong {
  display: block;
  font-size: 0.9rem;
}

.team-students span {
  font-size: 0.8rem;
  color: #666;
}

.final-cta {
  margin: 28px 16px;
  padding: 28px 22px;
  border-radius: 22px;
  text-align: center;
  color: #fff;
  background: linear-gradient(165deg, #0a0a0a 0%, #1a1a2e 55%, #16213e 100%);
}

.final-cta p {
  margin: 0;
  opacity: 0.88;
}

.btn-cta {
  margin-top: 14px;
  border: none;
  background: #fff;
  color: #111;
  padding: 12px 22px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

@media (min-width: 1024px) {
  .hero {
    padding: 32px 40px 36px;
    border-radius: 0 0 32px 32px;
  }

  .block,
  .final-cta {
    margin-left: 32px;
    margin-right: 32px;
  }

  .team-students {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
