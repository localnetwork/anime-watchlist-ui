<template>
  <section class="hero-slider">
    <q-carousel
      v-model="slide"
      animated
      infinite
      arrows
      transition-prev="slide-right"
      transition-next="slide-left"
      class="hero-carousel"
    >
      <q-carousel-slide
        v-for="anime in animeList"
        :key="anime.id"
        :name="String(anime.id)"
        :img-src="anime.coverImageUrl"
        class="hero-slide"
      >
        <div class="hero-overlay">
          <div class="hero-content">
            <h1 class="hero-title">
              {{ anime.title }}
            </h1>

            <p class="hero-description">
              {{ anime.description }}
            </p>

            {{ console.log(anime) }}
            <div class="hero-airdate">
              Aired Date: {{ formatDate(anime.airedFrom) }} to {{ formatDate(anime.airedTo) }}
            </div>
          </div>
        </div>
      </q-carousel-slide>
    </q-carousel>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import topAnimes from '@/lib/preBuildScripts/static/top-animes.json'

const animeList = topAnimes

const slide = ref(String(animeList[0]?.id))

const formatDate = (date) => {
  if (!date) return 'Present'

  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<style scoped>
.hero-slider {
  width: 100%;
}

.hero-carousel {
  height: 520px;
  background: #111111;
}

.hero-slide {
  padding: 0;
  background-position: center;
  background-size: cover;
}

.hero-airdate {
  display: inline-block;
  border-radius: 5px;
  padding: 5px 10px;
  margin-top: 15px;
  font-size: 12px;
  background: #6735ae;
  color: #fff;
}

.hero-overlay {
  position: absolute;
  inset: 0;

  display: flex;
  align-items: flex-end;

  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(0, 0, 0, 0.75) 35%,
    rgba(0, 0, 0, 0.35) 65%,
    rgba(0, 0, 0, 0.1) 100%
  );
}

.hero-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 60px;
  box-sizing: border-box;
}

.hero-title {
  max-width: 650px;
  margin: 0 0 16px;

  color: #ffffff;
  font-size: 25px;
  font-weight: 700;
  line-height: 35px;
}

.hero-description {
  max-width: 600px;
  margin: 0;

  color: #cccccc;
  font-size: 16px;
  line-height: 1.7;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Quasar arrows */
.hero-carousel :deep(.q-carousel__prev-arrow),
.hero-carousel :deep(.q-carousel__next-arrow) {
  z-index: 20;
  top: auto;
  bottom: 50px;
}

.hero-carousel :deep(.q-carousel__next-arrow) {
  right: 30px;
}

.hero-carousel :deep(.q-carousel__prev-arrow) {
  right: 105px;
  left: auto;
}

.hero-carousel :deep(.q-carousel__prev-arrow .q-btn),
.hero-carousel :deep(.q-carousel__next-arrow .q-btn) {
  width: 60px;
  height: 60px;
  min-width: 60px;
  min-height: 60px;
  padding: 15px;

  background: #ffffff;
  color: #b47fff;
  border-radius: 50%;
  box-shadow: none;
}

.hero-carousel :deep(.q-carousel__prev-arrow .q-btn:hover),
.hero-carousel :deep(.q-carousel__next-arrow .q-btn:hover) {
  background: #ffffff;
  color: #b47fff;
  opacity: 0.7;
  box-shadow: none;
}

.hero-carousel :deep(.q-carousel__prev-arrow .q-icon),
.hero-carousel :deep(.q-carousel__next-arrow .q-icon) {
  font-size: 30px;
  color: #b47fff;
}

@media (max-width: 768px) {
  .hero-carousel {
    height: 460px;
  }

  .hero-overlay {
    background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.95) 0%,
      rgba(0, 0, 0, 0.7) 45%,
      rgba(0, 0, 0, 0.15) 100%
    );
  }

  .hero-content {
    padding: 30px 50px 55px;
  }

  .hero-title {
    font-size: 34px;
  }

  .hero-description {
    font-size: 14px;
    line-height: 1.5;
  }
}

@media (max-width: 480px) {
  .hero-carousel {
    height: 430px;
  }

  .hero-content {
    padding: 25px 45px 50px;
  }

  .hero-title {
    font-size: 28px;
  }

  .hero-description {
    -webkit-line-clamp: 2;
  }

  .hero-carousel :deep(.q-carousel__prev-arrow .q-btn),
  .hero-carousel :deep(.q-carousel__next-arrow .q-btn) {
    width: 38px;
    height: 38px;
    min-width: 38px;
    min-height: 38px;
    padding: 8px;
  }

  .hero-carousel :deep(.q-carousel__prev-arrow .q-icon),
  .hero-carousel :deep(.q-carousel__next-arrow .q-icon) {
    font-size: 22px;
  }
}
</style>
