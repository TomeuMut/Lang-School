<script setup lang="ts">
import type { Attempt } from '../utils/practice'
import { dailyProgress } from '../utils/progression'
const props = defineProps<{ attempts: Attempt[]; scope: string }>()
const days = computed(() => dailyProgress(props.attempts))
const maximum = computed(() => Math.max(1, ...days.value.map(day => day.count)))
</script>

<template>
  <section class="exercise-panel mb-6" aria-labelledby="progression-title">
    <h2 id="progression-title">Tu progresión diaria</h2>
    <p class="muted mt-2">{{ scope }} · Últimos 14 días · Prácticas completadas por día.</p>
    <p v-if="!days.some(day => day.count)" class="mt-5" role="status">Todavía no hay prácticas en este periodo. Completa un ejercicio para empezar tu gráfico.</p>
    <figure v-else class="mt-5">
      <svg viewBox="0 0 700 210" role="img" aria-labelledby="chart-title chart-description" class="progression-chart">
        <title id="chart-title">Prácticas diarias de {{ scope }}</title>
        <desc id="chart-description">Altura proporcional al número de prácticas, desde cero hasta {{ maximum }}. Consulta las fechas y los aciertos en la tabla inferior.</desc>
        <line x1="28" y1="175" x2="695" y2="175" stroke="currentColor" />
        <text x="0" y="20" font-size="13" fill="currentColor">{{ maximum }}</text>
        <text x="8" y="175" font-size="13" fill="currentColor">0</text>
        <g v-for="(day, index) in days" :key="day.date">
          <rect :x="34 + index * 47" :y="175 - day.count / maximum * 150" width="29" :height="day.count / maximum * 150" rx="3" fill="#255b46"><title>{{ day.label }}: {{ day.count }} prácticas</title></rect>
          <text v-if="index === 0 || index === 6 || index === 13" :x="34 + index * 47" y="200" :text-anchor="index === 13 ? 'end' : 'start'" font-size="13" fill="currentColor">{{ day.label }}</text>
        </g>
      </svg>
      <figcaption class="muted mt-2">Cada intento cuenta como práctica. Los aciertos solo incluyen preguntas con corrección automática.</figcaption>
    </figure>
    <details class="mt-5">
      <summary>Ver fechas, prácticas y aciertos</summary>
      <table class="progression-table"><caption class="sr-only">Progresión de {{ scope }} en los últimos 14 días</caption><thead><tr><th scope="col">Fecha</th><th scope="col">Prácticas</th><th scope="col">Aciertos</th></tr></thead><tbody><tr v-for="day in days" :key="day.date"><th scope="row">{{ day.label }}</th><td>{{ day.count }}</td><td>{{ day.accuracy === null ? 'Sin nota' : `${day.accuracy}% (${day.correct}/${day.objective})` }}</td></tr></tbody></table>
    </details>
  </section>
</template>

<style scoped>
.progression-chart { display: block; width: 100%; height: auto; color: #253b32; }
.progression-table { width: 100%; border-collapse: collapse; margin-top: 16px; font-variant-numeric: tabular-nums; }
.progression-table th, .progression-table td { padding: 10px 4px; text-align: left; border-bottom: 1px solid #d9dece; }
summary { cursor: pointer; min-height: 44px; padding-block: 12px; }
</style>
