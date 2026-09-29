<template>
  <section class="topanimes-sidebar-block">
    <h2>Top Airing Anime</h2>

    <!-- First item -->
    <div v-if="firstAnime" class="featured-anime">
      <img :src="firstAnime.coverImageUrl" :alt="firstAnime.title" />

      <!-- Shadow overlay -->
      <div class="shadow-fill"></div>

      <div class="featured-anime-rank-container">
        <div class="featured-anime-rank">
          <div class="rank-number">1</div>
        </div>

        <div class="featured-anime-info">
          <div class="featured-anime-title">
            {{ firstAnime.title }}
          </div>

          <div class="featured-anime-views">
            <q-icon name="visibility" size="20px" color="#666" /> {{ firstAnime.viewCount }}
          </div>
        </div>
      </div>
    </div>

    <!-- Rest of the items -->
    <div v-for="(anime, index) in remainingAnimes" :key="anime.id" class="anime-item">
      <div class="anime-item-inner">
        <!-- Rank -->
        <div class="anime-rank">
          {{ index + 2 }}
        </div>

        <!-- Anime content -->
        <div class="anime-content">
          <!-- Image -->
          <div class="anime-image-wrapper">
            <img :src="anime.coverImageUrl" :alt="anime.title" class="anime-image" />
          </div>

          <!-- Info -->
          <div class="anime-info">
            <div class="anime-title">
              {{ anime.title }}
            </div>

            <div class="anime-views">
              <q-icon name="visibility" size="20px" color="#666" />
              {{ anime.viewCount }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import topAnimesSidebar from '@/lib/preBuildScripts/static/top-animes-sidebar.json'

const topAnimes = topAnimesSidebar

const firstAnime = topAnimes[0]
const remainingAnimes = topAnimes.slice(1)
</script>

<style scoped>
.topanimes-sidebar-block {
  background: #1c1c1c;
  border-radius: 10px;
  padding-bottom: 15px;
}

.topanimes-sidebar-block h2 {
  font-weight: bold;
  font-size: 24px;
  padding: 15px 15px;
  margin: 0;
  line-height: 25px;
}

.featured-anime {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  overflow: hidden;
  margin-bottom: 15px;
}

.featured-anime img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

/* Shadow overlay */
.shadow-fill {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  background: linear-gradient(transparent, rgb(0, 0, 0));
}

.featured-anime-rank-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;

  display: flex;
  gap: 15px;

  padding: 10px 15px;

  color: #fff;
  font-size: 12px;

  z-index: 2;
}

.featured-anime-rank {
  display: flex;
  align-items: center;
  gap: 4px;

  border-radius: 3px;
  padding: 3px;

  background: #fff;
  color: #000;

  text-align: center;
  font-size: 20px;
  font-weight: 700;
}

.rank-number {
  border-radius: 10px;
  width: 40px;

  display: flex;
  align-items: center;
  justify-content: center;
}

.featured-anime-info {
  flex: 1;
  min-width: 0;
}

.featured-anime-title {
  font-weight: 700;
  font-size: 16px;
  line-height: 1.3;
}

.featured-anime-views {
  width: 100%;

  display: flex;
  align-items: center;
  gap: 5px;

  font-size: 14px;
  margin-top: 3px;
}

.featured-anime-views svg {
  width: 30px;
  height: 30px;
}
.anime-item {
  margin-bottom: 10px;
}
.anime-item {
  margin-bottom: 15px;
}

.anime-item-inner {
  width: 100%;
  padding: 0 15px;

  display: flex;
  align-items: center;
  column-gap: 15px;
}

.anime-rank {
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  max-width: 50px;
  width: 100%;
  padding: 15px;
  border: 2px solid #666;
  color: #666;

  font-size: 20px;
  text-align: center;
}

.anime-content {
  display: flex;
  column-gap: 15px;

  width: 100%;
  max-width: 85%;
}

.anime-image-wrapper {
  max-width: 20%;
  width: 100%;
}

.anime-image {
  display: block;

  width: 100%;
  height: 80px;

  object-fit: cover;
}

.anime-info {
  width: 100%;
  max-width: 80%;
}

.anime-title {
  max-width: 100%;
  width: 100%;
  line-height: 25px;
  margin-bottom: 5px;
  color: #ababab;
}

.anime-views {
  width: 100%;

  display: flex;
  align-items: center;
  column-gap: 5px;

  font-size: 14px;
  color: #666;
}

.anime-views svg {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
}
</style>
