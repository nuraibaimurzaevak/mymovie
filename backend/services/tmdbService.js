const axios = require('axios');

class TMDBService {
  constructor() {
    this.apiKey = process.env.TMDB_API_KEY || '7b9bc40c52751435482a34432b154abb';
    this.baseURL = 'https://api.themoviedb.org/3';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      params: { api_key: this.apiKey, language: 'ru-RU' },
      timeout: 10000
    });
  }

  async getPopularMovies(page = 1) {
    const response = await this.client.get('/movie/popular', { params: { page } });
    return {
      page: response.data.page,
      results: response.data.results,
      total_pages: response.data.total_pages
    };
  }

  async getNowPlaying(page = 1) {
    const response = await this.client.get('/movie/now_playing', { params: { page } });
    return {
      page: response.data.page,
      results: response.data.results,
      total_pages: response.data.total_pages
    };
  }

  async getTopRated(page = 1) {
    const response = await this.client.get('/movie/top_rated', { params: { page } });
    return {
      page: response.data.page,
      results: response.data.results,
      total_pages: response.data.total_pages
    };
  }
}

module.exports = new TMDBService();