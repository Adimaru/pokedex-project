export const API_URL = 'https://pokeapi.co/api/v2/';
export let allPokemonData = []; // Stores data for the current generation
export const pokemonDetailsCache = new Map(); // Cache for faster loading times

export const setAllPokemonData = (data) => {
    allPokemonData = data;
};