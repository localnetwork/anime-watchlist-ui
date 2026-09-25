<template>
  <section class="hero-slider">
    <q-carousel
      v-model="slide"
      animated
      infinite
      arrows
      autoplay="5000"
      transition-prev="slide-right"
      transition-next="slide-left"
      class="hero-carousel"
    >
      <q-carousel-slide
        v-for="anime in animeList"
        :key="anime.id"
        :name="anime.id"
        :img-src="anime.image"
        class="hero-slide"
      >
        <div class="hero-overlay">
          <div class="hero-content">
            <div class="hero-air-date">Air Date: {{ anime.airDate }}</div>

            <h1 class="hero-title">
              {{ anime.title }}
            </h1>

            <p class="hero-description">
              {{ anime.description }}
            </p>
          </div>
        </div>
      </q-carousel-slide>
    </q-carousel>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const slide = ref(1)

const animeList = [
  {
    id: 1,
    title: 'One Piece',
    description:
      'Follow Monkey D. Luffy and his crew as they sail across the Grand Line in search of the legendary One Piece.',
    airDate: 'October 20, 1999',
    image:
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1920&q=80',
  },
  {
    id: 2,
    title: 'Demon Slayer',
    description:
      'Tanjiro Kamado joins the Demon Slayer Corps after tragedy strikes his family, determined to find a cure for his sister.',
    airDate: 'April 6, 2019',
    image:
      'https://images.unsplash.com/photo-1614583224978-fc5c8f8b5e9f?auto=format&fit=crop&w=1920&q=80',
  },
  {
    id: 3,
    title: 'Jujutsu Kaisen',
    description:
      'Yuji Itadori enters the world of jujutsu sorcery after becoming involved with a cursed object of immense power.',
    airDate: 'October 3, 2020',
    image:
      'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1920&q=80',
  },
]
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

.hero-overlay {
  position: absolute;
  inset: 0;

  display: flex;
  align-items: center;

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

.hero-air-date {
  margin-bottom: 12px;
  color: #aaaaaa;
  font-size: 14px;
}

.hero-title {
  max-width: 650px;
  margin: 0 0 16px;

  color: #ffffff;
  font-size: 52px;
  font-weight: 700;
  line-height: 1.05;
}

.hero-description {
  max-width: 600px;
  margin: 0;

  color: #cccccc;
  font-size: 16px;
  line-height: 1.7;

  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Quasar arrows */
/* Next / Previous arrows */
.hero-carousel :deep(.q-carousel__prev-arrow),
.hero-carousel :deep(.q-carousel__next-arrow) {
  z-index: 20;
  bottom: 50px;
  top: auto;
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
} /* Arrow icon */
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
    align-items: flex-end;

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
  }
}
</style>
